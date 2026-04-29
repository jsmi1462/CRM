mod config;
mod db;

use config::AppConfig;
use db::init_db;
use sqlx::SqlitePool;
use std::sync::Mutex;
use tauri::Manager;
use uuid::Uuid;
use chrono::Utc;

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

#[tauri::command]
async fn get_leads(pool: tauri::State<'_, AppState>) -> Result<Vec<serde_json::Value>, String> {
    let pool = pool.db.lock().unwrap();
    let leads = sqlx::query("SELECT * FROM leads")
        .fetch_all(&pool)
        .await
        .map_err(|e| e.to_string())?;
    
    let leads_json: Vec<serde_json::Value> = leads
        .into_iter()
        .map(|row| {
            serde_json::json!({
                "id": row.get::<String, _>("id"),
                "name": row.get::<String, _>("name"),
                "email": row.get::<Option<String>, _>("email"),
                "phone": row.get::<Option<String>, _>("phone"),
                "last_contacted": row.get::<Option<String>, _>("last_contacted"),
                "status": row.get::<String, _>("status"),
                "notes": row.get::<Option<String>, _>("notes"),
                "created_at": row.get::<String, _>("created_at"),
                "updated_at": row.get::<String, _>("updated_at"),
            })
        })
        .collect();
        
    Ok(leads_json)
}

#[tauri::command]
async fn create_lead(pool: tauri::State<'_, AppState>, name: String, email: Option<String>, phone: Option<String>, status: String, notes: Option<String>) -> Result<serde_json::Value, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let pool = pool.db.lock().unwrap();
    
    sqlx::query(
        "INSERT INTO leads (id, name, email, phone, last_contacted, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&name)
    .bind(&email)
    .bind(&phone)
    .bind(None::<String>)
    .bind(&status)
    .bind(&notes)
    .bind(&now)
    .bind(&now)
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;
        
    Ok(serde_json::json!({
        "id": id,
        "name": name,
        "email": email,
        "phone": phone,
        "last_contacted": None::<String>,
        "status": status,
        "notes": notes,
        "created_at": now,
        "updated_at": now,
    }))
}

#[tauri::command]
async fn update_lead(pool: tauri::State<'_, AppState>, id: String, name: Option<String>, email: Option<String>, phone: Option<String>, status: Option<String>, notes: Option<String>) -> Result<serde_json::Value, String> {
    let now = Utc::now().to_rfc3339();
    let pool = pool.db.lock().unwrap();
    
    sqlx::query(
        "UPDATE leads SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone), status = COALESCE(?, status), notes = COALESCE(?, notes), updated_at = ? WHERE id = ?"
    )
    .bind(&name)
    .bind(&email)
    .bind(&phone)
    .bind(&status)
    .bind(&notes)
    .bind(&now)
    .bind(&id)
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;
        
    Ok(serde_json::json!({ "success": true }))
}

#[tauri::command]
async fn delete_lead(pool: tauri::State<'_, AppState>, id: String) -> Result<(), String> {
    let pool = pool.db.lock().unwrap();
    sqlx::query("DELETE FROM leads WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            db: Mutex::new(SqlitePool::connect("sqlite::memory:").unwrap()),
        })
        .invoke_handler(tauri::generate_handler![
            validate_config, 
            initialize_db, 
            get_leads, 
            create_lead, 
            update_lead, 
            delete_lead
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri process");
}
