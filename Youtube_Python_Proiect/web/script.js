window.onload = function() {
    window.resizeTo(610, 400);
    window.moveTo(100, 100);
    /*window.onresize = function() {
        window.resizeTo(600, 400);
      };*/
}

let pass = 0;

let selectedDirectory = '';

eel.get_default_download_directory()(function(directory) {
    console.log("Default Download Directory: " + directory);
    selectedDirectory = directory;
});

function updateProgress(percent) {
    const download_bar = document.querySelector('.download_progress');
    const download_container = document.querySelector('.download_container');
    if(percent == 100.0 && pass!=1){
        pass = pass + 1;
    }
    else if(percent == 100.0 && pass == 1){
        download_container.style.display= 'none';
    }
    console.log("Download Progress:", percent);
    download_bar.style.width = `${percent}%`;
}

eel.expose(updateProgress);

document.addEventListener('DOMContentLoaded', () => {
    const skeletons = document.querySelectorAll('.sk_all');
    const skeleton_container = document.querySelector('.skeleton_container');
    const button = document.getElementById('search_button');
    const buttonD = document.getElementById('folder_button');
    const downloadLocationEl = document.querySelector('.download_location');
    const buttonV = document.getElementById('video_dwnld');
    const buttonA = document.getElementById('audio_dwnld');
    const input = document.querySelector('.submit_input');
    const errorContainer = document.querySelector('.error_container');
    const mainContainer = document.querySelector('.main_container');
    const videoContainer = document.querySelector('.video_container');
    const thumbnailElement = document.querySelector('.thumbnail');
    const thumbnailBlurredElement = document.querySelector('.blurred');
    const thumbnailContainer = document.querySelector('.thumbnail_container');
    const titleElement = document.querySelector('.video_title');
    const authorElement = document.querySelector('.video_author');
    const downloadOptions = document.querySelector('.download_options');
    const download_bar = document.querySelector('.download_progress');
    const download_container = document.querySelector('.download_container');

    console.log(selectedDirectory)
    downloadLocationEl.textContent = selectedDirectory;

    const setDownloadFile = () => {
        console.log('Opening folder selection dialog...');
        // Call the Python function to open the directory dialog
        eel.open_directory_dialog()(function(folder_path) {
            console.log('Folder selection callback triggered');
            if (folder_path) {
                selectedDirectory = folder_path;
                console.log('Selected directory:', selectedDirectory);
                downloadLocationEl.textContent = selectedDirectory;
            }
        });
    };
    buttonD.addEventListener('click', setDownloadFile);

    input.addEventListener('input', () => {
        errorContainer.style.display = 'none';
        mainContainer.style.paddingTop = '140px';
        // videoContainer.style.display = 'none';
        thumbnailContainer.style.display = 'none';
        thumbnailElement.src = '';
        thumbnailElement.style.display= 'none';
        thumbnailBlurredElement.src =  '';
        thumbnailBlurredElement.style.display= 'none';
        downloadOptions.style.display= 'none';
        titleElement.textContent = '';
        authorElement.textContent = '';
        download_container.style.display= 'none';
        skeleton_container.style.paddingTop = '0px';
        hideSkeletons();
    });


    const logInputValue = () => {
        const inputValue = input.value;
        console.log(`Input value: ${inputValue}`);
        thumbnailContainer.style.display = 'none';
        thumbnailElement.src = '';
        thumbnailElement.style.display= 'none';
        thumbnailBlurredElement.src =  '';
        thumbnailBlurredElement.style.display= 'none';
        downloadOptions.style.display= 'none';
        titleElement.textContent = '';
        authorElement.textContent = '';
        download_container.style.display= 'none';
        skeleton_container.style.paddingTop = '20px';
        showSkeletons();
        mainContainer.style.paddingTop='30px';
    
        eel.receive_text(inputValue)((response) => {
            console.log(response.status)
            if (response.status === 'error') {
                document.querySelector('.error_container').style.display = 'flex';
                mainContainer.style.paddingTop='30px';
                thumbnailContainer.style.display = 'none';
                thumbnailElement.src = '';
                thumbnailElement.style.display= 'none';
                thumbnailBlurredElement.src = '';
                thumbnailBlurredElement.style.display= 'none';
                downloadOptions.style.display= 'none';
                titleElement.textContent = '';
                authorElement.textContent = '';
                download_container.style.display = 'none';
                skeleton_container.style.paddingTop = '20px';
                showSkeletons();
            } else if (response.status === 'error2') {
                document.querySelector('.error_container').style.display = 'flex';
                mainContainer.style.paddingTop='30px';
                thumbnailContainer.style.display = 'none';
                thumbnailElement.src = '';
                thumbnailElement.style.display= 'none';
                thumbnailBlurredElement.src = '';
                thumbnailBlurredElement.style.display= 'none';
                downloadOptions.style.display= 'none';
                titleElement.textContent = '';
                authorElement.textContent = '';
                download_container.style.display = 'none';
                skeleton_container.style.paddingTop = '20px';
                showSkeletons();
            } else {
                pass = 0;
                console.log('Title:', response.title);
                console.log('Thumbnail:', response.thumbnail);
                console.log('Channel:', response.channel_name);
                console.log('Views:', response.view_count);
                document.querySelector('.error_container').style.display = 'none';
                thumbnailContainer.style.display = 'inline-block';
                videoContainer.style.display = 'flex';
                mainContainer.style.paddingTop='30px';
                downloadOptions.style.display= 'flex';
                thumbnailElement.style.display = 'flex';
                thumbnailElement.src = response.thumbnail;
                thumbnailBlurredElement.style.display = 'flex';
                thumbnailBlurredElement.src = response.thumbnail;
                titleElement.textContent = response.title;
                authorElement.textContent = response.channel_name;
                download_container.style.display = 'none';
                skeleton_container.style.paddingTop = '0px';
                hideSkeletons();
            }
        });
    };
    
    button.addEventListener('click', logInputValue);

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          logInputValue();
        }

    });

    const videoDownload = () => {
        console.log('video download');
        pass = 0;
        download_bar.style.width = '0%';
        download_container.style.display = 'flex';
        eel.download_video(selectedDirectory);
    };
    buttonV.addEventListener('click', videoDownload);

    const audioDownload = () => {
        console.log('audio download');
        pass = 1;
        download_bar.style.width = '0%';
        download_container.style.display = 'flex';
        eel.download_audio(selectedDirectory);
    };
    buttonA.addEventListener('click', audioDownload);

    const showSkeletons = () => {
        skeletons.forEach(skeleton => {
            skeleton.style.display = 'flex';
        });
    };

    const hideSkeletons = () => {
        skeletons.forEach(skeleton => {
            skeleton.style.display = 'none';
        });
    };
    

    window.onbeforeunload = () => {
        eel.exit_program();
    };

});