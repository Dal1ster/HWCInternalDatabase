import { logPasswordAttempt } from "$lib/util/logPasswordAttempt";
import { respond } from "$lib/util/response";
import { RequestEvent } from "@sveltejs/kit";

export async function POST(ctx: RequestEvent) {
    const data = await ctx.request.json();

    if(typeof data['answer'] !== 'string' || data.answer.trim().length === 0) {
        return respond(400, { url: 'https://www.youtube.com/watch?v=UhntyeMfILg'}, 'UhntyeMfILg');
    }
    
    const offer = data.answer.trim();

    if(offer !== '-2πi' && offer !== '−2πi') {
        logPasswordAttempt('BaldiGunner Q2', `Failed answer for math quiz 2: ${offer}`);
        return respond(403, { url: 'https://www.youtube.com/watch?v=UhntyeMfILg'}, 'UhntyeMfILg');
    }

    return respond(200, { url: 'https://www.youtube.com/watch?v=1pAueXMozBs'}, '1pAueXMozBs');
}