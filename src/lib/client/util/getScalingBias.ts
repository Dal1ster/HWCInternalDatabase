export type Dimensions = {
    width: number;
    height: number;
}
export function getScalingBias(dimensions: Dimensions) {
    const windowRatio = dimensions.width / dimensions.height;
    const screenRatio = window.innerWidth / window.innerHeight;

    return windowRatio > screenRatio ? 'width' : 'height';
}