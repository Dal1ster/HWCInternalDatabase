<script lang="ts">
	import Icon, { type Icons } from "./Icon.svelte";

    export let label: string;
    export let icon: Icons;
</script>

<style>
    main {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 24px;
        color: #00B9FD;
    }

    main:hover {
        color: #2dd4f1;
    }

    .label {
        word-break: break-word;
    }

</style>

<main class="resource-label">
    <Icon {icon}/>
    <div class="label text-glow">
        {label}
    </div>
    <slot></slot>
</main> 