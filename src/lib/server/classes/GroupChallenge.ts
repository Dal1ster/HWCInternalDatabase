import { Session } from "svelte-kit-sessions";

export default class GroupChallenge {
    solved = false;

    box: BallotBox = new BallotBox();
    previousGuess: string = '99999';

    constructor(private solution: string, private interval: number) {}

    startOfCycle = Date.now();
    scheduleCycle() {
        this.startOfCycle = Date.now();
        setTimeout(() => {
            if(!this.cycle()) {
                this.resetVotes();
                this.scheduleCycle();
            } else {
                this.solved = true;
                console.log('Challenge complete');
            }
        }, this.interval);
    }

    getTimeLeft() {
        const time = this.startOfCycle + this.interval - Date.now();

        if(time > this.interval)
            return this.interval;
        else if(time < 0)
            return 0;
        else
            return time;
    }

    cycle() {
        const winningVotes = this.getWinningVotes();
        const voteCount = this.box.getVoteCount()

        if(voteCount < 5) {
            this.previousGuess = '-----';
            return false; // not enough people voted
        }

        if(this.checkSolution(winningVotes)) {
            this.solved = true;
            this.previousGuess = this.solution;
            return true;
        }
            
        this.previousGuess = winningVotes.pop()?.vote || '00000';

        return false;
    }

    resetVotes() {
        this.box = new BallotBox();
    }

    getWinningVotes() {
        const results = this.box.aggregateVotes();
        if(results.length === 0) return [];

        const sortedResults = results.sort((a, b) => b.count - a.count);
        const winningVotes = sortedResults.filter(result => result.count === sortedResults[0].count);

        return winningVotes;
    }

    checkSolution(winningVotes: AggregatedVote[]) {
        const hasWinningVote = winningVotes.some(vote => vote.vote === this.solution);
        return hasWinningVote;
    }

    private lastCache = 0;
    private cachedVotes: AggregatedVote[] = [];
    getCachedVoteAggregate() {
        if(this.lastCache + 3000 < performance.now()) {
            this.cachedVotes = this.box.aggregateVotes().sort((a, b) => b.count - a.count);
        }

        return this.cachedVotes;
    }
}

class BallotBox {
    votes: Map<string, string> = new Map();
    ipToSession: Map<string, string> = new Map();

    constructor() {}

    addVote(voter: Session, vote: string, ip: string) {
        this.ipToSession.set(ip, voter.id);
        this.votes.set(voter.id, vote);
    }

    getVote(voter: Session) {
        return this.votes.get(voter.id);
    }

    getVoteCount() {
        return this.votes.size;
    }

    aggregateVotes() {
        const results = new Array<AggregatedVote>();
        const resultMap = new Map<string, number>();

        for(const uniqueSessionId of this.ipToSession.values()) {
            const vote = this.votes.get(uniqueSessionId);
            if(!vote) {
                console.log('Given ip-session pair has no corresponding vote');
                continue;
            }
            resultMap.set(vote, (resultMap.get(vote) || 0) + 1);
        }

        for(const [vote, count] of resultMap) {
            results.push({ vote, count });
        }

        return results;
    }
}

type AggregatedVote = { vote: string, count: number };