import { FormEvent } from "react";
import "./index.css";
import { File } from "./types";
import { open } from "@tauri-apps/api/shell";
import { useStore } from "./store";
import { formatSlash } from "./utils";

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
