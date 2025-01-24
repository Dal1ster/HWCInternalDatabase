import User from "$lib/User";
import { respond } from "$lib/util/response";
import { RequestEvent } from "@sveltejs/kit";

const MARIO_PASSCODE = 'bingbingwahootimes2';

export async function GET(ctx: RequestEvent) {
    const { locals, url } = ctx;

    if(url.searchParams.get('mario') !== MARIO_PASSCODE) {
        return respond(403, { message: 'Nope too early, try again later' });
    }

    const user = new User(locals.session);
    await user.setConditional('reborn', true);

    return respond(200, {}, 'Bing Bing Wahoo');
}