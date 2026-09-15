pub mod classic;
pub mod error;
pub mod fetch;
pub mod nextgen;
pub mod sports;
pub mod types;
pub mod url;

use fetch::{build_client, map_fetch_error, SIDEARM_USER_AGENT};
pub use error::ScraperError;
pub use types::{RosterResult, SportInfo};

pub async fn scrape_roster(roster_url: &str) -> Result<RosterResult, ScraperError> {
    let client = build_client()?;
    let parsed = url::parse_roster_url(roster_url)?;

    if nextgen::is_nextgen(&client, &parsed.origin).await {
        return nextgen::scrape_nextgen(&client, roster_url).await;
    }

    let res = client
        .get(&parsed.normalized_url)
        .header("User-Agent", SIDEARM_USER_AGENT)
        .send()
        .await
        .map_err(map_fetch_error)?;
    if !res.status().is_success() {
        return Err(ScraperError::Http(format!(
            "Failed to fetch roster page ({})",
            res.status()
        )));
    }
    let html = res.text().await.map_err(|e| ScraperError::Http(e.to_string()))?;

    if classic::html_looks_classic(&html) {
        return classic::scrape_classic(roster_url, &html);
    }

    Err(ScraperError::UnsupportedPlatform(
        "not Sidearm NextGen (API) or Classic (HTML roster list)".to_string(),
    ))
}

pub async fn list_sports(website: &str) -> Result<Vec<SportInfo>, ScraperError> {
    let client = build_client()?;
    sports::list_sports(&client, website).await
}

#[cfg(test)]
mod live_tests {
    use super::*;

    #[tokio::test]
    #[ignore]
    async fn scrapes_a_real_nextgen_roster() {
        let result = scrape_roster("https://gozips.com/sports/womens-soccer/roster")
            .await
            .unwrap();
        assert_eq!(result.platform, types::Platform::Nextgen);
        assert!(!result.players.is_empty(), "expected non-empty players");
        println!("{:#?}", result.players.first());
    }

    #[tokio::test]
    #[ignore]
    async fn scrapes_a_real_classic_roster() {
        let result = scrape_roster("https://bamastatesports.com/sports/womens-soccer/roster")
            .await
            .unwrap();
        assert_eq!(result.platform, types::Platform::Classic);
        assert!(!result.players.is_empty(), "expected non-empty players");
        println!("{:#?}", result.players.first());
    }
}
