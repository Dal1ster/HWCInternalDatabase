import GroupChallenge from "$lib/server/classes/GroupChallenge";
import env from "../util/env";

const GROUP_CHALLENGE_INTERVAL = 60 * 1000 * 5;

const challenge = new GroupChallenge(env.GROUP_CHALLENGE_CODE || '00000', GROUP_CHALLENGE_INTERVAL)

const voteFraud = false;

if(voteFraud) {
    const candidates = [
        '12312',
        '12315',
        '15512',
        '15810',
        '91724',
        '85187',
        '85187',
        '85187',
        '85187',
        '85187',
        '85187',
        '85187',
        '85187',
        '85187',
        '85187',
        '85187',
        '85187',
        '85187',
        '85187',
        '85187',
    ];
    
    setInterval(() => {
        challenge.box.addVote({ id: Math.random().toString() } as any, candidates[Math.floor(Math.random() * candidates.length)], Math.random().toFixed(5));
    }, 500);

    (challenge as any).interval = (challenge as any).interval / 25;
}

challenge.scheduleCycle();


export default function getGroupChallenge() {
    return challenge;
}