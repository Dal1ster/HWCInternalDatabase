import GenericFuck from "./genericFuck";

class TransformFuck extends GenericFuck {
    getElements() {
        return document.querySelectorAll('.resource-label .label, .sidebar > div, .window-mount > *');
    }

    unfuck() {
        const elements = this.getElements();
        for(const e of elements) {
            e.setAttribute('style', '');
        }
    }

    fuck() {
        const elements = this.getElements();
        for(const e of elements) {
            let transform = '';
            let glitchStack = 0;
            if(this.rand(0.002 + glitchStack, 0.00001)) {
                transform += `rotate(${Math.random() * 75 + 15}deg);tranform-origin:left`
                glitchStack = 0.1;
            }
            if(this.rand(0.002 + glitchStack, 0.00001)) {
                transform = `rotateY(${Math.random() * -50}deg);tranform-origin:left`
                glitchStack = 0.1;
            }
            if(this.rand(0.002 + glitchStack, 0.00001)) {
                transform = `skewX(${Math.random() * 10 + 5}deg);tranform-origin:left`
                glitchStack = 0.1;
            }
            e.setAttribute('style', `transform: ${transform}`);
        }

        setTimeout(() => this.unfuck(), 50);
    }
}

export default new TransformFuck(200);