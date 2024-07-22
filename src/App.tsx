import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./index.css";
import { File } from "./types";
import { formatBackslash } from "./utils";

function App() {
  const [displayedPath, setDisplayedPath] = useState("C:\\");
  const [path, setPath] = useState("C:\\");
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

  function back() {
    const spl = path.split("\\");
    const is_root = spl.length === 2 && spl[1] === "";
    const is_drive = spl.slice(0, -1).join("\\");

    if (is_root) return;
    if (is_drive.search(/[A-Z]:$/) === 0) setPath(is_drive + "\\");
    else setPath(is_drive);
  }

  function handlePathChange(e) {
    e.preventDefault();
    setPath(formatBackslash(displayedPath, true));
  }

  function handleSelectedFiles(e, file: File) {
    console.log(e);
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
          onDoubleClick={() => {
            file.is_dir && (setPath(file.path), setDisplayedPath(file.path));
          }}
          onClick={(e) => handleSelectedFiles(e, file)}
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
