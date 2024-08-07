import { useStore } from "@/store";
import { VolumesInfo } from "@/types";
import { invoke } from "@tauri-apps/api";
import { useEffect } from "react";
import { toast } from "sonner";

function Volumes() {
  const [volumes, setVolumes, getFiles] = useStore((state) => [
    state.volumes,
    state.setVolumes,
    state.getFiles,
  ]);

  useEffect(() => {
    invoke("get_volumes")
      .then((res) => setVolumes(res as VolumesInfo[]))
      .catch((e) => {
        console.error(e);
        toast("Error: " + e);
      });
  }, []);

  return (
    <div className="disks-list">
      {volumes.map((d) => (
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
  );
}

export default Volumes;
