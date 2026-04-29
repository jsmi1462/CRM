mod config;
mod db;

use chrono::Utc;
use config::AppConfig;
use serde::{Deserialize, Serialize};
use sqlx::sqlite::SqliteConnectOptions;
use sqlx::SqlitePool;
use tauri::Manager;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Lead {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub last_contacted: Option<String>,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

struct AppState {
    db: SqlitePool,
}

#[tauri::command]
async fn validate_config(config: AppConfig) -> Result<(), String> {
    config::validate_config(&config)
}

#[tauri::command]
async fn get_leads(state: tauri::State<'_, AppState>) -> Result<Vec<Lead>, String> {
    sqlx::query_as::<_, Lead>("SELECT * FROM leads ORDER BY updated_at DESC")
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_lead(
    state: tauri::State<'_, AppState>,
    name: String,
    email: Option<String>,
    phone: Option<String>,
    status: String,
    notes: Option<String>,
) -> Result<Lead, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO leads (id, name, email, phone, last_contacted, status, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&name)
    .bind(&email)
    .bind(&phone)
    .bind(&status)
    .bind(&notes)
    .bind(&now)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Lead>("SELECT * FROM leads WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_lead(
    state: tauri::State<'_, AppState>,
    id: String,
    name: String,
    email: Option<String>,
    phone: Option<String>,
    status: String,
    notes: Option<String>,
    last_contacted: Option<String>,
) -> Result<Lead, String> {
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "UPDATE leads SET name=?, email=?, phone=?, status=?, notes=?, last_contacted=?, updated_at=? WHERE id=?",
    )
    .bind(&name)
    .bind(&email)
    .bind(&phone)
    .bind(&status)
    .bind(&notes)
    .bind(&last_contacted)
    .bind(&now)
    .bind(&id)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Lead>("SELECT * FROM leads WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_lead(state: tauri::State<'_, AppState>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM leads WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&app_data_dir)?;
            let db_path = app_data_dir.join("pubmetric.db");

            let pool = tauri::async_runtime::block_on(async {
                let opts = SqliteConnectOptions::new()
                    .filename(&db_path)
                    .create_if_missing(true);
                let pool = SqlitePool::connect_with(opts).await?;
                db::init_schema(&pool).await?;
                Ok::<SqlitePool, sqlx::Error>(pool)
            })?;

            app.manage(AppState { db: pool });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            validate_config,
            get_leads,
            create_lead,
            update_lead,
            delete_lead,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
