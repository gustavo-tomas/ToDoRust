const form = document.querySelector('form');
const [action, task] = document.getElementById('main-form').elements;
const taskList = document.querySelector('#task-list');
// const actionInput = document.querySelector('#action');

/**
 * Render all the tasks retrieved from the database as items in a list.
 * Cleans the current screen before updating.
 */
const renderTasks = () => {
  taskList.innerHTML = "";
  __TAURI__.invoke("get_task").then(result => {
    result.forEach(element => {
      const task = document.createElement('li');
      task.setAttribute('class', 'task-item');
      task.textContent = element;
      taskList.appendChild(task);
    });
  }).catch(() => {
    console.error("Rejected promise to render tasks");
  });
}

/**
 * Render a task as an item in the list
 * @TODO make it prettier
 * @param {result of the submitted form} result 
 */
const renderTask = (result) => {
  let flag = false;
  taskList.childNodes.forEach(child => {
    if (child.innerText == result.task) {
      flag = true;
    }
  });

  if (!flag) {
    const task = document.createElement('li');
    task.setAttribute('class', 'task-item');
    task.textContent = result.task;
    taskList.appendChild(task);
  }
  else {
    window.alert(result.task + " is already in the list!");
  }
}

/**
 * Removes selected task if present in the list
 * @TODO make it prettier
 * @param {result is the object {action: task: } to be removed} result 
 */
const removeRenderedTask = (result) => {
  let flag = false;
  taskList.childNodes.forEach(child => {
    if (child.innerText == result.task) {
      taskList.removeChild(child);
      flag = true;
    }
  });
  if (!flag) {
    window.alert(result.task + " is not in the list!");
  }
}

// Sends Action and Task to Rust back-end by calling function
// handle_action and sending object with fields values as parameters
form.addEventListener('submit', evt => {
  evt.preventDefault();
  console.log("action: ", action.value, "\ntask: ", task.value);
  const result = {
    action: action.value.toLowerCase(),
    task: task.value.toLowerCase()
  };
  __TAURI__.invoke('update_todo', result).then(() => {
    if (result.action == 'add') {
      renderTask(result);
    }
    else if (result.action == 'remove') {
      removeRenderedTask(result);
    }
    else {
      window.alert(result.action + " is not a valid action!");
    }
  }).catch(() => {
    console.error("Rejected promise to update list");
  });
});

// Render tasks on load
window.addEventListener('load', evt => {
  evt.preventDefault();
  renderTasks();
});

// actionInput.addEventListener('input', evt => {
//   console.log("Value: ", actionInput.value);
// });