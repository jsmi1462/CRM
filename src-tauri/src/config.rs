use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub llm_api_key: String,
    pub db_path: String,
    pub theme: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            llm_api_key: String::new(),
            db_path: String::from("pubmetric.db"),
            theme: String::from("light"),
        }
    }
}

pub fn validate_config(config: &AppConfig) -> Result<(), String> {
    if config.llm_api_key.is_empty() {
        return Err("LLM API key is required.".to_string());
    }
    let path = PathBuf::from(&config.db_path);
    if !path.is_absolute() {
        return Err("DB path must be absolute.".to_string());
    }
    Ok(())
}
