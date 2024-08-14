import { invoke } from "@tauri-apps/api";
import { toast } from "sonner";
import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { FileInfo, VolumesInfo } from "./types";

interface navStore {
  path: string;
  displayedPath: string;
  files: FileInfo[];
  getFiles: (path: string) => void;
  dirUp: () => void;
  setDisplayedPath: (path: string) => void;
  setFiles: (files: FileInfo[]) => void; // only for debug
}

interface SearchStore {
  foundFiles: FileInfo[];
  setFoundFiles: (files: FileInfo[]) => void;
  pushFoundFiles: (file: FileInfo) => void;
  pendingSearch: boolean;
  setPendingSearch: (pending: boolean) => void;
}

interface VolumesStore {
  volumes: VolumesInfo[];
  setVolumes: (volumes: VolumesInfo[]) => void;
}

const createNavStore: StateCreator<navStore, [], [], navStore> = (
  set,
  get,
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
    invoke("read_directory_files", { path })
      .then((res) => {
        set({ files: res as FileInfo[], path, displayedPath: path });
      })
      .catch((e) => {
        toast("Error: " + e);
        set({ displayedPath: get().path });
      });
  },
  setDisplayedPath: (path) => {
    set({ displayedPath: path });
  },
  setFiles: (files) => {
    set({ files });
  },
});

const createSearchStore: StateCreator<SearchStore, [], [], SearchStore> = (
  set,
) => ({
  foundFiles: [],
  setFoundFiles: (foundFiles) => set({ foundFiles }),
  pushFoundFiles: (file) => {
    set((state) => ({
      foundFiles: [...state.foundFiles, file],
    }));
  },
  pendingSearch: false,
  setPendingSearch: (pending) => {
    set({ pendingSearch: pending });
  },
});

const createVolumesStore: StateCreator<VolumesStore, [], [], VolumesStore> = (
  set,
) => ({
  volumes: [],
  setVolumes: (volumes) => {
    set({ volumes });
  },
});

export const useStore = create<navStore & SearchStore & VolumesStore>()(
  devtools((...a) => ({
    ...createNavStore(...a),
    ...createSearchStore(...a),
    ...createVolumesStore(...a),
  })),
);
