import { useStore } from "@/store";
import { FileInfo } from "@/types";
import { convertBytes } from "@/utils";
import { open } from "@tauri-apps/api/shell";
import { toast } from "sonner";

interface FileIconProps {
  file: FileInfo;
  found?: boolean;
}

function FileIcon({ file, found = false }: FileIconProps) {
  const getFiles = useStore((state) => state.getFiles);

  async function handleDoubleClickOnFile(e, file: FileInfo) {
    if (file.is_dir) {
      getFiles(file.path);
    } else {
      open(file.path)
    }
  }

  function handleClickOnFile(e, file: FileInfo) {
    // console.log(file);
  }

  return (
    <a
      href={`${file.path}`}
      key={`${file.path}`}
      className={
        found ? "flex select-none flex-col hover:bg-slate-100" : `file-wrap`
      }
      onDoubleClick={(e) => handleDoubleClickOnFile(e, file)}
      onClick={(e) => handleClickOnFile(e, file)}
    >
      <div className="flex flex-row">
        <span>{file.is_dir ? "📁" : "📄"}</span>
        <div className={`${file.is_dir ? "folder" : "file"}`}>{file.name}</div>
      </div>
      <span>{file.is_dir ? "" : convertBytes(file.size)}</span>
      { found ? <span className="mx-2 truncate">{file.path}</span> : null }
    </a>
  );
}

export default FileIcon;
