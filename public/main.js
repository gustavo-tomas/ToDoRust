const form = document.querySelector('form');
const task = form.elements;
const taskList = document.querySelector('#task-list');
// const alertNode = document.querySelector('.alert');

/**
 * @TODO finish delete tasks logic
 */

/**
 * Close generated warnings
 * @TODO finish warning
 */
// const closeWarning = () => {
//   var alert = bootstrap.Alert.getInstance(alertNode);
//   alert.close();
//   // $('.alert').alert('close');
// }

// const showWarning = () => {
//   warning.hidden = false;
//   $().alert('show');
// }

/**
 * Render all the tasks retrieved from the database as items in a list.
 * Cleans the current screen before updating.
 */
const renderTasks = () => {
  __TAURI__.invoke("get_task").then(result => {
    taskList.innerHTML = "";
    result.forEach(element => {
      const taskContainer = document.createElement('div');
      taskContainer.setAttribute('class', 'task-item-container');
      
      const taskItem = document.createElement('li');
      taskItem.setAttribute('class', 'task-item');
      taskItem.textContent = element;
      
      const span = document.createElement('span');
      span.setAttribute('class', 'material-icons');

      const deleteButton = document.createElement('input');
      deleteButton.setAttribute('class', 'button delete-button');
      deleteButton.setAttribute('type', 'submit');
      deleteButton.setAttribute('value', 'delete');
      
      span.append(deleteButton);
      taskContainer.append(taskItem, span);
      taskList.appendChild(taskContainer);
    });
  }).catch(err => console.error("Rejected promise to render tasks: ", err));
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
    taskList.prepend(task);
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
    form.reset();
  }).catch(err => console.error("Rejected promise to update list: ", err));
});

// Render tasks on load
window.addEventListener('load', evt => {
  evt.preventDefault();
  // closeWarning();
  renderTasks();
});
