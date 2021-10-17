#![allow(non_snake_case)]   // Allows project name to not be snake case

// Similar to namespaces in c++
use std::collections::HashMap;   
use std::env::args;
use std::fs::write;
use std::fs::OpenOptions;
use std::io::Error;
use std::io::Read;
use std::str::FromStr;

// Path to db.txt
const PATH_TO_DB: &str = "./db/db.txt";

fn main() {

    let action = args().nth(1).expect("Please specify an action!");
    let item   = args().nth(2).expect("Please specify an item!");

    if item.chars().count() <= 0 {
        println!("Item can't be null!");
        return;
    }

    println!("{:?}, {:?}", action, item);
    
    let mut todo = Todo::new().expect("Failed to initialise db");

    if action == "add" {
        todo.insert(item);
        match todo.save() {
            Ok(_) => println!("Todo saved!"),
            Err(why) => println!("An error has occurred: {}", why),
        }
    } else if action == "complete" {
        match todo.complete(&item) {
            None => println!("'{}' is not in the list!", item),
            Some(_) => match todo.save() {
                Ok(_) => println!("Todo updated!"),
                Err(why) => println!("An error has occurred: {}", why),
            },
        }
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

    // Update an entry or return None if key is invalid
    fn complete(&mut self, key: &String) -> Option<()> {
        match self.map.get_mut(key) {
            Some(v) => Some(*v = false),
            None => None,
        }
    }
}