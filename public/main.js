const head = document.querySelector('head');
const form = document.querySelector('form');
const task = form.elements;
const taskList = document.querySelector('#task-list');
const settings = document.querySelector('#settings');
const dropdown = document.querySelector('.dropdown');
const darkmode = document.querySelector('#darkmode');
const font = document.querySelector('#font');
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
 * @TODO see if there is a better way to check for light or dark mode
 * (see if head.contains behave)
 */

// Spins the wheel and shows dropdown menu when clicked and stops when clicked again
settings.addEventListener('click', evt => {
  evt.preventDefault();
  if (dropdown.style.getPropertyValue('visibility') === 'visible') {
    dropdown.ontransitionend = () => {
      dropdown.style.setProperty('visibility', 'hidden');
    }
    settings.style.setProperty('animation', 'none');
    dropdown.style.setProperty('opacity', '0');
  } else {
    dropdown.style.setProperty('visibility', 'visible');
    dropdown.ontransitionend = () => { }
    dropdown.style.setProperty('opacity', '1');
    settings.style.setProperty('animation', 'transform 2s infinite linear');
  }
});

// Changes from light to dark mode on click
darkmode.addEventListener('click', evt => {
  evt.preventDefault();
  const darkmode = document.createElement('link');
  darkmode.setAttribute('rel', 'stylesheet');
  darkmode.setAttribute('href', './darkmode.css');

  if (head.lastElementChild.isEqualNode(darkmode)) {
    head.removeChild(head.lastElementChild);
  } else {
    head.append(darkmode);
  }
});

// Changes font style based on current font
font.addEventListener('click', evt => {
  evt.preventDefault();
  const fonts = [`Gluten`, `Indie Flower`, `Architects Daughter`,
    `Permanent Marker`, `Shadows Into Light`, `Caveat`, `Kalam`];
  
  let currFont = document.body.style.fontFamily;
  currFont = currFont[0] == `"` ? currFont.slice(1, currFont.length - 1) : currFont;
  const nextFont = fonts[(fonts.indexOf(currFont) + 1) % fonts.length];
  document.body.style.fontFamily = nextFont;
});

/**
 * Adds an event listener for the delete button inside the task container.
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
        taskList.removeChild(container);
      }, false);
    }).catch(err => console.error("Rejected promise to delete task: ", err));
  });
}

const createContainer = (text) => {
  const taskContainer = document.createElement('div');
  taskContainer.setAttribute('class', 'task-item-container');
      
  const taskItem = document.createElement('li');
  taskItem.setAttribute('class', 'task-item');
  taskItem.textContent = text;
      
  const span = document.createElement('span');
  span.setAttribute('class', 'material-icons');
  span.setAttribute('title', 'Delete this task');

  const deleteButton = document.createElement('input');
  deleteButton.setAttribute('class', 'button delete-button');
  deleteButton.setAttribute('type', 'button');
  deleteButton.setAttribute('value', 'delete');
  
  span.append(deleteButton);
  taskContainer.append(taskItem, span);
  return taskContainer;
}

/**
 * Render a task as an item in the list if result isnt null. Otherwise,
 * cleans the list and renders all items from database.
 * @param {result of the submitted form {action: task: }} result 
 */
const renderTasks = (result) => {
  
  if (result != null) {
    for (let i = 0; i < taskList.children.length; i++) {
      if (taskList.children[i].children[0].innerText === result.task) {
        window.alert(result.task + " is already in the list!");
        return;
      }
    }
    const taskContainer = createContainer(result.task);
    createListener(taskContainer);
    taskList.appendChild(taskContainer);
    taskList.scrollTo(taskList.scrollWidth, taskList.scrollHeight);
  }
  else {
    __TAURI__.invoke("get_task").then(result => {
      if (result.length != 0) {
        taskList.innerHTML = "";
        result.forEach(element => {
          const taskContainer = createContainer(element);
          createListener(taskContainer);
          taskList.appendChild(taskContainer);
        });
      }
      // Renders tutorial task message
      else {
        const message = taskList.firstElementChild.innerText;
        const taskContainer = createContainer(message);
        taskList.innerHTML = "";
        createListener(taskContainer);
        taskList.appendChild(taskContainer);
      }
    }).catch(err => console.error("Rejected promise to render tasks: ", err));
  }
}

// Sends Action and Task to Rust back-end by calling function
// handle_action and sending object with fields values as parameters
form.addEventListener('submit', evt => {
  evt.preventDefault();
  // closeWarning();
  // showWarning();
  const result = { action: 'add', task: task.item(0).value };
  __TAURI__.invoke('update_todo', result).then(() => {
    renderTasks(result);
    form.reset();
  }).catch(err => console.error("Rejected promise to insert in list: ", err));
});

// Delete all tasks when button is pressed
task.item(2).addEventListener('click', evt => {
  if (taskList.hasChildNodes() <= 0) return;
  confirm('Do you really want to delete all tasks?').then((answer) => {
    if (!answer) {
      return;
    }
    evt.preventDefault();
    __TAURI__.invoke('update_todo', { action: 'purge', task: '' }).then(() => {
      taskList.innerHTML = "";
    }).catch(err => console.error("Rejected promise to purge list: ", err));
  });
});

// Render tasks on load
window.addEventListener('load', evt => {
  evt.preventDefault();
  // closeWarning();
  renderTasks();
  task.item(0).focus();
});
