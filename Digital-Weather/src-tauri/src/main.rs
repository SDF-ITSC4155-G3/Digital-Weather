#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;
use rusqlite::{params, Connection, Result};
use serde::Serialize;
use tauri::Manager;

// Shared state
struct AppState {
    conn: Mutex<Connection>,
}

// Device struct for GeoJSON
#[derive(Serialize)]
struct GeoDevice {
    r#type: String,
    geometry: Geometry,
    properties: DeviceProperties,
}

#[derive(Serialize)]
struct Geometry {
    r#type: String,
    coordinates: [f64; 2],
}

#[derive(Serialize)]
struct DeviceProperties {
    id: i64,
}

// GeoJSON FeatureCollection
#[derive(Serialize)]
struct FeatureCollection {
    r#type: String,
    features: Vec<GeoDevice>,
}

// Initialize database
fn init_db() -> Connection {
    let conn = Connection::open("users.db").expect("Failed to open database");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )",
        [],
    ).unwrap();

    conn.execute(
        "CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lat REAL NOT NULL,
            lng REAL NOT NULL
        )",
        [],
    ).unwrap();

    conn
}

// Register a device with coordinates
fn add_device(conn: &Connection, lat: f64, lng: f64) -> Result<i64> {
    conn.execute(
        "INSERT INTO devices (lat, lng) VALUES (?1, ?2)",
        params![lat, lng],
    )?;
    Ok(conn.last_insert_rowid())
}

// Fetch devices as GeoJSON
fn get_devices_geojson(conn: &Connection) -> FeatureCollection {
    let mut stmt = conn.prepare("SELECT id, lat, lng FROM devices").unwrap();
    let rows = stmt.query_map([], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?))).unwrap();

    let features: Vec<GeoDevice> = rows.map(|r| {
        let (id, lat, lng) = r.unwrap();
        GeoDevice {
            r#type: "Feature".to_string(),
            geometry: Geometry {
                r#type: "Point".to_string(),
                coordinates: [lng, lat], // GeoJSON uses [lng, lat]
            },
            properties: DeviceProperties { id },
        }
    }).collect();

    FeatureCollection {
        r#type: "FeatureCollection".to_string(),
        features,
    }
}

// Tauri commands

#[tauri::command]
fn register(app_state: tauri::State<AppState>, username: String, password: String) -> Result<String, String> {
    let conn = app_state.conn.lock().unwrap();
    conn.execute(
        "INSERT INTO users (username, password) VALUES (?1, ?2)",
        params![username, password],
    )
    .map(|_| "Registered successfully".to_string())
    .map_err(|e| format!("Error: {}", e))
}

#[tauri::command]
fn login(app_state: tauri::State<AppState>, username: String, password: String) -> bool {
    let conn = app_state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT password FROM users WHERE username=?1").unwrap();
    let mut rows = stmt.query([username]).unwrap();
    if let Some(row) = rows.next().unwrap() {
        let stored: String = row.get(0).unwrap();
        stored == password
    } else {
        false
    }
}

#[tauri::command]
fn add_device_cmd(app_state: tauri::State<AppState>, lat: f64, lng: f64) -> i64 {
    let conn = app_state.conn.lock().unwrap();
    add_device(&conn, lat, lng).unwrap()
}

#[tauri::command]
fn get_devices_cmd(app_state: tauri::State<AppState>) -> FeatureCollection {
    let conn = app_state.conn.lock().unwrap();
    get_devices_geojson(&conn)
}

// Main
fn main() {
    let conn = init_db();

    tauri::Builder::default()
        .manage(AppState { conn: Mutex::new(conn) })
        .invoke_handler(tauri::generate_handler![
            register,
            login,
            add_device_cmd,
            get_devices_cmd
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
