export async function getImageDimensions(src: string) {
    const img = document.createElement('img');
    return new Promise<{ width: number, height: number }>((resolve, reject) => {
        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight
            });
        }
        img.onerror = reject;
        img.src = src;
    }).finally(() => img.remove());
}