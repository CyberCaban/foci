import { useStore } from "@/store";
import { useEffect } from "react";
import FileIcon from "./FileIcon";

function FoundFiles() {
  const foundFiles = useStore((state) => state.foundFiles);

  useEffect(() => {
    console.log(foundFiles);
  }, [foundFiles]);

  if (foundFiles.length === 0) {
    return <div className="found_files border border-black"></div>;
  }
  return (
    <table className="found_files border border-black">
      <colgroup>
        <col />
        <col />
      </colgroup>
      <thead>
        <tr>
          <td>
            <div className="resizeable">Name</div>
          </td>
          <td>
            <div className="resizeable">Size</div>
          </td>
        </tr>
      </thead>
      <tbody>
        {foundFiles.length > 0 &&
          foundFiles?.map((f) => (
            <FileIcon key={f.path} file={f} found={true} />
          ))}
      </tbody>
    </table>
  );
}

export default FoundFiles;
