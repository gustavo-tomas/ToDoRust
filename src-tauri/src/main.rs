#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{command};

use std::collections::HashMap;
use std::fs;
use std::fs::write;
use std::fs::OpenOptions;
use std::io::Error;
use std::io::Read;
use std::str::FromStr;

// Get path to home and returns the path to home/documents 
fn get_path() -> String {
  let db_name = "db.txt";
  let hdr = home::home_dir().unwrap().into_os_string().into_string().unwrap();
  let path_to_db = hdr + "/Documents/ToDoRustDb/";
  let full_path = path_to_db.to_string() + db_name;

  // Tries to access or create directory if it doesn't already exists
  match fs::create_dir_all(&path_to_db) {
    Ok(_) => println!("Path: {} found or created", path_to_db),
    Err(e) => println!("An error has occurred: {}", e),
  }
  return full_path;
}

// Function to return current tasks
#[command]
fn get_task() -> Vec<String> {
  let todo = Todo::new().expect("Failed to initialise db");
  let mut list: Vec<String> = Vec::new();
  todo.map.into_iter().for_each(|i| list.push(i.0.to_string()));
  return list;
}

// Function to update the todo list
#[command]
fn update_todo(action: String, task: String) {
  
  let mut todo = Todo::new().expect("Failed to initialise db");

  if action == "add" {
    todo.insert(task);
    match todo.save() {
      Ok(_) => println!("Todo saved!"),
      Err(why) => println!("An error has occurred: {}", why),
    }
  } 
  else if action == "remove" {
    match todo.remove(&task) {
      None => println!("'{}' is not in the list!", task),
      Some(_) => match todo.save() {
        Ok(_) => println!("Todo updated!"),
        Err(why) => println!("An error has occurred: {}", why),
      },
    }
  }
  else {
    println!("This command doesnt exist!")
  }
}

struct Todo {
  map: HashMap<String, bool>,
}

// Implementation block of Todo
impl Todo {

  // Retrieves data in file
  fn new() -> Result<Todo, Error> {
    
    // Open the file with these permissions
    let mut f = OpenOptions::new()
      .write(true)
      .create(true)
      .read(true)
      .open(get_path())?;

    // Save contents of file in a string
    let mut content = String::new();
    f.read_to_string(&mut content)?;
    
    // Iterates over each line and insert values in the HashMap "map"
    let map: HashMap<String, bool> = content
      .lines()
      .map(|line| line.splitn(2, '\t').collect::<Vec<&str>>())
      .map(|v| (v[0], v[1]))
      .map(|(k, v)| (String::from(k), bool::from_str(v).unwrap()))
      .collect();
    Ok(Todo { map })
  }

  // Insert new item into the map
  fn insert(&mut self, key: String) {
    self.map.insert(key, true);
  }

  // Save the map into file db.txt
  fn save(self) -> Result<(), Error> {
    let mut content = String::new();
    for (k, v) in self.map {
      let record = format!("{}\t{}\n", k, v);
      content.push_str(&record);
    }
    write(get_path(), content)
  }

  // Remove an entry or return None if key is invalid
  fn remove(&mut self, key: &String) -> Option<()> {
    if self.map.contains_key(key) {
      self.map.remove(key);
      return Some(());
    }
    return None;
  }
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(
      tauri::generate_handler![
        update_todo,
        get_task,
      ]
    )
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
