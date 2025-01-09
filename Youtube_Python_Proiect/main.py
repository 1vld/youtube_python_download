import eel
import yt_dlp
import sys
import re
import tkinter as tk
from tkinter import filedialog, PhotoImage
import os

eel.init('web')

last_video_url = None


script_directory = os.path.dirname(__file__)
ffmpeg_location = os.path.join(script_directory, 'ffmpeg', 'ffmpeg.exe')
default_download_directory = os.path.join(script_directory, 'Downloads')

if not os.path.exists(default_download_directory):
    os.makedirs(default_download_directory)

download_directory = default_download_directory

@eel.expose
def get_default_download_directory():
    return default_download_directory

@eel.expose
def open_directory_dialog():
    try:
        root = tk.Tk()
        root.withdraw()
        my_icon = PhotoImage(file='web/icon/app_logo.png')
        root.iconphoto(False, my_icon)
    
        folder_selected = filedialog.askdirectory(title="Select Download Directory")
        if folder_selected:
            print(f"Python: Folder selected: {folder_selected}")
            return folder_selected
        else:
            print("Python: No folder selected.")
            return None
        
    except Exception as e:
        print(f"Error setting icon: {e}")

@eel.expose
def receive_text(text):
    print(f"Received video URL: {text}")

    global last_video_url
    last_video_url = text

    if not last_video_url:
        return {'status': 'error', 'message': 'No URL provided'}

    try:
        video_url = last_video_url
        ydl_opts = {
            'quiet': True,
            'skip_download': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)

        print(f"Video Info: {info}")

        channel_name = info.get('uploader', 'Unknown channel')
        title = info.get('title', 'Unknown title')
        thumbnail = info.get('thumbnail', 'No thumbnail available')
        view_count = info.get('view_count', 'Views not available')

        print(f"Title: {title}")
        print(f"Thumbnail: {thumbnail}")
        print(f"Channel: {channel_name}")
        print(f"Views: {view_count}")

        return {'status': 'success', 'title': title, 'thumbnail': thumbnail, 'channel_name': channel_name, 'views': view_count}
    
    except yt_dlp.DownloadError as e:
        print(f"Download error: {e}")
        return {'status': 'error2', 'message': f"Download error: {str(e)}"}

    except Exception as e:
        print(f"Unexpected error: {e}")
        return {'status': 'error', 'message': f"Unexpected error: {str(e)}"}

def progress_hook(d):
    if d['status'] == 'downloading':
        raw_percent = d.get('_percent_str', '0%').strip()
        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        clean_percent = ansi_escape.sub('', raw_percent)

        numeric_percent = float(clean_percent.replace('%', '').strip())
        print(f"Download Progress: {numeric_percent}")
        eel.updateProgress(numeric_percent)

@eel.expose
def download_video(download_directory):
    global last_video_url
    if not last_video_url:
        return {'status': 'error', 'message': 'No video URL provided'}
    
    video_url = last_video_url

    print("Downloading Video")
    try:
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
            'extractaudio': True,
            'audioformat': 'mp4',
            'outtmpl': os.path.join(download_directory, '%(title)s.%(ext)s'),
            'ffmpeg_location': ffmpeg_location,
            'verbose': True,
            'progress_hooks': [progress_hook],
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
            print(video_url)
            return "Download complete!"
    
    except Exception as e:
        return f"An error occurred: {str(e)}"

@eel.expose    
def download_audio(download_directory):
    global last_video_url
    if not last_video_url:
        return {'status': 'error', 'message': 'No video URL provided'}
    
    video_url = last_video_url

    print("Downloading Audio")
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'extractaudio': True,
            'audioformat': 'mp4',
            'outtmpl': os.path.join(download_directory, '%(title)s.%(ext)s'),
            'ffmpeg_location': ffmpeg_location,
            'verbose': True,
            'progress_hooks': [progress_hook],
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
            print(video_url)
            return "Download complete!"
    
    except Exception as e:
        return f"An error occurred: {str(e)}"

@eel.expose
def exit_program():
    sys.exit()

eel.start('index.html')
