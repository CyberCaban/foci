
export function formatBackslash(path: string, is_win: boolean = false) {
    if (is_win) return path.replace(/\//g, "\\");
    return path.replace(/\\/g, "/");
}