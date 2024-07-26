export function formatSlash(path: string, is_forward: boolean = false) {
  if (is_forward) return path.replace(/\//g, "\\");
  return path.replace(/\\/g, "/");
}

export function convertBytes(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}
