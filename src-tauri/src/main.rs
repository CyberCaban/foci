// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    collections::btree_map,
    fs,
    ops::Deref,
    path::Path,
    sync::{Arc, Mutex, MutexGuard},
};
use sysinfo::Disks;

use serde::{Deserialize, Serialize};
use tauri::{window, Manager, Window};
use walkdir::WalkDir;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug, Serialize, Clone)]
struct File {
    name: String,
    path: String,
    is_dir: bool,
    size: u64,
}

#[derive(Debug, Serialize, Clone)]
struct DiskInfo {
    name: String,
    path: String,
    free_space: u64,
    total_space: u64,
}

#[derive(Serialize, Clone)]
enum SearchStatus {
    Searching,
    Finished,
}

#[derive(Deserialize, Debug)]
struct SearchParams {
    dir: String,
    pattern: String,
}

#[tauri::command]
fn read_directory_files(path: &str) -> Result<Vec<File>, String> {
    let entries = match fs::read_dir(&path) {
        Ok(entries) => entries,
        Err(e) => {
            println!("Error reading directory {}: {:?}", path, e);
            return Err(e.to_string());
        }
    };

    let mut current_files: Vec<File> = Vec::new();

    for entry in entries {
        if let Ok(entry) = entry {
            if let Ok(meta) = entry.metadata() {
                let file_name = entry.file_name().into_string().unwrap();
                let file_path = entry.path().into_os_string().into_string().unwrap();

                current_files.push(File {
                    name: file_name,
                    path: file_path,
                    is_dir: meta.is_dir(),
                    size: meta.len(),
                })
            }
        }
    }

    Ok(current_files)
}

#[tauri::command]
fn get_disks() -> Vec<DiskInfo> {
    let disks = Disks::new_with_refreshed_list();
    let res: Vec<_> = disks
        .list()
        .iter()
        .map(|disk| DiskInfo {
            name: disk.name().to_str().unwrap().to_string(),
            path: disk.mount_point().to_str().unwrap().to_string(),
            free_space: disk.available_space(),
            total_space: disk.total_space(),
        })
        .collect();

    res
}

fn search_in_dir(window: &Mutex<Window>, dir: String, pattern: String) {
    let pattern = pattern.to_lowercase();
    let window = Arc::new(Mutex::new(window.lock().unwrap().clone()));
    window
        .lock()
        .unwrap()
        .emit("search-status", SearchStatus::Searching)
        .unwrap();

    let (tx, rx) = std::sync::mpsc::channel();

    let thread = std::thread::spawn(move || {
        let entries = WalkDir::new(Path::new(&dir))
            .follow_links(true)
            .into_iter()
            .filter_map(|e| e.ok());

        for entry in entries {
            if let Some(fname) = entry.file_name().to_str() {
                if fname.to_lowercase().contains(&pattern) {
                    let size = if entry.metadata().is_ok() {
                        entry.metadata().unwrap().len()
                    } else {
                        0
                    };

                    let path = if entry.path().to_str().is_some() {
                        entry.path().to_str().unwrap().to_string()
                    } else {
                        "".to_string()
                    };

                    let f = File {
                        name: fname.to_string(),
                        path,
                        is_dir: entry.file_type().is_dir(),
                        size,
                    };

                    tx.send(f).unwrap();
                }
            }
        }
    });

    for received in rx {
        println!("File: {:?}", &received);
        let _ = window
            .lock()
            .unwrap()
            .emit("file-found", received)
            .unwrap();
    }

    let _ = thread.join();

    window
        .lock()
        .unwrap()
        .emit("search-status", SearchStatus::Finished)
        .unwrap();
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let _main_window = app.get_window("main").unwrap();
            let _main_window = Arc::new(Mutex::new(_main_window));
            let win = Arc::clone(&_main_window);

            _main_window
                .clone()
                .lock()
                .unwrap()
                .listen("search-start", move |e| {
                    if e.payload().is_none() {
                        eprintln!("invalid json");
                        return;
                    };
                    let params: SearchParams =
                        serde_json::from_str(e.payload().unwrap()).expect("invalid json");
                    println!("search-start: {:?}", params);
                    // let pattern = e.payload().unwrap().pattern;
                    // search_in_dir(_main_window, params.dir, params.pattern);
                    search_in_dir(win.as_ref(), params.dir, params.pattern);
                });

            Arc::clone(&_main_window)
                .lock()
                .unwrap()
                .listen("search-stop", |e| {
                    println!("hello");
                });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            read_directory_files,
            get_disks,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
