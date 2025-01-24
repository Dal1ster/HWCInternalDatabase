export default class GenericFuck {
    private glitchFactor = 0;
    
    constructor(private interval: number) {
        this.fuck = this.fuck.bind(this);
        this.setInterval = this.setInterval.bind(this);
        this.rand = this.rand.bind(this);
        this.increaseGlitchFactor = this.increaseGlitchFactor.bind(this);
    }

    rand(baseProbability: number, multiplier: number) {
        return Math.random() < (baseProbability + (this.glitchFactor * multiplier));

    }

    increaseGlitchFactor(amount = 1) {
        this.glitchFactor += amount;
    }

    fuck() {}

    setInterval() {
        return setInterval(() => this.fuck(), this.interval)
    }
}