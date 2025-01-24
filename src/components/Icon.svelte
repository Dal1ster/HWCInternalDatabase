<script lang="ts" context="module">
    import Folder from './icons/folder.svg?raw';
    import FolderOpen from './icons/folder-open.svg?raw';
    import locked from './icons/locked.svg?raw';
    import Image from './icons/image.svg?raw';
    import Document from './icons/text.svg?raw';
	import Executable from './icons/executable.svg?raw';
    import Blank from './icons/blank.svg?raw';
    import Audio from './icons/audio.svg?raw';
    import Video from './icons/video.svg?raw';
    import Url from './icons/url.svg?raw';
    import VolumeLow from './icons/volume-low.svg?raw';
    import VolumeSilent from './icons/volume-silent.svg?raw';
    import Clock from './icons/clock-icon.svg?raw';

    const icons = {
        folder: Folder,
        folderOpen: FolderOpen,
        image: Image,
        video: Video,
        audio: Audio,
        pdf: Document,
        document: Document,
        executable: Executable,
        url: Url,
        archive: Blank,
        locked,
        volumeLow: VolumeLow,
        volumeSilent: VolumeSilent,
        clock: Clock
    }

    export type Icons = keyof typeof icons;
</script>

<script lang="ts">
    export let icon: Icons = 'folder';

    export let width = '24px';
    export let height = '24px';
    export let inline = false;
</script>
<style>
    :global(svg) {
        width: 100%;
        height: 100%;
    }
    
    div {
        padding: 2px;
    }
</style>

<div class="filter-glow" style:min-width={width} style:min-height={height} style:height={height} style:width={width} style:display={inline ? 'inline-block' : 'block'} class:iconName={icon} >
    {@html icons[icon]}
</div>
