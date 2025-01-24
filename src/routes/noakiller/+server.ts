import { respond } from "$lib/util/response";
import type { RequestEvent } from "@sveltejs/kit";

export function GET(ctx: RequestEvent) {
    if(ctx.url.searchParams.get('noaka') !== 'aHR0cHM6Ly90cmFtcG9saW5lLnR1cmJvd2FycC5vcmcvdHJhbnNsYXRlL3RyYW5zbGF0ZT9sYW5ndWFnZT1ubCZ0ZXh0PW5vYWthLWtleQ==') {
        return respond(403, {});
    }

    return respond(200, { url: "/-solution-.mp4" });
}