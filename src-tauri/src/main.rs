#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{command};

#[command]
fn handle_action(action: String, task: String) {
  println!("ACTION: {}, TASK: {}", action, task);
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(
      tauri::generate_handler![
        handle_action,
      ]
    )
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
