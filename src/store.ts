import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { invoke } from "@tauri-apps/api";
import { File } from "./types";
import { toast } from "sonner";

interface navStore {
  path: string;
  displayedPath: string;
  files: File[];
  getFiles: (path: string) => void;
  dirUp: () => void;
  setDisplayedPath: (path: string) => void;
}

const createNavStore: StateCreator<navStore, [], [], navStore> = (
  set,
  get
) => ({
  path: "C:\\",
  displayedPath: "C:\\",
  files: [],
  dirUp: () => {
    const spl = get().path.split("\\");
    const is_root = spl.length === 2 && spl[1] === "";
    let is_drive = spl.slice(0, -1).join("\\");

    if (is_root) return;
    if (is_drive.search(/[A-Z]:$/) === 0) is_drive += "\\";

    get().getFiles(is_drive);
  },
  getFiles: async (path) => {
    console.log("get files", path);
    invoke("read_directory_files", { path })
      .then((res) => {
        console.log("then", res);
        set({ files: res as File[], path, displayedPath: path });
      })
      .catch((e) => {
        console.error(e, path);
        toast("Error: " + e);
        set({ displayedPath: get().path});
      });
  },
  setDisplayedPath: (path) => {
    set({ displayedPath: path });
  },
});

export const useStore = create<navStore>()(
  devtools(
    (...a) => ({
      ...createNavStore(...a),
    }),
    { name: "navStore" }
  )
);
