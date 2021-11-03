let todo = [
  {task: 'lol', completed: false},
  {task: 'task 2', completed: false},
  {task: 'task 3', completed: false}
];

// TODO
function toggleTheme() {
  console.log('toggle theme.');
}

// TODO
function renderTasks(tasks) {
  console.log('updating tasks.');
}

// TODO
function clearCompleted(tasks) {
  console.log('clearing completed tasks.')
}

// TODO
function saveTasks(tasks) {
  console.log('saving tasks to local storage.');
}

// TODO
function addTask(tasks) {
  console.log('adding task.');
}

// TODO
window.onload = () => {
  console.log('page loaded.');
  document.querySelector('.controls').addEventListener('click', (ev) => {
    if (ev.target.tagName == 'BUTTON') {
      console.log(buttonActions[ev.target.name]);
    }
  })
}

const buttonActions = {
  'all-tasks': 'all-tasks',
  'active-tasks': 'active-tasks',
  'completed-tasks': 'completed-tasks',
  'clear-completed': 'clear-completed',
  'add-task': 'add-task',
  'remove-task': 'remove-task'
}
