const form = document.querySelector('form');
const task = form.elements;
const taskList = document.querySelector('#task-list');
// const alertNode = document.querySelector('.alert');

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
 * Adds an event listener for the button inside the task container.
 * If the delete button in activated, the task is deleted.
 * @param {the container of the task} container 
 */
const createListener = (container) => {
  container.children[1].firstChild.addEventListener('click', evt => {
    evt.preventDefault();
    const result = {
      action: "remove",
      task: container.children[0].innerText
    }

    // Delete the task after a transition ends
    __TAURI__.invoke('update_todo', result).then(() => {
      container.setAttribute('class', 'task-item-container fade-transition');
      container.addEventListener('transitionend', () => {
        evt.preventDefault();
        taskList.removeChild(container);
      }, false);
    }).catch(err => console.error("Rejected promise to update list: ", err));
  });
}

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
      span.setAttribute('title', 'Delete this task');

      const deleteButton = document.createElement('input');
      deleteButton.setAttribute('class', 'button delete-button');
      deleteButton.setAttribute('type', 'button');
      deleteButton.setAttribute('value', 'delete');
      
      span.append(deleteButton);
      taskContainer.append(taskItem, span);
      createListener(taskContainer);
      taskList.appendChild(taskContainer);
    });
  }).catch(err => console.error("Rejected promise to render tasks: ", err));
}

/**
 * Render a task as an item in the list
 * @TODO make it DRY (see if can be merged with renderTasks)
 * @param {result of the submitted form {action: task: }} result 
 */
const renderTask = (result) => {

  for (let i = 0; i < taskList.children.length; i++) {
    if (taskList.children[i].children[0].innerText === result.task) {
      window.alert(result.task + " is already in the list!");
      return;
    }
  }

  const taskContainer = document.createElement('div');
  taskContainer.setAttribute('class', 'task-item-container');
      
  const taskItem = document.createElement('li');
  taskItem.setAttribute('class', 'task-item');
  taskItem.textContent = result.task;
      
  const span = document.createElement('span');
  span.setAttribute('class', 'material-icons');
  span.setAttribute('title', 'Delete this task');

  const deleteButton = document.createElement('input');
  deleteButton.setAttribute('class', 'button delete-button');
  deleteButton.setAttribute('type', 'button');
  deleteButton.setAttribute('value', 'delete');
  
  span.append(deleteButton);
  taskContainer.append(taskItem, span);
  createListener(taskContainer);
  taskList.appendChild(taskContainer);
}

// Sends Action and Task to Rust back-end by calling function
// handle_action and sending object with fields values as parameters
form.addEventListener('submit', evt => {
  evt.preventDefault();
  // closeWarning();
  // showWarning();
  const result = {
    action: 'add',
    task: task.item(0).value
  };
  __TAURI__.invoke('update_todo', result).then(() => {
    renderTask(result);
    form.reset();
  }).catch(err => console.error("Rejected promise to update list: ", err));
});

// Render tasks on load
window.addEventListener('load', evt => {
  evt.preventDefault();
  // closeWarning();
  renderTasks();
  task.item(0).focus();
});
