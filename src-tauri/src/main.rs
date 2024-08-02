// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crossbeam_channel::{bounded, unbounded};
use std::{
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
    Canceled,
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

fn search_in_dir(
    dir: String,
    pattern: String,
    r: crossbeam_channel::Receiver<String>,
    tx: std::sync::mpsc::Sender<File>,
) -> std::thread::JoinHandle<()> {
    let pattern = pattern.to_lowercase();

    let entries = WalkDir::new(Path::new(&dir))
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok());

    let thread = std::thread::spawn(move || {
        for entry in entries {
            if let Some(fname) = entry.file_name().to_str() {
                if fname.to_lowercase().contains(&pattern) {
                    let f = File {
                        name: fname.to_string(),
                        path: entry.path().to_str().expect("invalid path").to_string(),
                        is_dir: entry.file_type().is_dir(),
                        size: entry.metadata().expect("invalid metadata").len(),
                    };

                    tx.send(f).unwrap();
                }
            }
        }
        if let Ok(msg) = r.try_recv() {
            println!("Search canceled {:?}", msg);
        }
    });
    thread
}

fn search(_main_window: Window, win: Window) {
    let (s, r) = unbounded();

    _main_window.listen("search-start", move |e| {
        win.emit("search-status", SearchStatus::Searching).unwrap();

        if e.payload().is_none() {
            eprintln!("invalid json");
            return;
        };
        let params: SearchParams =
            serde_json::from_str(e.payload().unwrap()).expect("invalid json");

        let (tx, rx) = std::sync::mpsc::channel();
        let thread = search_in_dir(params.dir, params.pattern, r.clone(), tx);
        for received in rx {
            println!("File: {:?}", &received);
            let _ = win.emit("file-found", received).unwrap();
        }

        thread.join().unwrap();

        win.emit("search-status", SearchStatus::Finished).unwrap();
    });

    _main_window.listen("search-stop", move |e| {
        println!("hello");
        // let _ = s.send("stop".to_string()).unwrap();
    });
}

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
            greet,
            read_directory_files,
            get_disks,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
