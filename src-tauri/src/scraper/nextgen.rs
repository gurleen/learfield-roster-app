use reqwest::Client;
use serde::Deserialize;

use super::error::ScraperError;
use super::fetch::map_fetch_error;
use super::types::{Coach, Platform, Player, RosterResult};
use super::url::{parse_roster_url, resolve_original_image_url};

#[derive(Debug, Deserialize)]
struct SidearmSport {
    id: i64,
    #[serde(rename = "globalSportNameSlug")]
    global_sport_name_slug: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SidearmImage {
    url: Option<String>,
    #[serde(rename = "absoluteUrl")]
    absolute_url: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SidearmPlayer {
    #[serde(rename = "firstName")]
    first_name: Option<String>,
    #[serde(rename = "lastName")]
    last_name: Option<String>,
    #[serde(rename = "jerseyNumber")]
    jersey_number: Option<String>,
    #[serde(rename = "positionShort")]
    position_short: Option<String>,
    #[serde(rename = "academicYearShort")]
    academic_year_short: Option<String>,
    #[serde(rename = "heightFeet")]
    height_feet: Option<i64>,
    #[serde(rename = "heightInches")]
    height_inches: Option<i64>,
    hometown: Option<String>,
    #[serde(rename = "highSchool")]
    high_school: Option<String>,
    #[serde(rename = "previousSchool")]
    previous_school: Option<String>,
    major: Option<String>,
    image: Option<SidearmImage>,
    #[serde(rename = "rosterPlayerId")]
    roster_player_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
struct SidearmCoach {
    #[serde(rename = "firstName")]
    first_name: Option<String>,
    #[serde(rename = "lastName")]
    last_name: Option<String>,
    title: Option<String>,
    image: Option<SidearmImage>,
    #[serde(rename = "staffId")]
    staff_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
struct SidearmSeason {
    title: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SidearmRoster {
    id: i64,
    #[serde(rename = "displayTitle")]
    display_title: Option<String>,
    season: Option<SidearmSeason>,
    players: Option<Vec<SidearmPlayer>>,
    coaches: Option<Vec<SidearmCoach>>,
}

#[derive(Debug, Deserialize)]
struct RostersListResponse {
    items: Option<Vec<SidearmRoster>>,
}

fn format_height(feet: Option<i64>, inches: Option<i64>) -> Option<String> {
    if feet.is_none() && inches.is_none() {
        return None;
    }
    let f = feet.unwrap_or(0);
    let i = inches.unwrap_or(0);
    if f == 0 && i == 0 {
        return None;
    }
    Some(format!("{f}' {i}''"))
}

fn slugify_name(first: &str, last: &str) -> String {
    let combined = format!("{first}-{last}").to_lowercase();
    let mut slug = String::new();
    let mut last_was_dash = false;
    for c in combined.chars() {
        if c.is_ascii_alphanumeric() {
            slug.push(c);
            last_was_dash = false;
        } else if !last_was_dash {
            slug.push('-');
            last_was_dash = true;
        }
    }
    slug.trim_matches('-').to_string()
}

fn non_empty(s: Option<String>) -> Option<String> {
    s.map(|s| s.trim().to_string()).filter(|s| !s.is_empty())
}

fn player_headshot(p: &SidearmPlayer, origin: &str) -> Option<String> {
    let raw = p
        .image
        .as_ref()
        .and_then(|img| img.absolute_url.clone().or_else(|| img.url.clone()));
    resolve_original_image_url(raw.as_deref(), origin)
}

fn coach_name(c: &SidearmCoach) -> String {
    let parts: Vec<&str> = [c.first_name.as_deref(), c.last_name.as_deref()]
        .into_iter()
        .flatten()
        .collect();
    let name = parts.join(" ").trim().to_string();
    if name.is_empty() {
        "Unknown".to_string()
    } else {
        name
    }
}

fn map_player(p: &SidearmPlayer, origin: &str, sport_slug: &str) -> Player {
    let first_name = p.first_name.clone().unwrap_or_default();
    let last_name = p.last_name.clone().unwrap_or_default();

    let bio_url = p.roster_player_id.map(|id| {
        format!(
            "{origin}/sports/{sport_slug}/roster/{}/{id}",
            slugify_name(&first_name, &last_name)
        )
    });

    let full_name = [first_name.as_str(), last_name.as_str()]
        .into_iter()
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join(" ")
        .trim()
        .to_string();

    Player {
        first_name,
        last_name,
        full_name,
        jersey_number: non_empty(p.jersey_number.clone()),
        position: non_empty(p.position_short.clone()),
        academic_year: non_empty(p.academic_year_short.clone()),
        height: format_height(p.height_feet, p.height_inches),
        hometown: non_empty(p.hometown.clone()),
        high_school: non_empty(p.high_school.clone()),
        previous_school: non_empty(p.previous_school.clone()),
        major: non_empty(p.major.clone()),
        bio_url,
        headshot_url: player_headshot(p, origin),
    }
}

fn map_coach(c: &SidearmCoach, origin: &str) -> Coach {
    let raw = c
        .image
        .as_ref()
        .and_then(|img| img.absolute_url.clone().or_else(|| img.url.clone()));

    Coach {
        name: coach_name(c),
        title: non_empty(c.title.clone()),
        bio_url: c
            .staff_id
            .map(|id| format!("{origin}/sports/staff-directory/bios/{id}")),
        headshot_url: resolve_original_image_url(raw.as_deref(), origin),
    }
}

async fn fetch_json<T: serde::de::DeserializeOwned>(
    client: &Client,
    url: &str,
) -> Result<T, ScraperError> {
    let res = client
        .get(url)
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(map_fetch_error)?;
    if !res.status().is_success() {
        return Err(ScraperError::Http(format!(
            "NextGen API failed ({}): {url}",
            res.status()
        )));
    }
    res.json::<T>()
        .await
        .map_err(|e| ScraperError::Parse(e.to_string()))
}

pub async fn scrape_nextgen(
    client: &Client,
    roster_url: &str,
) -> Result<RosterResult, ScraperError> {
    let parsed = parse_roster_url(roster_url)?;
    let origin = parsed.origin.as_str();
    let sport_slug = parsed.sport_slug.as_str();

    let sports: Vec<SidearmSport> =
        fetch_json(client, &format!("{origin}/api/v2/Sports")).await?;
    let sport = sports
        .into_iter()
        .find(|s| s.global_sport_name_slug.as_deref() == Some(sport_slug))
        .ok_or_else(|| {
            ScraperError::NotFound(format!("Sport \"{sport_slug}\" not found on {origin}"))
        })?;

    let list: RostersListResponse = fetch_json(
        client,
        &format!("{origin}/api/v2/Rosters?sportId={}", sport.id),
    )
    .await?;
    let roster = list.items.and_then(|items| items.into_iter().next()).ok_or_else(|| {
        ScraperError::NotFound(format!("No roster found for sport id {}", sport.id))
    })?;

    let detail = if roster.players.as_ref().map(|p| p.is_empty()).unwrap_or(true) {
        fetch_json(client, &format!("{origin}/api/v2/Rosters/{}", roster.id)).await?
    } else {
        roster
    };

    let players = detail
        .players
        .unwrap_or_default()
        .iter()
        .map(|p| map_player(p, origin, sport_slug))
        .collect();
    let coaches = detail
        .coaches
        .unwrap_or_default()
        .iter()
        .map(|c| map_coach(c, origin))
        .collect();

    Ok(RosterResult {
        source_url: parsed.normalized_url,
        platform: Platform::Nextgen,
        school_host: url::Url::parse(origin)
            .map(|u| u.host_str().unwrap_or_default().to_string())
            .unwrap_or_default(),
        sport_slug: sport_slug.to_string(),
        title: non_empty(detail.display_title),
        season: non_empty(detail.season.and_then(|s| s.title)),
        players,
        coaches,
    })
}

pub async fn is_nextgen(client: &Client, origin: &str) -> bool {
    let res = client
        .get(format!("{origin}/api/v2/Sports"))
        .header("Accept", "application/json")
        .timeout(std::time::Duration::from_secs(15))
        .send()
        .await;
    let Ok(res) = res else { return false };
    if !res.status().is_success() {
        return false;
    }
    matches!(
        res.json::<serde_json::Value>().await,
        Ok(serde_json::Value::Array(_))
    )
}
