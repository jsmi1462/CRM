use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct AnthropicRequest {
    model: String,
    max_tokens: u32,
    system: String,
    messages: Vec<Message>,
}

#[derive(Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct AnthropicResponse {
    content: Vec<ContentBlock>,
}

#[derive(Deserialize)]
struct ContentBlock {
    text: String,
}

pub async fn call(api_key: &str, system: &str, user_msg: &str) -> Result<String, String> {
    let client = Client::new();

    let body = AnthropicRequest {
        model: "claude-haiku-4-5-20251001".to_string(),
        max_tokens: 1024,
        system: system.to_string(),
        messages: vec![Message {
            role: "user".to_string(),
            content: user_msg.to_string(),
        }],
    };

    let resp = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .json(&body) // sets Content-Type: application/json automatically
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status().as_u16();
        let text = resp.text().await.unwrap_or_default();
        return Err(match status {
            401 => "Invalid API key. Please check your key in Settings.".to_string(),
            429 => "Rate limit reached. Please wait a moment and try again.".to_string(),
            _ => format!("API error {}: {}", status, text),
        });
    }

    let data: AnthropicResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    data.content
        .into_iter()
        .next()
        .map(|c| c.text)
        .ok_or_else(|| "Empty response from API".to_string())
}
