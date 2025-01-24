import type { ScalingBias } from "../types/misc";

export function clampWindowSize({ width, height}: { width: number, height: number }, scalingBias: ScalingBias) {
    const { clientWidth, clientHeight } = document.body;

    if(scalingBias === 'width') {
        width = Math.min(width, clientWidth * 0.7);
    }

    if(scalingBias === 'height') {
        height = Math.min(height, clientHeight * 0.7);
    }
    
    return { width, height }
}