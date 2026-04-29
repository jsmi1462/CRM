mod config;
mod db;
mod llm;
mod metrics;

use chrono::Utc;
use config::AppConfig;
use metrics::MetricsSummary;
use serde::{Deserialize, Serialize};
use sqlx::sqlite::SqliteConnectOptions;
use sqlx::SqlitePool;
use tauri::Manager;
use tauri_plugin_store::StoreExt;
use uuid::Uuid;

const STORE_FILE: &str = "app_settings.json";
const KEY_API_KEY: &str = "api_key";

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

// ── Key/value store helpers ───────────────────────────────────────────────────

fn get_stored_api_key(app: &tauri::AppHandle) -> Result<String, String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store
        .get(KEY_API_KEY)
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .filter(|s| !s.is_empty())
        .ok_or_else(|| {
            "API key not configured. Please add your Anthropic API key in Settings.".to_string()
        })
}

// ── Config commands ───────────────────────────────────────────────────────────

#[tauri::command]
async fn validate_config(config: AppConfig) -> Result<(), String> {
    config::validate_config(&config)
}

#[tauri::command]
async fn has_api_key(app: tauri::AppHandle) -> bool {
    get_stored_api_key(&app).is_ok()
}

#[tauri::command]
async fn set_api_key(app: tauri::AppHandle, key: String) -> Result<(), String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store.set(KEY_API_KEY, serde_json::json!(key));
    store.save().map_err(|e| e.to_string())
}

// ── Lead CRUD commands ────────────────────────────────────────────────────────

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

// ── Metrics command ───────────────────────────────────────────────────────────

#[tauri::command]
async fn get_metrics(state: tauri::State<'_, AppState>) -> Result<MetricsSummary, String> {
    metrics::compute(&state.db)
        .await
        .map_err(|e| e.to_string())
}

// ── LLM commands ─────────────────────────────────────────────────────────────

#[tauri::command]
async fn draft_followup_email(
    app: tauri::AppHandle,
    lead_name: String,
    notes: Option<String>,
    last_contacted: Option<String>,
) -> Result<String, String> {
    let api_key = get_stored_api_key(&app)?;
    let system = "You are a professional assistant helping a medical device sales representative \
        draft concise, warm follow-up emails for doctor-to-doctor outreach. \
        Write in a friendly but professional tone. Keep it under 150 words. \
        Do not include a subject line — just the email body.";
    let user_msg = format!(
        "Draft a follow-up email for {}.\nNotes: {}\nLast contacted: {}",
        lead_name,
        notes.as_deref().unwrap_or("none"),
        last_contacted.as_deref().unwrap_or("never"),
    );
    llm::call(&api_key, system, &user_msg).await
}

#[tauri::command]
async fn summarize_notes(
    app: tauri::AppHandle,
    notes: String,
) -> Result<String, String> {
    let api_key = get_stored_api_key(&app)?;
    let system = "Summarize the following CRM notes into 2–3 concise bullet points. \
        Focus on the most actionable information. Use plain language.";
    llm::call(&api_key, system, &notes).await
}

#[tauri::command]
async fn suggest_status(
    app: tauri::AppHandle,
    notes: String,
    current_status: String,
) -> Result<String, String> {
    let api_key = get_stored_api_key(&app)?;
    let system = "Based on CRM notes about a medical professional lead, suggest the most \
        appropriate status. Reply with exactly one word from this list: \
        new, contacted, interested, converted, lost.";
    let user_msg = format!("Current status: {}\nNotes: {}", current_status, notes);
    llm::call(&api_key, system, &user_msg).await
}

// ── App entry point ───────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
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
            has_api_key,
            set_api_key,
            get_leads,
            create_lead,
            update_lead,
            delete_lead,
            get_metrics,
            draft_followup_email,
            summarize_notes,
            suggest_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
