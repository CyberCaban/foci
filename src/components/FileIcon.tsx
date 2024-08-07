import { useStore } from "@/store";
import { FileInfo } from "@/types";
import { convertBytes } from "@/utils";
import { open } from "@tauri-apps/api/shell";
import { useEffect, useState } from "react";

interface FileIconProps {
  file: FileInfo;
  found?: boolean;
}

function FileIcon({ file, found = false }: FileIconProps) {
  const [clicked, setClicked] = useState(false);
  const [clickedCoords, setClickedCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const contextClick = () => setClicked(false);

    document.addEventListener("click", contextClick);

    return () => document.removeEventListener("click", contextClick);
  }, []);

  const getFiles = useStore((state) => state.getFiles);

  async function handleDoubleClickOnFile(e, file: FileInfo) {
    if (file.is_dir) {
      getFiles(file.path);
    } else {
      open(file.path);
    }
  }

  function handleClickOnFile(e, file: FileInfo) {
    // console.log(file);
  }

  function handleContextMenuOnFile(e, file: FileInfo) {
    console.log(e);

    e.preventDefault();
    setClicked(true);
    setClickedCoords({ x: e.pageX, y: e.pageY });

    console.log(file);
  }

  async function handleOpenInExplorer(path: string) {
    if (path.includes(".")) {
      return;
    }

    console.log(path);

    await open(path);
  }

  return (
    <tr
      key={`${file.path}`}
      className={
        found ? "flex select-none flex-col hover:bg-slate-100" : `file-wrap`
      }
      onDoubleClick={(e) => handleDoubleClickOnFile(e, file)}
      onClick={(e) => handleClickOnFile(e, file)}
      onContextMenu={(e) => handleContextMenuOnFile(e, file)}
    >
      <td className="flex flex-row truncate">
        <span>{file.is_dir ? "📁" : "📄"}</span>
        <div className={`${file.is_dir ? "folder" : "file"}`}>{file.name}</div>
      </td>
      <td className="file-size">
        {file.is_dir ? "" : convertBytes(file.size)}
      </td>
      {found ? <span className="mx-2 truncate">{file.path}</span> : null}
      {clicked ? (
        <div
          className="absolute bg-gray-500 py-1 px-2 rounded-sm"
          style={{
            top: clickedCoords.y,
            left: clickedCoords.x,
          }}
        >
          {file.is_dir ? (
            <button onClick={() => handleOpenInExplorer(file.path)}>
              Open in explorer
            </button>
          ) : null}
          <hr className="my-0.5" />
          <button onClick={() => setClicked(false)}>Close</button>
        </div>
      ) : null}
    </tr>
  );
}

export default FileIcon;
