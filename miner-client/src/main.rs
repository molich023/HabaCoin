use reqwest::Client;
use serde_json::json;

async fn push_hustle_to_neon(user_id: &str, reward: f64) -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let neon_proxy_url = std::env::var("NEON_DB_HTTP_URL")?; // From Neon Dashboard

    // We send this to a Next.js API route that then writes to Neon
    let res = client
        .post("https://your-habacoin-pwa.netlify.app/api/mine")
        .json(&json!({
            "userId": user_id,
            "reward": reward,
            "secretKey": std::env::var("MINER_SECRET")? // Security check
        }))
        .send()
        .await?;

    if res.status().is_success() {
        println!("Hustle verified and synced to Neon DB!");
    }
    Ok(())
}
