export function tokenize(t: string) {
    const parts = t.split(/\\+|\/+/);
    return parts.filter(Boolean);
}