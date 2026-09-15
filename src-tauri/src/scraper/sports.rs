use std::collections::{BTreeMap, HashSet};
use std::time::Duration;

use reqwest::Client;
use scraper::{Html, Selector};
use serde::Deserialize;

use super::error::ScraperError;
use super::fetch::map_fetch_error;
use super::types::SportInfo;
use super::url::{origin_from_website, DEFAULT_SPORT_SLUG};

#[derive(Debug, Deserialize)]
struct SidearmSport {
    title: Option<String>,
    #[serde(rename = "globalSportNameSlug")]
    global_sport_name_slug: Option<String>,
    #[serde(default, rename = "nonSport")]
    non_sport: bool,
    #[serde(rename = "rosterId")]
    roster_id: Option<i64>,
}

fn title_from_slug(slug: &str) -> String {
    slug.split('-')
        .map(|part| match part {
            "mens" => "Men's".to_string(),
            "womens" => "Women's".to_string(),
            _ => {
                let mut chars = part.chars();
                match chars.next() {
                    Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                    None => String::new(),
                }
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

fn sort_sports(mut sports: Vec<SportInfo>) -> Vec<SportInfo> {
    sports.sort_by(|a, b| a.title.to_lowercase().cmp(&b.title.to_lowercase()));
    sports
}

fn with_fallback(sports: Vec<SportInfo>) -> Vec<SportInfo> {
    if !sports.is_empty() {
        return sports;
    }
    vec![SportInfo {
        slug: DEFAULT_SPORT_SLUG.to_string(),
        title: "Women's Soccer".to_string(),
    }]
}

/// Sidearm interstitial (tickets, season launch) — not a sports nav page.
fn is_athletics_splash_url(u: &str) -> bool {
    url::Url::parse(u)
        .map(|parsed| parsed.path().to_lowercase().ends_with("/splash.aspx"))
        .unwrap_or_else(|_| u.to_lowercase().contains("splash.aspx"))
}

/// Collect roster sports from Classic Sidearm HTML.
/// Prefers `/sports/{slug}/roster` links; otherwise uses `/sports/{slug}`.
pub fn collect_classic_sports(html: &str, origin: &str) -> Vec<SportInfo> {
    let document = Html::parse_document(html);
    let selector = Selector::parse("a[href]").expect("static selector is valid");
    let roster_re = regex::Regex::new(r"(?i)^/sports/([a-z0-9-]+)/roster/?$").unwrap();
    let index_re = regex::Regex::new(r"(?i)^/sports/([a-z0-9-]+)/?$").unwrap();

    let mut roster_slugs: HashSet<String> = HashSet::new();
    let mut index_slugs: HashSet<String> = HashSet::new();

    let base = match url::Url::parse(origin) {
        Ok(u) => u,
        Err(_) => return Vec::new(),
    };

    for el in document.select(&selector) {
        let Some(href) = el.value().attr("href") else {
            continue;
        };
        let Ok(joined) = base.join(href) else {
            continue;
        };
        let path = joined.path();
        if let Some(caps) = roster_re.captures(path) {
            roster_slugs.insert(caps[1].to_lowercase());
            continue;
        }
        if let Some(caps) = index_re.captures(path) {
            index_slugs.insert(caps[1].to_lowercase());
        }
    }

    let slugs = if !roster_slugs.is_empty() {
        roster_slugs
    } else {
        index_slugs
    };

    sort_sports(
        slugs
            .into_iter()
            .map(|slug| SportInfo {
                title: title_from_slug(&slug),
                slug,
            })
            .collect(),
    )
}

async fn list_nextgen_sports(client: &Client, origin: &str) -> Option<Vec<SportInfo>> {
    let res = client
        .get(format!("{origin}/api/v2/Sports"))
        .header("Accept", "application/json")
        .timeout(Duration::from_secs(15))
        .send()
        .await
        .ok()?;
    if !res.status().is_success() {
        return None;
    }
    let data: Vec<SidearmSport> = res.json().await.ok()?;

    let mut by_slug: BTreeMap<String, SportInfo> = BTreeMap::new();
    for raw in data {
        let Some(slug) = raw.global_sport_name_slug.as_deref().map(str::trim) else {
            continue;
        };
        if slug.is_empty() || raw.non_sport || raw.roster_id.is_none() {
            continue;
        }
        let title = raw
            .title
            .as_deref()
            .map(str::trim)
            .filter(|t| !t.is_empty())
            .map(str::to_string)
            .unwrap_or_else(|| title_from_slug(slug));
        by_slug.insert(slug.to_string(), SportInfo {
            slug: slug.to_string(),
            title,
        });
    }

    Some(sort_sports(by_slug.into_values().collect()))
}

pub async fn list_classic_sports(
    client: &Client,
    origin: &str,
) -> Result<Vec<SportInfo>, ScraperError> {
    let candidates = [
        format!("{origin}/"),
        format!("{origin}/sports/{DEFAULT_SPORT_SLUG}/roster"),
    ];

    let mut last_status: Option<reqwest::StatusCode> = None;
    let mut last_error: Option<ScraperError> = None;
    let mut fetched_ok = false;

    for url in &candidates {
        let result = client
            .get(url)
            .timeout(Duration::from_secs(20))
            .send()
            .await;
        let res = match result {
            Ok(res) => res,
            Err(e) => {
                last_error = Some(map_fetch_error(e));
                continue;
            }
        };
        last_status = Some(res.status());
        if !res.status().is_success() {
            continue;
        }
        fetched_ok = true;
        let final_url = res.url().to_string();
        if is_athletics_splash_url(&final_url) {
            continue;
        }
        let html = match res.text().await {
            Ok(html) => html,
            Err(e) => {
                last_error = Some(ScraperError::Http(e.to_string()));
                continue;
            }
        };
        let found = collect_classic_sports(&html, origin);
        if !found.is_empty() {
            return Ok(found);
        }
    }

    if !fetched_ok {
        let detail = last_error
            .map(|e| e.to_string())
            .or_else(|| last_status.map(|s| format!("HTTP {s}")))
            .unwrap_or_else(|| "no response".to_string());
        return Err(ScraperError::Http(format!(
            "Failed to fetch athletics site ({detail})"
        )));
    }

    Ok(Vec::new())
}

/// List sports with rosters for a Sidearm athletics site.
pub async fn list_sports(client: &Client, website: &str) -> Result<Vec<SportInfo>, ScraperError> {
    let origin = origin_from_website(website);
    let next_gen = list_nextgen_sports(client, &origin).await;
    if let Some(ref sports) = next_gen {
        if !sports.is_empty() {
            return Ok(sports.clone());
        }
    }

    match list_classic_sports(client, &origin).await {
        Ok(classic) => Ok(with_fallback(classic)),
        Err(err) => match next_gen {
            Some(sports) => Ok(with_fallback(sports)),
            None => Err(err),
        },
    }
}
