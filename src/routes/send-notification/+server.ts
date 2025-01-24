import { getPresistentState, schedulePresistentStateSave } from "$lib/util/getPresistentState";
import { notifyArc2Premiere } from "$lib/util/notifyCanary";
import { respond } from "$lib/util/response";
import { RequestEvent } from "@sveltejs/kit";

export function GET(ctx: RequestEvent) {
    const presistentState = getPresistentState();

    if(!presistentState.get('gamechaps')) {
        notifyArc2Premiere();
        presistentState.set('gamechaps', true);
        schedulePresistentStateSave();
    }

    return respond(200, {});
}