document.addEventListener('DOMContentLoaded', () => {
    // 1. HTML Elements ko uthana
    const video = document.getElementById('my-video');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const seekBar = document.getElementById('seek-bar');
    const timeDisplay = document.getElementById('time-display');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const playerContainer = document.getElementById('player-container'); 

    // ==========================================================
    // 2. REMOTE VIDEO URL SETTINGS (Vercel Proxy Call)
    // ==========================================================
    
    // 🛑 Zaroori: Vercel par deploy hone ke baad is URL ko badlen!
    // Misaal: https://mera-naya-proxy-9e1f.vercel.app/api/stream
    const vercelProxyUrl = 'https://[APKA-VERCEL-DOMAIN-YAHAN-AAYEGA]/api/stream'; 
    
    // ⚠️ Yahan apni Dailymotion video ka URL dalen
    const originalUrl = 'https://www.dailymotion.com/video/k6DKKtEiwhK7s6E8NRO'; 
    
    // Final URL jo Vercel function ko call karega
    const hlsUrl = `${vercelProxyUrl}?videoUrl=${encodeURIComponent(originalUrl)}`;

    // ==========================================================
    
    // 3. HLS Player ko initialize karna
    if (Hls.isSupported()) {
        console.log("HLS supported. Initializing player with proxy URL:", hlsUrl);
        var hls = new Hls({ enableWorker: true });
        
        hls.loadSource(hlsUrl); 
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            seekBar.max = video.duration;
            updateTimeDisplay();
            video.play().catch(e => console.log("Autoplay blocked:", e)); 
        });
        
        hls.on(Hls.Events.ERROR, function(event, data) {
             console.error('HLS Error:', data);
             playPauseBtn.textContent = 'Error!'; 
        });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support
        console.log("Using native HLS support.");
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', function() {
            seekBar.max = video.duration;
            updateTimeDisplay();
        });
    }

    // 4. Custom Controls aur Utility functions
    playPauseBtn.addEventListener('click', () => {
        if (video.paused || video.ended) {
            video.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            video.pause();
            playPauseBtn.textContent = 'Play';
        }
    });

    video.addEventListener('timeupdate', () => {
        if (document.activeElement !== seekBar) {
            seekBar.value = video.currentTime;
        }
        updateTimeDisplay();
    });

    seekBar.addEventListener('input', () => {
        video.currentTime = seekBar.value;
        updateTimeDisplay();
    });

    fullscreenBtn.addEventListener('click', () => {
        if (playerContainer.requestFullscreen) {
            playerContainer.requestFullscreen();
        } else if (playerContainer.webkitRequestFullscreen) {
            playerContainer.webkitRequestFullscreen();
        } else if (playerContainer.msRequestFullscreen) {
            playerContainer.msRequestFullscreen();
        }
    });
    
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        const parts = [];
        if (h > 0) parts.push(h);
        
        parts.push((h > 0 && m < 10) ? "0" + m : m);
        parts.push(s < 10 ? "0" + s : s);
        
        return parts.join(':');
    }

    function updateTimeDisplay() {
        const current = formatTime(video.currentTime);
        const duration = formatTime(video.duration || 0);
        timeDisplay.textContent = `${current} / ${duration}`;
    }
});
