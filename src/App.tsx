import { FormEvent, useEffect, useRef, useState } from "react";
import "./index.css";
import { VolumesInfo, FileInfo } from "./types";
import { open } from "@tauri-apps/api/shell";
import { useStore } from "./store";
import { convertBytes, formatSlash } from "./utils";
import { invoke } from "@tauri-apps/api";
import { toast, Toaster } from "sonner";
import { emit, listen } from "@tauri-apps/api/event";
import NavBar from "./components/NavBar";
import Volumes from "./components/Volumes";
import FileIcon from "./components/FileIcon";

function App() {
  const [files, displayedPath, getFiles] = useStore((state) => [
    state.files,
    state.displayedPath,
    state.getFiles,
  ]);
  const [foundFiles, setFoundFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    const unlistenFileFound = listen<FileInfo>("file-found", (e) => {
      setFoundFiles((f) => [...f, e.payload as FileInfo]);
      console.log(e);
    });

    getFiles(displayedPath);

    return () => {
      unlistenFileFound.then((f) => f());
    };
  }, []);

  return (
    <main className="App">
      <NavBar />
      <Volumes />

      <div className="found_files border border-black">
        {foundFiles?.map((f) => <FileIcon file={f} found={true} />)}
      </div>

      {files
        .toSorted((a) => (a.is_dir ? -1 : 1))
        .map((file: FileInfo) => (
          <FileIcon key={file.path} file={file} />
        ))}

      <Toaster position="bottom-right" />
    </main>
  );
}

export default App;
