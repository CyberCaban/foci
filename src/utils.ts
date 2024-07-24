
export function formatSlash(path: string, is_forward: boolean = false) {
    if (is_forward) return path.replace(/\//g, "\\");
    return path.replace(/\\/g, "/");
}