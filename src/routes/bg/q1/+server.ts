import { logPasswordAttempt } from "$lib/util/logPasswordAttempt";
import { respond } from "$lib/util/response";
import type { RequestEvent } from "@sveltejs/kit";

export async function POST(ctx: RequestEvent) {
    const data = await ctx.request.json();

    if(typeof data['answer'] !== 'string' || data.answer.trim().length === 0) {
        return respond(400, { url: 'https://www.youtube.com/watch?v=UhntyeMfILg'}, 'UhntyeMfILg');
    }
    
    const offer = data.answer.trim();

    if(offer !== '995') {
        logPasswordAttempt('BaldiGunner Q1', `Failed answer for math quiz 1: ${offer}`);
        return respond(403, { url: 'https://www.youtube.com/watch?v=UhntyeMfILg'}, 'UhntyeMfILg');
    }

    return respond(200, { url: 'https://www.youtube.com/watch?v=YUxvy44Fpog'}, 'YUxvy44Fpog');
}