<style>
    .bar {
        animation: loading 1s forwards infinite; 
        text-align: center;
        display: inline-block;
        background-color: currentColor;
        height: 1em;
    }
    .bar:after {
        content: '|';
    }

    @keyframes loading {
        0%, 24% {
            transform: rotate(0deg) scale(0.55);
        }
        
        25%, 49% {
            transform: rotate(45deg) scale(0.55);
        }
        
        50%, 74% {
            transform: rotate(90deg) scale(0.55);
        }
        
        75%, 99% {
            transform: rotate(135deg) scale(0.55);
        }
    }
</style>

<div class="bar"></div>