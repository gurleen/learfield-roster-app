use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Player {
    pub first_name: String,
    pub last_name: String,
    pub full_name: String,
    pub jersey_number: Option<String>,
    pub position: Option<String>,
    pub academic_year: Option<String>,
    pub height: Option<String>,
    pub hometown: Option<String>,
    pub high_school: Option<String>,
    pub previous_school: Option<String>,
    pub major: Option<String>,
    pub bio_url: Option<String>,
    pub headshot_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Coach {
    pub name: String,
    pub title: Option<String>,
    pub bio_url: Option<String>,
    pub headshot_url: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Platform {
    Nextgen,
    Classic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RosterResult {
    pub source_url: String,
    pub platform: Platform,
    pub school_host: String,
    pub sport_slug: String,
    pub title: Option<String>,
    pub season: Option<String>,
    pub players: Vec<Player>,
    pub coaches: Vec<Coach>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SportInfo {
    pub slug: String,
    pub title: String,
}
