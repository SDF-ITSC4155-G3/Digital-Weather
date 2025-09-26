#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Serialize, Deserialize};
use serde_json::{Value};
use std::fs::{OpenOptions};
use std::io::{Read, Write};
use tauri::Manager;

#[derive(Serialize, Deserialize)]
struct LoginRequest {
    username: String,
    password: String,
}

#[tauri::command]
fn login(request: LoginRequest) -> Result<String, String> {
    // Example static user
    if request.username == "admin" && request.password == "password123" {
        Ok("fake-jwt-token".into())
    } else {
        Err("Invalid credentials".into())
    }
}

#[tauri::command]
fn get_devices() -> Result<Value, String> {
    let mut file = OpenOptions::new()
        .read(true)
        .open("devices.geojson")
        .map_err(|e| e.to_string())?;
    
    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| e.to_string())?;
    
    let json: Value = serde_json::from_str(&contents).map_err(|e| e.to_string())?;
    Ok(json)
}

#[tauri::command]
fn add_device(device: Value) -> Result<(), String> {
    let mut file = OpenOptions::new()
        .read(true)
        .write(true)
        .open("devices.geojson")
        .map_err(|e| e.to_string())?;

    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| e.to_string())?;

    let mut geojson: Value = serde_json::from_str(&contents).map_err(|e| e.to_string())?;

    // Append new device
    if let Some(features) = geojson.get_mut("features").and_then(|f| f.as_array_mut()) {
        features.push(device);
    }

    // Write back
    let updated = serde_json::to_string_pretty(&geojson).map_err(|e| e.to_string())?;
    file.set_len(0).map_err(|e| e.to_string())?;
    file.write_all(updated.as_bytes()).map_err(|e| e.to_string())?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![login, get_devices, add_device])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
