const form = document.querySelector('form');
const [action, task] = document.getElementById('main-form').elements;
const taskList = document.querySelector('#task-list');
// const actionInput = document.querySelector('#action');

/**
 * Sends Action and Activity to Rust back-end by calling function
 * handle_action and sending object with fields values as parameters
 */
form.addEventListener('submit', evt => {
  evt.preventDefault();
  console.log("action: ", action.value, "\ntask: ", task.value);
  __TAURI__.invoke('update_todo', {
    action: action.value.toLowerCase(),
    task: task.value.toLowerCase()
  });
});

/**
 * Renders tasks on load
 * @TODO finish
 */
window.addEventListener('load', () => {
  console.log("WERE IN")
  
  __TAURI__.invoke("get_task").then(result => {
    console.log("RESULT LENGTH: ", result.length);
    console.log("RESULT: ", [...result]);
    const task = document.createElement('li');
    task.setAttribute('class', 'task-item');
    result.forEach(element => {
      task.textContent = element;
      taskList.appendChild(task);
    });
  }).catch(() => {
    console.log("Rejected promise to render tasks");
  });
});

// actionInput.addEventListener('input', evt => {
//   console.log("Value: ", actionInput.value);
// });