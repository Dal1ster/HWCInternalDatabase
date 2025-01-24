import { Session } from "svelte-kit-sessions";
export default class User {
    constructor(private session: Session) {}

    async setConditional(name: string, value: boolean) {
        this.session.data.conditional = this.session.data.conditional || {};
        this.session.data.conditional[name] = value;

        await this.session.save();
    }

    async setChallenge(location: string) {
        this.session.data.challenge = this.session.data.challenge || {};
        this.session.data.challenge[location] = true;

        await this.session.save();
    }

    hasChallenge(location: string) {
        const challenges = this.session.data.challenge || {};
        
        if(challenges[location]) {
            return true;
        }
        
        return false;
    }

    hasConditional(name: string) {
        const conditionals = this.session.data.conditional || {};
        
        if(conditionals[name]) {
            return true;
        }
        
        return false;
    }

}