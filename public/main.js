const form = document.querySelector('form');
const [action, task] = document.getElementById('main-form').elements;
// const actionInput = document.querySelector('#action');

/**
 * Sends Action and Activity to Rust back-end by calling function
 * handle_action and sending object with fields values as parameters
 */
form.addEventListener('submit', evt => {
  evt.preventDefault();
  console.log("action: ", action.value, "\ntask: ", task.value);
  __TAURI__.invoke('handle_action', {
    action: action.value,
    task: task.value
  });
});

// actionInput.addEventListener('input', evt => {
//   console.log("Value: ", actionInput.value);
// });