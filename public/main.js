const form = document.querySelector('form');
const actionInput = document.querySelector('#action');

form.addEventListener('submit', evt => {
  evt.preventDefault();
  console.log(evt.target);
});

actionInput.addEventListener('input', evt => {
  console.log("Value: ", actionInput.value);
});