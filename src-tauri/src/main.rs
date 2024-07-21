// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    fs::{self, ReadDir},
    io,
};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn read_directory_files(x: &str) -> ReadDir {
    let x = x.trim();

    let entries = match fs::read_dir(&x) {
        Ok(entries) => entries,
        Err(e) => {
            println!("failed to read dir {:?}", x);
            panic!("");
        }
    };

    entries
}

fn main() {
    println!("Hello, world!");
    let mut x = String::new();
    io::stdin().read_line(&mut x).expect("No such direcory");
    let x = x.trim();
    let entries = read_directory_files(x);
    
    for entry in entries {
        if let Ok(i) = entry {
            if let Ok(file_type) = i.file_type() {
                println!("{:?}: {:?}", i.path(), file_type);
            }else{
                println!("cannot get file type: {:?}", i.path());
            }
        }
    }


    // tauri::Builder::default()
    //     .invoke_handler(tauri::generate_handler![greet])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");
}
