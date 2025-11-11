// File: api/stream.js (Vercel Serverless Function)

// Dailymotion API Keys
const DM_CONSUMER_KEY = '47fd2e6255a453bcc496';
const DM_CONSUMER_SECRET = '10e6f32c4ea3292dd087723e16786a2fe3c770fc'; // Assuming this is correct

// Vercel Serverless Function Handler
export default async function handler(request, response) {
    // CORS Headers set karna
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', '*');
    
    if (request.method === 'OPTIONS') {
        response.status(204).end();
        return;
    }

    const videoUrl = request.query.videoUrl;

    if (!videoUrl) {
        response.status(400).send('Error 400: "videoUrl" parameter is missing.');
        return;
    }
    
    // Video ID nikalna
    let videoId = null;
    const longMatch = videoUrl.match(/[\/video\/|\/embed\/video\/]([a-zA-Z0-9]+)/);
    if (longMatch) {
        videoId = longMatch[1];
    } else {
        response.status(400).send('Error 400: Invalid Dailymotion URL format.');
        return;
    }

    // Dailymotion API call URL
    const dmApiUrl = `https://api.dailymotion.com/video/${videoId}?fields=stream_url&flags=no_redirect&consumer_key=${DM_CONSUMER_KEY}`;
    
    try {
        const dmResponse = await fetch(dmApiUrl);
        
        if (!dmResponse.ok) {
            console.error("DM API Failed:", dmResponse.status);
            response.status(502).send(`Error 502: DM API Failed. Status: ${dmResponse.status}. Check Keys/Permissions.`);
            return;
        }
        
        const dmData = await dmResponse.json();
        const finalM3u8Url = dmData.stream_url;
        
        if (!finalM3u8Url) {
            response.status(500).send('Error 500: Dailymotion returned data but no stream_url. Video might be Private/Geo-blocked.');
            return;
        }

        // Final M3U8 link par 302 Redirect
        response.redirect(302, finalM3u8Url);
        
    } catch (e) {
        response.status(500).send(`Server Internal Error: ${e.message}`);
    }
}
