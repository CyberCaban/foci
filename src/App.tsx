import { useEffect } from "react";
import { Toaster } from "sonner";
import FileLayout from "./components/FilesLayout";
import FoundFiles from "./components/FoundFiles";
import NavBar from "./components/NavBar";
import Volumes from "./components/Volumes";
import "./index.css";
import { useStore } from "./store";

function App() {
  const [foundFiles, displayedPath, getFiles, setFoundFiles] = useStore(
    (state) => [
      state.foundFiles,
      state.displayedPath,
      state.getFiles,
      state.setFoundFiles,
    ],
  );

  useEffect(() => {
    getFiles(displayedPath);

    return () => {};
  }, []);

  return (
    <main className="App">
      <NavBar />
      <Volumes />

      <FoundFiles />

      <FileLayout />

      <Toaster position="bottom-right" />
    </main>
  );
}

export default App;
