#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;
use rusqlite::{params, Connection, Result};
use tauri::Manager;

// Shared application state
struct AppState {
    conn: Mutex<Connection>,
}

// Initialize SQLite database and create tables if they don't exist
fn init_db() -> Connection {
    let conn = Connection::open("users.db").expect("Failed to open database");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )",
        [],
    ).expect("Failed to create users table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lat REAL NOT NULL,
            lng REAL NOT NULL
        )",
        [],
    ).expect("Failed to create devices table");

    // Optional: insert some example devices if table is empty
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM devices", [], |row| row.get(0)).unwrap();
    if count == 0 {
        conn.execute(
            "INSERT INTO devices (lat, lng) VALUES (40.7128, -74.0060), (34.0522, -118.2437)",
            [],
        ).unwrap();
    }

    conn
}

// Register a new user
fn register_user(conn: &Connection, username: &str, password: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO users (username, password) VALUES (?1, ?2)",
        params![username, password],
    )?;
    Ok(())
}

// Check user login
fn check_login(conn: &Connection, username: &str, password: &str) -> bool {
    let mut stmt = conn.prepare("SELECT password FROM users WHERE username=?1").unwrap();
    let mut rows = stmt.query([username]).unwrap();

    if let Some(row) = rows.next().unwrap() {
        let stored: String = row.get(0).unwrap();
        stored == password
    } else {
        false
    }
}

// Get all devices
fn get_devices(conn: &Connection) -> Vec<(f64, f64)> {
    let mut stmt = conn.prepare("SELECT lat, lng FROM devices").unwrap();
    let rows = stmt.query_map([], |row| Ok((row.get(0)?, row.get(1)?))).unwrap();

    rows.map(|r| r.unwrap()).collect()
}

// Tauri command: register
#[tauri::command]
fn register(app_state: tauri::State<AppState>, username: String, password: String) -> Result<String, String> {
    let conn = app_state.conn.lock().unwrap();
    register_user(&conn, &username, &password)
        .map(|_| "Registered successfully".to_string())
        .map_err(|e| format!("Error: {}", e))
}

// Tauri command: login
#[tauri::command]
fn login(app_state: tauri::State<AppState>, username: String, password: String) -> bool {
    let conn = app_state.conn.lock().unwrap();
    check_login(&conn, &username, &password)
}

// Tauri command: get devices
#[tauri::command]
fn devices(app_state: tauri::State<AppState>) -> Vec<(f64, f64)> {
    let conn = app_state.conn.lock().unwrap();
    get_devices(&conn)
}

fn main() {
    let conn = init_db();

    tauri::Builder::default()
        .manage(AppState { conn: Mutex::new(conn) })
        .invoke_handler(tauri::generate_handler![register, login, devices])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
