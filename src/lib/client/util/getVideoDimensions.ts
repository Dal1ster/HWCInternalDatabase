export async function getVideoDimensions(src: string) {
    const video = document.createElement('video');
    return new Promise<{ width: number, height: number }>((resolve, reject) => {
        video.preload = 'metadata'
        video.onloadedmetadata = () => {
            resolve({
                width: video.videoWidth,
                height: video.videoHeight
            });
        }
        video.onerror = reject;
        video.src = src;
    }).finally(() => video.remove());
}