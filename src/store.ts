import { create, StateCreator } from "zustand";
import { formatBackslash } from "./utils";
import { devtools } from "zustand/middleware";

interface navStore {
  path: string;
  displayedPath: string;
  back: () => void;
  updatePath: (path: string) => void;
}

const createNavStore: StateCreator<navStore, [], [], navStore> = (set, get) => ({
  path: "C:\\",
  displayedPath: "C:\\",
  back: () => {
    const spl = get().path.split("\\");
    const is_root = spl.length === 2 && spl[1] === "";
    let is_drive = spl.slice(0, -1).join("\\");

    if (is_root) return;
    if (is_drive.search(/[A-Z]:$/) === 0) is_drive += "\\";

    get().updatePath(is_drive);
  },
  updatePath: (path) =>
    set({ path: formatBackslash(path, true), displayedPath: path }),
});

export const useStore = create<navStore>()(
  devtools((...a) => ({
    ...createNavStore(...a),
  }), { name: "navStore" })
);
