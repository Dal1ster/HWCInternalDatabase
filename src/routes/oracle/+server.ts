import env from "$lib/util/env";
import { logPasswordAttempt } from "$lib/util/logPasswordAttempt";
import { respond } from "$lib/util/response";
import { RequestEvent } from "@sveltejs/kit";

export async function POST(ctx: RequestEvent) {
    const data = await ctx.request.json();

    if(typeof data['offer'] !== 'string' || data.offer.trim().length === 0) {
        return respond(400, {}, 'You have nothing to offer');
    }
    
    const offer = data.offer.trim();

    if(env.WINTER_BREAK) {
        logPasswordAttempt('Oracle', `Failed offering (WINTER_BREAK) for oracle: ${offer}`);
        return respond(403, {}, 'Haltmann Works Company recommends using your unpaid vacation days to spend the Christmas season with your loved ones.');
    }
    
    if(offer !== 'qTnnHaNicGQ/4DuuBX1NQUU/BgZH7R1XaWk') {
        logPasswordAttempt('Oracle', `Failed offering for oracle: ${offer}`);
        return respond(403, {}, 'Your offering is lacking, try again');
    }

    return respond(200, {}, 'Your offer is satisfactory, the question you should be asking is "WhatHappensWhenTheyDie?"');
}