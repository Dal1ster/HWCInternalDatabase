<script></script>

<style>
    div {
        mix-blend-mode: luminosity;
        top: 0;
        left: 0;
        position: absolute;
        width: 100%;
        filter: hue-rotate(200deg);
        opacity: 30%;
        height: 100%;
        background-repeat: repeat;
        background-position-y: 2px;
        animation: move 1s linear 0s forwards infinite;
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAKCAYAAAC0VX7mAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABXSURBVDhPrdKhDYBgDEThKzRIBCuhWQjPRlhWIgENhP7JjfA+9dSJpvEqT4HiUbe7EfEpVzeiBvvZjahBjW5EG5zciBocFjei3XBzI9ofHm5EXMrbDZB+9YgPBHp56akAAAAASUVORK5CYII=');
        pointer-events:none;
        z-index: 9999;
    }
    
    @keyframes move {
        from {
            background-position-y: 0px;
        }
        to {
            background-position-y: 10px;
        }
    }
</style>

<div></div>