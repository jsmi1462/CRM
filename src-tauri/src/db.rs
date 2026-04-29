use sqlx::SqlitePool;

pub async fn init_db(db_path: &str) -> Result<SqlitePool, sqlx::Error> {
    let pool = SqlitePool::connect(&format!("sqlite:{}", db_path)).await?;
    
    // Note: For production encrypted storage, consider switching to `sqlx` with `sqlcipher` 
    // or using Tauri's secure storage for keys, as standard SQLite is unencrypted at rest.
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            last_contacted TEXT,
            status TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        "#,
    )
    .execute(&pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS contacts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            type TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        "#,
    )
    .execute(&pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS interactions (
            id TEXT PRIMARY KEY,
            lead_id TEXT NOT NULL,
            contact_id TEXT,
            type TEXT NOT NULL,
            content TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (lead_id) REFERENCES leads(id),
            FOREIGN KEY (contact_id) REFERENCES contacts(id)
        );
        "#,
    )
    .execute(&pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS metrics (
            id TEXT PRIMARY KEY,
            lead_id TEXT NOT NULL,
            metric_type TEXT NOT NULL,
            value REAL NOT NULL,
            recorded_at TEXT NOT NULL,
            FOREIGN KEY (lead_id) REFERENCES leads(id)
        );
        "#,
    )
    .execute(&pool)
    .await?;

    Ok(pool)
}
