use scraper::{Html, Selector};

use super::error::ScraperError;
use super::types::{Coach, Platform, Player, RosterResult};
use super::url::{parse_roster_url, resolve_original_image_url};

fn sel(selector: &str) -> Selector {
    Selector::parse(selector).expect("static selector is valid")
}

fn text(el: &scraper::ElementRef) -> String {
    let raw: String = el.text().collect::<Vec<_>>().join(" ");
    raw.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn find_text(el: &scraper::ElementRef, selector: &str) -> String {
    el.select(&sel(selector))
        .next()
        .map(|e| text(&e))
        .unwrap_or_default()
}

fn img_src(el: &scraper::ElementRef, selector: &str) -> Option<String> {
    let img = el.select(&sel(selector)).next()?;
    let src = img
        .value()
        .attr("data-src")
        .or_else(|| img.value().attr("src"))?
        .trim();
    if src.is_empty() {
        None
    } else {
        Some(src.to_string())
    }
}

fn split_name(full: &str) -> (String, String) {
    let parts: Vec<&str> = full.trim().split_whitespace().collect();
    match parts.len() {
        0 => (String::new(), String::new()),
        1 => (parts[0].to_string(), String::new()),
        _ => (
            parts[..parts.len() - 1].join(" "),
            parts[parts.len() - 1].to_string(),
        ),
    }
}

fn non_empty(s: String) -> Option<String> {
    if s.is_empty() {
        None
    } else {
        Some(s)
    }
}

fn join_url(origin: &str, path: &str) -> Option<String> {
    url::Url::parse(origin).ok()?.join(path).ok().map(|u| u.into())
}

fn parse_player(el: &scraper::ElementRef, origin: &str) -> Player {
    let jersey = find_text(el, ".sidearm-roster-player-jersey-number");

    let name_link = el.select(&sel(".sidearm-roster-player-name a")).next();
    let full_name = match name_link {
        Some(link) => text(&link),
        None => find_text(el, ".sidearm-roster-player-name"),
    };
    let (first_name, last_name) = split_name(&full_name);

    let position = find_text(el, ".sidearm-roster-player-position-long-short");
    let height = find_text(el, ".sidearm-roster-player-height");
    let academic_year = find_text(el, ".sidearm-roster-player-academic-year");
    let hometown = find_text(el, ".sidearm-roster-player-hometown");
    let high_school = find_text(el, ".sidearm-roster-player-highschool");
    let major = find_text(el, ".sidearm-roster-player-major");
    let previous_school = find_text(
        el,
        ".sidearm-roster-player-previous-school, .sidearm-roster-player-previous",
    );

    let bio_url = el
        .value()
        .attr("data-player-url")
        .and_then(|path| join_url(origin, path));

    let raw_img = img_src(el, ".sidearm-roster-player-image img");

    Player {
        first_name,
        last_name,
        full_name,
        jersey_number: non_empty(jersey),
        position: non_empty(position),
        academic_year: non_empty(academic_year),
        height: non_empty(height),
        hometown: non_empty(hometown),
        high_school: non_empty(high_school),
        previous_school: non_empty(previous_school),
        major: non_empty(major),
        bio_url,
        headshot_url: resolve_original_image_url(raw_img.as_deref(), origin),
    }
}

fn parse_coach(el: &scraper::ElementRef, origin: &str) -> Coach {
    let name = find_text(el, ".sidearm-roster-coach-name");
    let title = find_text(el, ".sidearm-roster-coach-title");
    let bio_url = el
        .select(&sel(".sidearm-roster-coach-link a"))
        .next()
        .and_then(|a| a.value().attr("href").map(str::to_string))
        .and_then(|href| join_url(origin, &href));
    let raw_img = img_src(el, ".sidearm-roster-coach-image img");

    Coach {
        name: non_empty(name).unwrap_or_else(|| "Unknown".to_string()),
        title: non_empty(title),
        bio_url,
        headshot_url: resolve_original_image_url(raw_img.as_deref(), origin),
    }
}

pub fn scrape_classic(roster_url: &str, html: &str) -> Result<RosterResult, ScraperError> {
    let parsed = parse_roster_url(roster_url)?;
    let origin = parsed.origin.as_str();
    let document = Html::parse_document(html);

    let players: Vec<Player> = document
        .select(&sel("li.sidearm-roster-player"))
        .map(|el| parse_player(&el, origin))
        .collect();

    let coaches: Vec<Coach> = document
        .select(&sel("li.sidearm-roster-coach"))
        .map(|el| parse_coach(&el, origin))
        .collect();

    let title = non_empty(find_text(&document.root_element(), "h1"))
        .or_else(|| non_empty(find_text(&document.root_element(), ".sidearm-roster-header h1")));

    let season = document
        .select(&sel("select#sidearm-roster-select-year option[selected]"))
        .next()
        .map(|e| text(&e))
        .or_else(|| {
            document
                .select(&sel("select.sidearm-roster-select-year option[selected]"))
                .next()
                .map(|e| text(&e))
        })
        .and_then(non_empty);

    Ok(RosterResult {
        source_url: parsed.normalized_url,
        platform: Platform::Classic,
        school_host: url::Url::parse(origin)
            .map(|u| u.host_str().unwrap_or_default().to_string())
            .unwrap_or_default(),
        sport_slug: parsed.sport_slug,
        title,
        season,
        players,
        coaches,
    })
}

pub fn html_looks_classic(html: &str) -> bool {
    html.contains("sidearm-roster-player")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn split_name_handles_single_and_multi_token_names() {
        assert_eq!(split_name(""), (String::new(), String::new()));
        assert_eq!(split_name("Madonna"), ("Madonna".to_string(), String::new()));
        assert_eq!(
            split_name("Valentina Espinel"),
            ("Valentina".to_string(), "Espinel".to_string())
        );
        assert_eq!(
            split_name("Mary Jane Watson"),
            ("Mary Jane".to_string(), "Watson".to_string())
        );
    }

    #[test]
    fn html_looks_classic_detects_sidearm_markup() {
        assert!(html_looks_classic("<li class=\"sidearm-roster-player\"></li>"));
        assert!(!html_looks_classic("<div>not a roster page</div>"));
    }

    #[test]
    fn scrapes_players_and_coaches_from_real_classic_fixture() {
        let html = include_str!("testdata/classic_roster_sample.html");
        let result =
            scrape_classic("https://bamastatesports.com/sports/womens-soccer/roster", html)
                .unwrap();

        assert_eq!(result.platform, Platform::Classic);
        assert_eq!(result.school_host, "bamastatesports.com");
        assert_eq!(result.sport_slug, "womens-soccer");
        assert_eq!(result.players.len(), 3);
        assert_eq!(result.coaches.len(), 2);

        let espinel = &result.players[0];
        assert_eq!(espinel.first_name, "Valentina");
        assert_eq!(espinel.last_name, "Espinel");
        assert_eq!(espinel.full_name, "Valentina Espinel");
        assert_eq!(espinel.jersey_number.as_deref(), Some("0"));
        assert_eq!(espinel.height.as_deref(), Some("5'7\""));
        assert_eq!(espinel.hometown.as_deref(), Some("Quito, Ecuador"));
        assert_eq!(
            espinel.previous_school.as_deref(),
            Some("Unidad Educativa Particular Letort")
        );
        assert_eq!(
            espinel.bio_url.as_deref(),
            Some("https://bamastatesports.com/sports/womens-soccer/roster/valentina-espinel/9505")
        );
        assert_eq!(
            espinel.headshot_url.as_deref(),
            Some("https://bamastatesports.com/images/2026/8/7/V_Espinel_2026_WSOC_Headshot.png")
        );

        let wilson = &result.coaches[0];
        assert_eq!(wilson.name, "Alicia Wilson");
        assert_eq!(wilson.title.as_deref(), Some("Head Women's Soccer Coach"));
        assert_eq!(
            wilson.bio_url.as_deref(),
            Some("https://bamastatesports.com/sports/womens-soccer/roster/coaches/alicia-wilson/1536")
        );
    }
}
