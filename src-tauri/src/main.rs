#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

// Similar to namespaces in c++
use tauri::{command};

use std::collections::HashMap;   
use std::fs::write;
use std::fs::OpenOptions;
use std::io::Error;
use std::io::Read;
use std::str::FromStr;

// Path to db.txt -> Change to db_test.txt when in development
const PATH_TO_DB: &str = "../db/db_test.txt";

// Testing
#[command]
fn teste() -> String {
  println!("OYY: {}", "Hello".to_string());
  return format!("Hello");
}

// Function to return current tasks
#[command]
fn get_task() -> Vec<String> {
  let todo = Todo::new().expect("Failed to initialise db");
  // let keys = todo.map.keys();
  let mut list: Vec<String> = Vec::new();
  let iter = todo.map.into_iter();
  for i in iter {
    println!("TASK: {}", i.0.to_string());
    list.push(i.0.to_string());
  }
  return list;
}

// Function to update the todo list
#[command]
fn update_todo(action: String, task: String) {
  
  println!("ACTION: {}, TASK: {}", action, task);
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
      .open(PATH_TO_DB)?;

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
    write(PATH_TO_DB, content)
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
        teste,
      ]
    )
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
