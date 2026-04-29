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

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
    system_instruction: Option<GeminiSystemInstruction>,
}

#[derive(Serialize)]
struct GeminiContent {
    parts: Vec<GeminiPart>,
}

#[derive(Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Serialize)]
struct GeminiSystemInstruction {
    parts: Vec<GeminiPart>,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Option<Vec<GeminiCandidate>>,
    error: Option<GeminiError>,
}

#[derive(Deserialize)]
struct GeminiCandidate {
    content: GeminiContentResponse,
}

#[derive(Deserialize)]
struct GeminiContentResponse {
    parts: Vec<GeminiPartResponse>,
}

#[derive(Deserialize)]
struct GeminiPartResponse {
    text: String,
}

#[derive(Deserialize)]
struct GeminiError {
    message: String,
}

#[derive(Serialize)]
struct OpenAiRequest {
    model: String,
    messages: Vec<OpenAiMessage>,
    temperature: f32,
    max_tokens: u32,
}

#[derive(Serialize)]
struct OpenAiMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct OpenAiResponse {
    choices: Vec<OpenAiChoice>,
}

#[derive(Deserialize)]
struct OpenAiChoice {
    message: OpenAiMessageResponse,
}

#[derive(Deserialize)]
struct OpenAiMessageResponse {
    content: String,
}

pub async fn call(provider: &str, api_key: &str, system: &str, user_msg: &str) -> Result<String, String> {
    if provider == "gemini" {
        call_gemini(api_key, system, user_msg).await
    } else if provider == "lmstudio" {
        call_lmstudio(system, user_msg).await
    } else if provider == "openai" {
        call_openai(api_key, system, user_msg).await
    } else {
        call_anthropic(api_key, system, user_msg).await
    }
}

async fn call_openai(api_key: &str, system: &str, user_msg: &str) -> Result<String, String> {
    let client = Client::new();
    let url = "https://api.openai.com/v1/chat/completions";

    let body = OpenAiRequest {
        model: "gpt-4o-mini".to_string(),
        messages: vec![
            OpenAiMessage { role: "system".to_string(), content: system.to_string() },
            OpenAiMessage { role: "user".to_string(), content: user_msg.to_string() },
        ],
        temperature: 0.7,
        max_tokens: 1024,
    };

    let resp = client
        .post(url)
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status().as_u16();
        let text = resp.text().await.unwrap_or_default();
        return Err(match status {
            401 => "Invalid API key. Please check your key in Settings.".to_string(),
            429 => "Rate limit reached or quota exceeded.".to_string(),
            _ => format!("OpenAI API error {}: {}", status, text),
        });
    }

    let data: OpenAiResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse OpenAI response: {}", e))?;

    data.choices
        .into_iter()
        .next()
        .map(|c| c.message.content)
        .ok_or_else(|| "Empty response from OpenAI".to_string())
}

#[derive(Deserialize)]
struct LmStudioModelsResponse {
    data: Vec<LmStudioModelInfo>,
}

#[derive(Deserialize)]
struct LmStudioModelInfo {
    id: String,
}

async fn call_lmstudio(system: &str, user_msg: &str) -> Result<String, String> {
    let client = Client::new();
    
    // First, fetch the dynamically loaded model ID from LM Studio
    let models_url = "http://127.0.0.1:1234/v1/models";
    let models_resp = client
        .get(models_url)
        .send()
        .await
        .map_err(|e| format!("Could not connect to LM Studio. Is the server running? ({})", e))?;

    if !models_resp.status().is_success() {
        return Err(format!("Failed to fetch models from LM Studio: {}", models_resp.status()));
    }

    let models_data: LmStudioModelsResponse = models_resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse LM Studio models: {}", e))?;

    let model_id = models_data.data.into_iter().next().map(|m| m.id).ok_or_else(|| {
        "No models are currently loaded in LM Studio. Please open the Local Server tab and load a model first.".to_string()
    })?;

    // Now make the actual chat completion request with the exact model ID
    let url = "http://127.0.0.1:1234/v1/chat/completions";

    let body = OpenAiRequest {
        model: model_id,
        messages: vec![
            OpenAiMessage { role: "system".to_string(), content: system.to_string() },
            OpenAiMessage { role: "user".to_string(), content: user_msg.to_string() },
        ],
        temperature: 0.7,
        max_tokens: 1024,
    };

    let resp = client
        .post(url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Could not connect to LM Studio. ({})", e))?;

    if !resp.status().is_success() {
        let status = resp.status().as_u16();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("LM Studio API error {}: {}", status, text));
    }

    let data: OpenAiResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse LM Studio response: {}", e))?;

    data.choices
        .into_iter()
        .next()
        .map(|c| c.message.content)
        .ok_or_else(|| "Empty response from LM Studio".to_string())
}

async fn call_anthropic(api_key: &str, system: &str, user_msg: &str) -> Result<String, String> {
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
        .json(&body)
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

async fn call_gemini(api_key: &str, system: &str, user_msg: &str) -> Result<String, String> {
    let client = Client::new();
    let url = format!("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}", api_key);

    let body = GeminiRequest {
        contents: vec![GeminiContent {
            parts: vec![GeminiPart {
                text: user_msg.to_string(),
            }],
        }],
        system_instruction: Some(GeminiSystemInstruction {
            parts: vec![GeminiPart {
                text: system.to_string(),
            }],
        }),
    };

    let resp = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status().as_u16();
        let text = resp.text().await.unwrap_or_default();
        return Err(match status {
            400 => "Invalid API key. Please check your key in Settings.".to_string(),
            429 => "Rate limit reached. Please wait a moment and try again.".to_string(),
            _ => format!("API error {}: {}", status, text),
        });
    }

    let data: GeminiResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    if let Some(error) = data.error {
        return Err(format!("API error: {}", error.message));
    }

    data.candidates
        .and_then(|mut c| c.pop())
        .and_then(|c| c.content.parts.into_iter().next())
        .map(|p| p.text)
        .ok_or_else(|| "Empty response from API".to_string())
}
