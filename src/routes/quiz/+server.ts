import User from "$lib/User";
import getQuiz from "$lib/util/getQuiz";
import { logPasswordAttempt } from "$lib/util/logPasswordAttempt";
import { respond } from "$lib/util/response";
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
        logPasswordAttempt('Oracle2', `Failed offering for oracle2: ${data.answer}`);
        return respond(403, {}, "Your offering is lacking, try again");   
    }

    await user.setConditional(matched.conditionalId, true);

    return respond(200, { correct: true, refreshTarget: matched.refreshTarget }, matched.text || "Correct.");
}