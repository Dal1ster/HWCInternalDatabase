export async function download(url: string, name: string) {
    const response = await fetch(url);
    const blob = await response.blob();

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    
    document.body.appendChild(a);
    
    a.click();

    setTimeout(() => {
        URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
    }, 1000);
}