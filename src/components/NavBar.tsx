import { useStore } from "@/store";
import { formatSlash } from "@/utils";
import { emit, listen } from "@tauri-apps/api/event";
import { FormEvent, useEffect, useRef } from "react";
import throbber from "/throbber.svg";

function NavBar() {
  const [
    displayedPath,
    dirUp,
    getFiles,
    setDisplayedPath,
    setFoundFiles,
    pendingSearch,
    setPendingSearch,
  ] = useStore((state) => [
    state.displayedPath,
    state.dirUp,
    state.getFiles,
    state.setDisplayedPath,
    state.setFoundFiles,
    state.pendingSearch,
    state.setPendingSearch,
  ]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unlistenSearchStatus = listen("search-status", (e) => {
      if (e.payload === "Searching") {
        setPendingSearch(true);
      } else {
        setPendingSearch(false);
      }
      console.log(e);
    });

    return () => {
      unlistenSearchStatus.then((f) => f());
    };
  }, []);

  function handlePathChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // @ts-ignore
    getFiles(formatSlash(e.target.path.value, true));
    // @ts-ignore
    e.target.path.blur();
  }

  async function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // @ts-ignore
    if (searchRef.current?.value === "") return;
    setFoundFiles([]);
    // @ts-ignore
    const search = searchRef.current?.value;
    emit("search-start", { dir: displayedPath, pattern: search });
  }

  function searchClear() {
    emit("search-stop");
    if (searchRef.current === null) return;
    searchRef.current.value = "";
    setFoundFiles([]);
  }

  return (
    <nav>
      <form className="flex flex-col" onSubmit={(e) => handlePathChange(e)}>
        <div className="flex flex-row items-center">
          <button type="button" className="back-btn" onClick={dirUp}>
            {"^"}
          </button>
          <label htmlFor="path" className="">
            {/* {displayedPath} */}
          </label>
          <input
            className="path-input"
            id="path"
            type="text"
            value={displayedPath}
            onChange={(e) => setDisplayedPath(e.target.value)}
            autoComplete="off"
          ></input>
        </div>
      </form>
      <form className="flex flex-row" onSubmit={(e) => search(e)}>
        <input
          className="m-2 border-2 border-black"
          placeholder="Search"
          type="text"
          name="search"
          id="search"
          ref={searchRef}
        />
        {pendingSearch ? (
          <img src={throbber} alt="" />
        ) : (
          <button type="submit" disabled={pendingSearch}>
            Search
          </button>
        )}
        <button className="m-2" type="button" onClick={searchClear}>
          Clear
        </button>
      </form>
    </nav>
  );
}

export default NavBar;
