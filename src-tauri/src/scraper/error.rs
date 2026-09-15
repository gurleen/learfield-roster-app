use std::fmt;

#[derive(Debug)]
pub enum ScraperError {
    Http(String),
    Blocked(String),
    UnsupportedPlatform(String),
    NotFound(String),
    Parse(String),
}

impl fmt::Display for ScraperError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ScraperError::Http(msg) => write!(f, "HTTP request failed: {msg}"),
            ScraperError::Blocked(msg) => write!(f, "Athletics site blocked the request: {msg}"),
            ScraperError::UnsupportedPlatform(msg) => write!(f, "Unsupported roster page: {msg}"),
            ScraperError::NotFound(msg) => write!(f, "Not found: {msg}"),
            ScraperError::Parse(msg) => write!(f, "Failed to parse response: {msg}"),
        }
    }
}

impl std::error::Error for ScraperError {}

impl From<reqwest::Error> for ScraperError {
    fn from(err: reqwest::Error) -> Self {
        ScraperError::Http(err.to_string())
    }
}
