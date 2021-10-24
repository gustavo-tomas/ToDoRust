#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{command};

use std::fs;
use std::fs::write;
use std::fs::OpenOptions;
use std::io::Error;
use std::io::Read;

// Get path to home and returns the path to home/documents 
fn get_path() -> String {
  let db_name = "db.txt";
  let hdr = home::home_dir().unwrap().into_os_string().into_string().unwrap();
  let path_to_db = hdr + "/Documents/ToDoRustDb/";
  let full_path = path_to_db.to_string() + db_name;

  // Tries to access or create directory if it doesn't already exists
  match fs::create_dir_all(&path_to_db) {
    Ok(_) => print!(""),
    Err(e) => println!("An error has occurred: {}", e),
  }
  return full_path;
}

// Function to return current tasks
#[command]
fn get_task() -> Vec<String> {
  let todo = Todo::new().expect("Failed to initialise db");
  let mut list: Vec<String> = Vec::new();
  todo.list.into_iter().for_each(|i| list.push(i));
  return list;
}

// Function to update the todo list
#[command]
fn update_todo(action: String, task: String) {
  
  let mut todo = Todo::new().expect("Failed to initialise db");

  if action == "add" {
    todo.insert(task);
    match todo.save() {
      Ok(_) => println!("Todo saved"),
      Err(why) => println!("An error has occurred: {}", why),
    }
  } 
  else if action == "remove" {
    match todo.remove(&task) {
      None => println!("'{}' is not in the list!", task),
      Some(_) => match todo.save() {
        Ok(_) => println!("Todo saved"),
        Err(why) => println!("An error has occurred: {}", why),
      },
    }
  }
  else if action == "purge" {
    todo.purge();
    match todo.save() {
      Ok(_) => println!("Db purged"),
      Err(why) => println!("An error has occurred: {}", why),
    }
  }
  else {
    println!("This command doesnt exist!")
  }
}

struct Todo {
  list: Vec<String>,
}

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
    
    // Iterates over each line and insert values in the Vec "list"
    let list: Vec<String> = content
      .lines()
      .map(|line| line.to_string())
      .collect();
    Ok(Todo { list })
  }

  // Insert new item in the list
  fn insert(&mut self, value: String) {
    if !self.list.contains(&value) {
      self.list.push(value);
    }
  }

  // Save list into file
  fn save(self) -> Result<(), Error> {
    let mut content = String::new();
    for value in self.list {
      let record = format!("{}\n", value);
      content.push_str(&record);
    }
    return write(get_path(), content);
  }

  // Remove an entry or return None if value is not in the list
  fn remove(&mut self, value: &String) -> Option<()> {
    return 
      if self.list.contains(value) { self.list.retain(|v| v != value); Some(()) }
      else { None }
  }

  // Clear entire list
  fn purge(&mut self) {
    self.list.clear();
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
