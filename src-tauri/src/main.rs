// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    fs::{self, ReadDir},
    io,
    os::windows::fs::MetadataExt,
};

use serde::Serialize;

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

#[tauri::command]
fn read_directory_files(path: &str) -> Option<Vec<File>> {
    let entries = match fs::read_dir(&path) {
        Ok(entries) => entries,
        Err(e) => {
            println!("{:?}", e);
            println!("Error reading directory {:?}", path);
            return None;
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
                    size: meta.file_size(),
                })
            }
        }
    }

    Some(current_files)
}

fn main() {
    println!("Hello, world!");
    let mut path = String::new();
    // io::stdin().read_line(&mut path).expect("No such direcory");
    // let path = path.trim();

    // let files = read_directory_files(path);

    // for i in 0..files.len() {
    //     println!("{:?}", files.get(i).unwrap());
    // }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, read_directory_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
