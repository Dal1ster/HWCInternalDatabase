import env from "./env";
import logger from "./logger";

export function postAttemptToWebhook(name: string, text: string) {
    if(!env.ARG_PEANUT_GALLERY_WEBHOOK) {
        logger.error('No ARG_PEANUT_GALLERY_WEBHOOK set, cannot post message', { name, text });
        return;
    }


    return fetch(env.ARG_PEANUT_GALLERY_WEBHOOK, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            "username": name,
            content: text
        })
    }).then((res) => {
        if(res.ok) {
            console.log('Logged password attempt');
        } else {
            console.error('Failed to log password attempt');
            console.error(res);
        }
    }).catch(() => {
        console.error('Failed to log password attempt');
    })
}