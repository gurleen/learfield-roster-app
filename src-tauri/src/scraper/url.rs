use regex::Regex;
use url::Url;

use super::error::ScraperError;

pub const DEFAULT_SPORT_SLUG: &str = "womens-soccer";

const RESIZE_PARAMS: &[&str] = &[
    "width", "height", "quality", "mode", "anchor", "gravity", "type", "format",
];

pub struct ParsedRosterUrl {
    pub origin: String,
    pub sport_slug: String,
    pub normalized_url: String,
}

/// Port of `parseRosterUrl` from `learfield-scraper/src/types.ts`.
pub fn parse_roster_url(raw_url: &str) -> Result<ParsedRosterUrl, ScraperError> {
    let parsed = Url::parse(raw_url.trim())
        .map_err(|e| ScraperError::Parse(format!("invalid URL: {e}")))?;

    let re = Regex::new(r"(?i)^/sports/([^/]+)/roster/?$").unwrap();
    let captures = re.captures(parsed.path()).ok_or_else(|| {
        ScraperError::UnsupportedPlatform(
            "URL must be a Sidearm roster page like https://school.edu/sports/womens-soccer/roster"
                .to_string(),
        )
    })?;
    let sport_slug = captures[1].to_string();
    let origin = parsed.origin().ascii_serialization();
    let normalized_url = format!("{origin}/sports/{sport_slug}/roster");

    Ok(ParsedRosterUrl {
        origin,
        sport_slug,
        normalized_url,
    })
}

/// Normalize a website host/URL to an https origin (no trailing slash).
pub fn origin_from_website(website: &str) -> String {
    let host = website
        .trim()
        .trim_start_matches("https://")
        .trim_start_matches("http://")
        .trim_end_matches('/');
    format!("https://{host}")
}

fn strip_resize_params(mut parsed: Url) -> String {
    let retained: Vec<(String, String)> = parsed
        .query_pairs()
        .filter(|(k, _)| !RESIZE_PARAMS.contains(&k.to_lowercase().as_str()))
        .map(|(k, v)| (k.into_owned(), v.into_owned()))
        .collect();

    if retained.is_empty() {
        parsed.set_query(None);
    } else {
        let qs: Vec<String> = retained
            .iter()
            .map(|(k, v)| format!("{k}={v}"))
            .collect();
        parsed.set_query(Some(&qs.join("&")));
    }
    parsed.into()
}

fn is_sidearm_image_cdn(hostname: &str) -> bool {
    let host = hostname.to_lowercase();
    host == "images.sidearmdev.com" || host.ends_with(".images.sidearmdev.com")
}

/// If this is a Sidearm convert/CDN URL, return the embedded origin asset URL.
fn unwrap_sidearm_cdn_url(parsed: &Url) -> Option<String> {
    if !is_sidearm_image_cdn(parsed.host_str()?) {
        return None;
    }
    let embedded = parsed
        .query_pairs()
        .find(|(k, _)| k == "url")
        .map(|(_, v)| v.into_owned())?;
    if let Ok(u) = Url::parse(&embedded) {
        return Some(u.into());
    }
    Some(embedded)
}

/// Unwrap Sidearm's `images.sidearmdev.com/convert?url=...` CDN wrapper and
/// strip resize query params, yielding the stable original image URL.
pub fn resolve_original_image_url(raw: Option<&str>, page_origin: &str) -> Option<String> {
    let raw = raw?.trim();
    if raw.is_empty() {
        return None;
    }

    let base = Url::parse(page_origin).ok()?;
    let mut parsed = base.join(raw).ok()?;

    let mut seen = std::collections::HashSet::new();
    for _ in 0..8 {
        let Some(unwrapped) = unwrap_sidearm_cdn_url(&parsed) else {
            break;
        };
        if seen.contains(&unwrapped) {
            break;
        }
        seen.insert(unwrapped.clone());
        match Url::parse(&unwrapped) {
            Ok(u) => parsed = u,
            Err(_) => return Some(unwrapped),
        }
    }

    Some(strip_resize_params(parsed))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_nextgen_style_roster_url() {
        let parsed = parse_roster_url("https://gozips.com/sports/womens-soccer/roster").unwrap();
        assert_eq!(parsed.origin, "https://gozips.com");
        assert_eq!(parsed.sport_slug, "womens-soccer");
        assert_eq!(parsed.normalized_url, "https://gozips.com/sports/womens-soccer/roster");
    }

    #[test]
    fn parses_roster_url_with_trailing_slash() {
        let parsed = parse_roster_url("https://gozips.com/sports/mens-basketball/roster/").unwrap();
        assert_eq!(parsed.sport_slug, "mens-basketball");
    }

    #[test]
    fn rejects_non_roster_url() {
        assert!(parse_roster_url("https://gozips.com/sports/womens-soccer").is_err());
    }

    #[test]
    fn origin_from_website_strips_scheme_and_trailing_slash() {
        assert_eq!(origin_from_website("https://gozips.com/"), "https://gozips.com");
        assert_eq!(origin_from_website("gozips.com"), "https://gozips.com");
    }

    #[test]
    fn unwraps_sidearm_cdn_and_strips_resize_params() {
        let raw = "https://images.sidearmdev.com/convert?url=https%3A%2F%2Fcdn.example.com%2Fphoto.jpg%3Fwidth%3D80%26quality%3D90&type=webp";
        let resolved = resolve_original_image_url(Some(raw), "https://gozips.com").unwrap();
        assert_eq!(resolved, "https://cdn.example.com/photo.jpg");
    }

    #[test]
    fn resolves_relative_image_url_against_page_origin() {
        let resolved =
            resolve_original_image_url(Some("/images/2026/8/7/headshot.png?width=80"), "https://bamastatesports.com")
                .unwrap();
        assert_eq!(resolved, "https://bamastatesports.com/images/2026/8/7/headshot.png");
    }

    #[test]
    fn returns_none_for_missing_image() {
        assert_eq!(resolve_original_image_url(None, "https://gozips.com"), None);
        assert_eq!(resolve_original_image_url(Some("  "), "https://gozips.com"), None);
    }
}
