mod scraper;

#[tauri::command]
async fn fetch_roster(url: String) -> Result<scraper::types::RosterResult, String> {
  scraper::scrape_roster(&url).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_sports(website: String) -> Result<Vec<scraper::types::SportInfo>, String> {
  scraper::list_sports(&website).await.map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![fetch_roster, list_sports])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
