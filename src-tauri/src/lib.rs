mod config;
mod db;

use config::AppConfig;
use db::init_db;
use sqlx::SqlitePool;
use std::sync::Mutex;
use tauri::Manager;

struct AppState {
    db: Mutex<SqlitePool>,
}

#[tauri::command]
async fn validate_config(config: AppConfig) -> Result<(), String> {
    config::validate_config(&config)
}

#[tauri::command]
async fn initialize_db(db_path: String) -> Result<(), String> {
    match init_db(&db_path).await {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            db: Mutex::new(SqlitePool::connect("sqlite::memory:").unwrap()),
        })
        .invoke_handler(tauri::generate_handler![validate_config, initialize_db])
        .run(tauri::generate_context!())
        .expect("error while running tauri process");
}
