import { FormEvent, useEffect, useState } from "react";
import "./index.css";
import { DiskInfo, File } from "./types";
import { open } from "@tauri-apps/api/shell";
import { useStore } from "./store";
import { formatSlash } from "./utils";
import { invoke } from "@tauri-apps/api";
import { toast, Toaster } from "sonner";

function App() {
  const [files, displayedPath, dirUp, getFiles, setDisplayedPath] = useStore(
    (state) => [
      state.files,
      state.displayedPath,
      state.dirUp,
      state.getFiles,
      state.setDisplayedPath,
    ],
  );
  const [disks, setDisks] = useState<DiskInfo[]>([]);

  useEffect(() => {
    invoke("get_disks")
      .then((res) => setDisks(res as DiskInfo[]))
      .catch((e) => {
        console.error(e);
        toast("Error: " + e);
      });

    getFiles(displayedPath);
  }, []);

  function handlePathChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    getFiles(formatSlash(e.target.path.value, true));
    e.target.path.blur();
  }

  function handleClickOnFile(e, file: File) {
    // console.log(file);
  }

  async function handleDoubleClickOnFile(e, file: File) {
    if (file.is_dir) {
      getFiles(file.path);
    } else {
      open(file.path).catch((e) => {
        console.error(e);
        toast("Error: " + e);
      });
    }
  }

  return (
    <main className="App">
      <nav>
        <form className="flex flex-col" onSubmit={(e) => handlePathChange(e)}>
          <div className="flex flex-row items-center">
            <button type="button" className="back-btn" onClick={dirUp}>
              {"^"}
            </button>
            <label htmlFor="path" className="">
              {/* {displayedPath} */}
            </label>
            <input
              className="path-input"
              id="path"
              type="text"
              value={displayedPath}
              onChange={(e) => setDisplayedPath(e.target.value)}
              autoComplete="off"
            ></input>
          </div>
        </form>
      </nav>

      <div className="disks-list">
        {disks.map((d) => (
          <div className="disk" onDoubleClick={() => getFiles(d.path)}>
            <span>
              {d.name} ({d.path})
            </span>
          </div>
        ))}
      </div>

      {files
        ?.sort((a) => (a.is_dir ? -1 : 1))
        .map((file: File) => (
          <a
            href={`#${file.path}`}
            key={`${file.name}`}
            className={`file-wrap`}
            onDoubleClick={(e) => handleDoubleClickOnFile(e, file)}
            onClick={(e) => handleClickOnFile(e, file)}
          >
            <div className="flex flex-row">
              <span>{file.is_dir ? "📁" : "📄"}</span>
              <div className={`${file.is_dir ? "folder" : "file"}`}>
                {file.name}
              </div>
            </div>
            <span>{file.is_dir ? "" : file.size}</span>
          </a>
        ))}

      <Toaster position="bottom-right" />
    </main>
  );
}

export default App;
