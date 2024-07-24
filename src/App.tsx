import { FormEvent, useEffect, useState } from "react";
import "./index.css";
import { DiskInfo, File } from "./types";
import { open } from "@tauri-apps/api/shell";
import { useStore } from "./store";
import { formatSlash } from "./utils";
import { invoke } from "@tauri-apps/api";

function App() {
  const [files, displayedPath, back, getFiles, setDisplayedPath] = useStore(
    (state) => [
      state.files,
      state.displayedPath,
      state.back,
      state.getFiles,
      state.setDisplayedPath,
    ]
  );
  const [disks, setDisks] = useState<DiskInfo[]>([]);

  useEffect(() => {
    invoke("get_disks").then((res) => setDisks(res as DiskInfo[]));

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
      open(file.path).catch((e) => console.error(e));
    }
  }

  return (
    <main className="App">
      <nav>
        <form
          className="flex flex-col mx-5"
          onSubmit={(e) => handlePathChange(e)}
        >
          <label htmlFor="path">{displayedPath}</label>
          <div className="flex flex-row">
            <button type="button" className="back-btn" onClick={back}>
              Back
            </button>
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

      <div className="flex flex-row mx-5">
        {disks.map((d) => (
          <div className="flex flex-col select-none hover:bg-slate-100 px-2 py-1" onDoubleClick={() => getFiles(d.path)}>
            <span>{d.name} ({d.path})</span>
          </div>
        ))}
      </div>
      
      {files
        ?.sort((a) => (a.is_dir ? -1 : 1))
        .map((file: File) => (
          <div
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
          </div>
        ))}
    </main>
  );
}

export default App;
