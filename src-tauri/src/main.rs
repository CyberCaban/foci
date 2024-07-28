// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, ops::Deref, path::Path, sync::{Arc, Mutex}};
use sysinfo::Disks;

use serde::Serialize;
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

#[tauri::command(async)]
fn search_in_dir(window: Window, dir: String, pattern: String) {
    let pattern = pattern.to_lowercase();
    let window = Arc::new(Mutex::new(window));

    Arc::clone(&window).lock().unwrap().emit("search-status", SearchStatus::Searching).unwrap();

    let win = Arc::clone(&window);
    let thread = std::thread::spawn(move || {
        let entries = WalkDir::new(Path::new(&dir))
            .follow_links(true)
            .into_iter()
            .filter_map(|e| e.ok());

        for entry in entries {
            if let Some(fname) = entry.file_name().to_str() {
                if fname.to_lowercase().contains(&pattern) {
                    win.lock().unwrap().emit("file-found", File {
                        name: fname.to_string(),
                        path: entry.path().to_str().unwrap().to_string(),
                        is_dir: entry.file_type().is_dir(),
                        size: entry.metadata().unwrap().len()
                    }).unwrap();
                }
            }
        }

    });
    let _ = thread.join();
    Arc::clone(&window).lock().unwrap().emit("search-status", SearchStatus::Finished).unwrap();
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let _id = app.emit_all("file-found", "hello");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            read_directory_files,
            get_disks,
            search_in_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
