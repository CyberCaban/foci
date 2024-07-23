import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./index.css";
import { File } from "./types";
import { open } from "@tauri-apps/api/shell";
import { useStore } from "./store";

function App() {
  const [path, back, updatePath] = useStore((state) => [
    state.path,
    state.back,
    state.updatePath,
  ])
  const [displayedPath, setDisplayedPath] = useState("C:\\");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // console.log("files", files);
  }, [files]);

  useEffect(() => {
    getFiles(path);
    setDisplayedPath(path);
  }, [path]);

  async function getFiles(path: string) {
    setFiles(await invoke("read_directory_files", { path }));
  }

  function handlePathChange(e) {
    e.preventDefault();
    updatePath(displayedPath);
  }

  function handleClickOnFile(e, file: File) {
    // console.log(file);
  }

  async function handleDoubleClickOnFile(e, file: File) {
    if (file.is_dir) {
      updatePath(file.path);
    } else {
      console.log(file);
      await open(file.path);
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

      {files?.map((file: File) => (
        <div
          key={`${file.name}`}
          className={`file-wrap `}
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
