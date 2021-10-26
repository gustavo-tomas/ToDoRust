# ToDoRust 📝

**ToDoRust** is a simple ToDo Task Manager made with [Rust](https://www.rust-lang.org) and [Tauri](https://tauri.studio/en/).

### Installing
To install ToDoRust, simply go to the [Releases](https://github.com/gustavo-tomas/ToDoRust/releases) section and click on latest. Then, download the assets acording to your Operating System:

#### Ubuntu
- .AppImage -> see issue [#14](https://github.com/gustavo-tomas/ToDoRust/issues/14)
- .deb

#### Windows
- .msi

#### MacOS
- .dmg

### Uninstalling
In Windows or Mac uninstalling is pretty straight forward. However, in **Ubuntu** there are cases when the Ubuntu Store doesn't show or can't uninstall your app. If thats the case, use the command `$ sudo apt purge to-do-rust` to uninstall it by force.

### Generated Folders & Files
To store the tasks, ToDoRust creates/opens a folder `$HOME/user/Documents/ToDoRustDb`. This folder contains a text file `db.txt` with all your tasks. In case you need to open or manage your annotations, you can access them in that folder. Keep in mind that uninstalling the app **does not** erases that folder. You need to delete it **manually**.

### Build your own
If you want to try and make your own ToDo with [Tauri](https://github.com/tauri-apps/tauri) or just learn [Rust](https://www.rust-lang.org), this [freeCodeCamp](https://www.freecodecamp.org/news/how-to-build-a-to-do-app-with-rust/) tutorial is a good starting point.

### Special Thanks
Thank you [Luiz](https://github.com/luizschonarth) ❤️ for helping me with debugging and consulting in general.

Finally, thank you for taking your time to read this and using my app! ❤️
