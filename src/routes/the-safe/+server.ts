import VoteDto from "$lib/classes/dto/vote.dto";
import GroupChallenge from "$lib/classes/GroupChallenge";
import { getClientIp } from "$lib/hooks/handle/requestLogger";
import getGroupChallenge from "$lib/util/getGroupChallenge";
import { respond } from "$lib/util/response";
import { RequestEvent } from "@sveltejs/kit";
import { transformAndValidateSync } from "class-transformer-validator";

const getBaseResponse = (gc: GroupChallenge) => ({
    previousGuess: gc.previousGuess,
    timeLeft: gc.getTimeLeft(),
    votes: gc.box.votes.size,
    lockedIn: false,
    status: 'waiting',
    results: gc.getCachedVoteAggregate()
})

export async function GET(ctx: RequestEvent) {
    const session = ctx.locals.session;
    const groupChallenge = getGroupChallenge();

    const currentVote = ctx.url.searchParams.get('vote');
    const lockedInVote = groupChallenge.box.getVote(session);

    if(groupChallenge.solved) {
        return respond(200, {
            ...getBaseResponse(groupChallenge),
            timeLeft: 0,
            yourVote: currentVote,
            lockedIn: true,
            status: 'solved',
            reward: '/lfs/noaka.mp4',
            title: "What A Stands For [FILE-INT-NOAKA] - Haltmann’s Archives [dSIVxkC0DRo].mp4",
        }, "Your valliant efforts have been successful, now reap your reward.")
    }

    if(typeof lockedInVote === 'undefined' && currentVote !== undefined && groupChallenge.previousGuess !== '00000' && currentVote?.length === 5) { // cycle ended, inform of the results
        if(groupChallenge.previousGuess === '-----') {
            return respond(200, {
                ...getBaseResponse(groupChallenge),
                yourVote: lockedInVote,
                lockedIn: false,
                status: 'unsolved',
            }, `Not enough votes were cast, at least 5 votes are required.`);
        }
        
        return respond(200, {
            ...getBaseResponse(groupChallenge),
            yourVote: lockedInVote,
            lockedIn: false,
            status: 'unsolved',
        }, `The leading guess ${groupChallenge.previousGuess} was incorrect.`);
    }

    if(lockedInVote !== undefined) {
        return respond(200, {
            ...getBaseResponse(groupChallenge),
            yourVote: lockedInVote,
            lockedIn: lockedInVote !== undefined,
            status: 'waiting',
        }, "Your vote has been locked in.")
    }

    return respond(200, {
        ...getBaseResponse(groupChallenge),
        yourVote: lockedInVote,
        lockedIn: lockedInVote !== undefined,
        status: 'waiting',
    })
}

export async function POST(ctx: RequestEvent) {
    const session = ctx.locals.session;
    const groupChallenge = getGroupChallenge();

    const body = await ctx.request.json();
    const data = transformAndValidateSync(VoteDto, body) as VoteDto;

    const vote = data.vote;

    if(groupChallenge.box.getVote(session) !== undefined) {
        return respond(400, {}, "You have already voted");
    }

    groupChallenge.box.addVote(session, vote, getClientIp(ctx));

    return respond(200, {
        ...getBaseResponse(groupChallenge),
        yourVote: vote,
        lockedIn: true,
        status: 'waiting',
    }, "Your vote has been locked in.")

}