import { create, StateCreator } from "zustand";
import { formatSlash } from "./utils";
import { devtools } from "zustand/middleware";
import { invoke } from "@tauri-apps/api";
import { File } from "./types";

interface navStore {
  path: string;
  displayedPath: string;
  files: File[];
  getFiles: (path: string) => void;
  back: () => void;
  setDisplayedPath: (path: string) => void;
}

const createNavStore: StateCreator<navStore, [], [], navStore> = (
  set,
  get
) => ({
  path: "C:\\",
  displayedPath: "C:\\",
  files: [],
  back: () => {
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
        set({ files: res as File[], path: path, displayedPath: path });
      })
      .catch((e) => console.error(e, path));
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
