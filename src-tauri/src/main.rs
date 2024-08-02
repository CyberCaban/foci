// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod filesystem;

use filesystem::{get_volumes, read_directory_files, search};
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let _main_window = app.get_window("main").unwrap();
            // let _main_window = Arc::new(Mutex::new(_main_window));
            let win = _main_window.clone();

            search(_main_window, win);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_directory_files,
            get_volumes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
