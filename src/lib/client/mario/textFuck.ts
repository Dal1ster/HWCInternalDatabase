let glitchFactor = 0;

const randGlitch = (chance: number, fMultiplier: number) => Math.random() < (chance + (glitchFactor * fMultiplier)); 
 
function textFuck(text: Element) {
    const innerText = text.getAttribute('data-og-text') || text.innerHTML;
    text.setAttribute('data-og-text', innerText);

    const newText: string[] = [];
    for(const c of [...innerText]) {
        const i = Math.round(Math.random() * (250 - 53) + 33)
        if(randGlitch(0.35, 0.005))
            if(Math.random() > 0.90) {
                for(let j = 0; j < Math.random() * 10; j++)
                    newText.push(String.fromCharCode(i));  
            } else {
                newText.push(String.fromCharCode(i));  
            }
        else 
            newText.push(c)
    }
    return newText.join('');
}

function fuckAllText() {
    const allTextElements = document.querySelectorAll('.resource-label .label');
    for(const e of allTextElements) {
        if(randGlitch(0.01, 0.001)) {
            e.innerHTML = textFuck(e)
        }
    }
}

function unfuckMostText() {
    const allTextElements = document.querySelectorAll('.resource-label .label');
    for(const e of allTextElements) {
        if(randGlitch(0.95, -0.001)) {
            e.innerHTML = e.getAttribute('data-og-text') || e.innerHTML;
        }
    }
}

function textGlitch() {
    fuckAllText();
    setTimeout(unfuckMostText, 50);
}

export function increaseGlitchFactor(amount = 1) {
    glitchFactor += amount;
}

export function startTextGlitch() {
    setInterval(textGlitch, 100)
}

