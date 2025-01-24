import { tokenize } from "./tokenize";

export default function normalizePath(path: string): string {
    return tokenize(path).join('/');
}