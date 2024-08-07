import { useStore } from "@/store";
import FileIcon from "./FileIcon";

function FoundFiles() {
  const foundFiles = useStore((state) => state.foundFiles);
  return (
    <div className="found_files border border-black">
      {foundFiles.map((f) => <FileIcon file={f} found={true} />)}
    </div>
  );
}

export default FoundFiles;
