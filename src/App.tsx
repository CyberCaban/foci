import { FormEvent, useEffect, useRef, useState } from "react";
import "./index.css";
import { DiskInfo, File } from "./types";
import { open } from "@tauri-apps/api/shell";
import { useStore } from "./store";
import { convertBytes, formatSlash } from "./utils";
import { invoke } from "@tauri-apps/api";
import { toast, Toaster } from "sonner";
import { emit, listen } from "@tauri-apps/api/event";
import throbber from "/throbber.svg";

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

  const searchRef = useRef<HTMLInputElement>(null);
  const [foundFiles, setFoundFiles] = useState<File[]>([]);
  const [pendingSearch, setPendingSearch] = useState(false);

  useEffect(() => {
    const unlistenFileFound = listen("file-found", (e) => {
      setFoundFiles((f) => [...f, e.payload as File]);
      console.log(e);
    });
    const unlistenSearchStatus = listen("search-status", (e) => {
      if (e.payload === "Searching") {
        setPendingSearch(true);
      } else {
        setPendingSearch(false);
      }
      console.log(e);
    });

    invoke("get_disks")
      .then((res) => setDisks(res as DiskInfo[]))
      .catch((e) => {
        console.error(e);
        toast("Error: " + e);
      });

    getFiles(displayedPath);

    return () => {
      unlistenFileFound.then((f) => f());
      unlistenSearchStatus.then((f) => f());
    };
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

  async function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (searchRef.current?.value === "") return;
    setFoundFiles([]);
    const search = searchRef.current?.value;
    emit("search-start", {dir: displayedPath, pattern: search});
    // invoke("search_in_dir", { dir: displayedPath, pattern: search })
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch((e) => {
    //     console.error(e);
    //     toast("Error: " + e);
    //   });
  }

  function searchClear() {
    emit("test");
    if (searchRef.current === null) return;
    searchRef.current.value = "";
    setFoundFiles([]);
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
        <form className="flex flex-row" onSubmit={(e) => search(e)}>
          <input
            className="m-2 border-2 border-black"
            placeholder="Search"
            type="text"
            name="search"
            id="search"
            ref={searchRef}
          />
          {pendingSearch ? (
            <img src={throbber} alt="" />
          ) : (
            <button type="submit" disabled={pendingSearch}>
              Search
            </button>
          )}
          <button className="m-2" disabled={pendingSearch} type="button" onClick={searchClear}>
            Clear
          </button>
        </form>
      </nav>

      <div className="disks-list">
        {disks.map((d) => (
          <div
            className="disk"
            onDoubleClick={() => getFiles(d.path)}
            key={d.path}
          >
            <span>
              {d.name} ({d.path})
            </span>
          </div>
        ))}
      </div>

      <div className="found_files border border-black">
        {foundFiles?.map((f) => {
          // console.log(f);

          return (
            <div
              key={f.path}
              className="flex select-none flex-col hover:bg-slate-100"
              onDoubleClick={(e) => handleDoubleClickOnFile(e, f)}
            >
              <div className="flex flex-row justify-between">
                <div className="flex flex-row">
                  <span>{f.is_dir ? "📁" : "📄"}</span>
                  <div className={`${f.is_dir ? "folder" : "file"}`}>
                    {f.name}
                  </div>
                </div>
                <span>{f.is_dir ? "" : convertBytes(f.size)}</span>
              </div>
              <span className="mx-2 truncate">{f.path}</span>
            </div>
          );
        })}
      </div>

      {files
        ?.sort((a) => (a.is_dir ? -1 : 1))
        .map((file: File) => (
          <a
            href={`${file.path}`}
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
            <span>{file.is_dir ? "" : convertBytes(file.size)}</span>
          </a>
        ))}

      <Toaster position="bottom-right" />
    </main>
  );
}

export default App;
