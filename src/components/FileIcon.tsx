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

  async function handleOpenInExplorer(file) {
    if (!file.is_dir) {
      let path = file.path.split("\\").slice(0, -1).join("\\");
      await open(path);
      return;
    }

    await open(file.path);
  }

  const ContextMenu = ({
    clicked,
    file,
  }: {
    clicked: boolean;
    file: FileInfo;
  }) => {
    return (
      <>
        {clicked ? (
          <div
            className="absolute bg-gray-500 py-1 px-2 rounded-sm"
            style={{
              top: clickedCoords.y,
              left: clickedCoords.x,
            }}
          >
            <button onClick={() => handleOpenInExplorer(file)}>
              Open in explorer
            </button>

            <hr className="my-0.5" />

            <button onClick={() => setClicked(false)}>Close</button>
          </div>
        ) : null}
      </>
    );
  };

  return (
    <tr
      key={`${file.path}`}
      className={
        found
          ? "select-none hover:bg-slate-100 max-w-[calc(100vw-2.5rem)]"
          : `file-wrap max-w-[calc(100vw-2.5rem)]`
      }
      onDoubleClick={(e) => handleDoubleClickOnFile(e, file)}
      onClick={(e) => handleClickOnFile(e, file)}
      onContextMenu={(e) => handleContextMenuOnFile(e, file)}
    >
      <td>
        <div className="flex flex-col truncate">
        <div className="flex flex-row items-center truncate">
          <span>{file.is_dir ? "📁" : "📄"}</span>
          <div className={`${file.is_dir ? "folder" : "file"}`}>
            {file.name}
          </div>
        </div>
        {found ? <div className="truncate max-w-[calc(100vw-6rem)]">{file.path}</div> : null}
        </div>
      </td>
      <td className="file-size">
        {file.is_dir ? "" : convertBytes(file.size)}
      </td>
      <ContextMenu clicked={clicked} file={file} />
    </tr>
  );
}

export default FileIcon;
