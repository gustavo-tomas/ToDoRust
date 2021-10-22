const form = document.querySelector('form');
const [action, task] = document.getElementById('main-form').elements;
const taskList = document.querySelector('#task-list');
const alertNode = document.querySelector('.alert');

/**
 * Close generated warnings
 * @TODO finish warning
 */
const closeWarning = () => {
  var alert = bootstrap.Alert.getInstance(alertNode);
  alert.close();
  // $('.alert').alert('close');
}

const showWarning = () => {
  warning.hidden = false;
  $().alert('show');
}

/**
 * Render all the tasks retrieved from the database as items in a list.
 * Cleans the current screen before updating.
 */
const renderTasks = () => {
  __TAURI__.invoke("get_task").then(result => {
    taskList.innerHTML = "";
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
  // closeWarning();
  // showWarning();
  const result = {
    action: action.value.toLowerCase(),
    task: task.value.toLowerCase()
  };
  __TAURI__.invoke('update_todo', result).then(() => {
    switch (result.action) {
      case 'add':
        renderTask(result);
        break;
      case 'remove':
        removeRenderedTask(result);
        break;
      default:
        window.alert(result.action + " is not a valid action!");
        break;
    }
  }).catch(() => {
    console.error("Rejected promise to update list");
  });
});

// Render tasks on load
window.addEventListener('load', evt => {
  evt.preventDefault();
  // closeWarning();
  renderTasks();
});
