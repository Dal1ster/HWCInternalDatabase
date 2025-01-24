import GenericFuck from "./genericFuck";

class MarginFuck extends GenericFuck {
    getElements() {
        return document.querySelectorAll('.ccc-terminal-text, .file');
    }

    unfuck() {
        const elements = this.getElements();
        for(const e of elements) {
            e.setAttribute('style', 'margin-left: 0');
        }
    }

    fuck() {
        const elements = this.getElements();
        for(const e of elements) {
            if(this.rand(0.15, 0.01)) {
                e.setAttribute('style', `margin-left: ${Math.random() * 40 - 20}px`)
            } else if(this.rand(0.1, 0.01)) {
                e.setAttribute('style', `margin-top: ${Math.random() * 3}px`)
            }
        }
        setTimeout(this.unfuck.bind(this), 100);
    }
}

export default new MarginFuck(300);