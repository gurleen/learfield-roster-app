use std::time::Duration;

use reqwest::redirect::Policy;
use reqwest::Client;

use super::error::ScraperError;

/// Shared User-Agent for Sidearm / athletics site requests.
pub const SIDEARM_USER_AGENT: &str =
    "Mozilla/5.0 (compatible; learfield-roster-app/0.1; +https://github.com/gurleen/learfield-roster-app)";

const MAX_REDIRECTS: usize = 20;
const SAME_URL_REDIRECT_LIMIT: usize = 2;
const REDIRECT_LOOP_MARKER: &str = "same-url redirect loop";

/// Build an HTTP client with a cookie jar and explicit same-URL redirect-loop
/// detection: Sidearm/Imperva sites sometimes 301 back to the identical URL
/// (e.g. a bot-block challenge) rather than truly redirecting, which would
/// otherwise spin until `MAX_REDIRECTS` is exhausted.
pub fn build_client() -> Result<Client, ScraperError> {
    let policy = Policy::custom(|attempt| {
        let same_url_hops = attempt
            .previous()
            .iter()
            .filter(|u| *u == attempt.url())
            .count();
        if same_url_hops >= SAME_URL_REDIRECT_LIMIT {
            return attempt.error(REDIRECT_LOOP_MARKER);
        }
        if attempt.previous().len() >= MAX_REDIRECTS {
            return attempt.error("too many redirects");
        }
        attempt.follow()
    });

    Client::builder()
        .cookie_store(true)
        .redirect(policy)
        .user_agent(SIDEARM_USER_AGENT)
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(ScraperError::from)
}

/// Convert a `reqwest::Error` from a request made with [`build_client`]'s
/// policy into a [`ScraperError`], surfacing redirect loops distinctly.
pub fn map_fetch_error(err: reqwest::Error) -> ScraperError {
    let message = err.to_string();
    if message.contains(REDIRECT_LOOP_MARKER) {
        ScraperError::Blocked(format!("redirect loop while fetching {}", err.url().map(|u| u.as_str()).unwrap_or("<unknown>")))
    } else {
        ScraperError::Http(message)
    }
}
