import { existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import { cwd } from "process";
import env from "../util/env";

const CANARY_FILE_FLAG = resolve(cwd(), 'CANARY_ACCESSED');

export function notifyCanary() {
    if(existsSync(CANARY_FILE_FLAG)) {
        return;
    }

    const { CANARY_WEBHOOK_URL, CANARY_MESSAGE } = env;

    if(!CANARY_WEBHOOK_URL || !CANARY_MESSAGE) {
        console.error('Missing canary webhook url or message');
        return;
    }

    fetch(CANARY_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: CANARY_MESSAGE })
    }).then((res) => {
        if(res.ok) {
            console.log('Notified canary');
            writeFileSync(CANARY_FILE_FLAG, '');
        } else {
            console.error('Failed to notify canary');
            console.error(res);
        }
    }, () => {
        console.error('Failed to notify canary');
    });

}

export function notifyArc2Premiere() {
    const { ARC2_PREMIERE_WEBHOOK_URL, ARC2_PREMIERE_MESSAGE } = env;

    if(!ARC2_PREMIERE_WEBHOOK_URL || !ARC2_PREMIERE_MESSAGE) {
        console.error('Missing arc2 premiere webhook url or message');
        return;
    }

    fetch(ARC2_PREMIERE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: ARC2_PREMIERE_MESSAGE })
    }).then((res) => {
        if(res.ok) {
            console.log('Notified arc2 premiere');
        } else {
            console.error('Failed to notify arc2 premiere');
            console.error(res);
        }
    }, () => {
        console.error('Failed to notify arc2 premiere');
    });
}