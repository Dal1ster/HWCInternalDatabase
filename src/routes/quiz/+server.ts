import User from "$lib/server/classes/User";
import getQuiz from "$lib/server/util/getQuiz";
import { postAttemptToWebhook } from "$lib/server/util/postAttemptToWebhook";
import { respond } from "$lib/server/util/respond";
import type { RequestEvent } from "@sveltejs/kit";

export async function POST(ctx: RequestEvent) {
    const data = await ctx.request.json();
    const quiz = getQuiz();
    const user = new User(ctx.locals.session);

    if(!('answer' in data) || typeof data.answer !== 'string') {
        return respond(400, {}, "You have nothing to offer.");   
    }

    const matched = quiz.check(data.answer.trim());

    if(!matched) {
        postAttemptToWebhook('Oracle2', `Failed offering for oracle2: ${data.answer}`);
        return respond(403, {}, "Your offering is lacking, try again");   
    }

    await user.setConditional(matched.conditionalId, true);

    return respond(200, { correct: true, refreshTarget: matched.refreshTarget }, matched.text || "Correct.");
}