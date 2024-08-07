import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import FileIcon from "./components/FileIcon";
import FileLayout from "./components/FilesLayout";
import NavBar from "./components/NavBar";
import Volumes from "./components/Volumes";
import "./index.css";
import { useStore } from "./store";
import { FileInfo } from "./types";

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

      <FileLayout />

      <Toaster position="bottom-right" />
    </main>
  );
}

export default App;
