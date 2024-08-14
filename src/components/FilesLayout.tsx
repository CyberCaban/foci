import { useStore } from "@/store";
import { FileInfo } from "@/types";
import FileIcon from "./FileIcon";

function FileLayout() {
  const [files, getFiles] = useStore((state) => [state.files, state.getFiles]);
  return (
    <table>
      <colgroup>
        <col></col>
        <col></col>
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
        {files.length > 0 && files.map((file: FileInfo) => (
          <FileIcon key={file.path} file={file} />
        ))}
      </tbody>
    </table>
  );
}

export default FileLayout;
