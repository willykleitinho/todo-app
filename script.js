function ArrayToString(arr) {
  let str = '';
  for (let item of arr) {
    str += `["${item[0]}", ${item[1]}]`;
  }
  return str;
}

class Tasks {
  constructor() {
    this.__tasks = [];
    this.__id = 0;
    this.__view = 'all';
  }

  addTask(title, completed = false) {
    this.__tasks.push(new Task(this.__id++, title, completed));
  }
  
  removeTask(id) {
    this.__tasks.filter(task => task.id !== id);
  }

  saveTasks() {
    let str = '';
    for (let task of this.__tasks) {
      str += `["${task.title}", ${task.completed}]`;
    }
    // TODO
    window.localStorage.setItem('tasks', str);
  }
  
  removeCompleted() {
    this.__tasks = this.__tasks.filter(task => !task.completed);
  }

  renderTasks() {
    let tasksHTML = '';
    switch (this.__view) {
      case 'all':
        this.__tasks.forEach(task => {
          tasksHTML += task.renderTask();
        });
        break;
      case 'active':
        this.__tasks.filter(task => !task.completed).forEach(task => {
          tasksHTML += task.renderTask();
        });
        break;
      case 'completed':
        this.__tasks.filter(task => task.completed).forEach(task => {
          tasksHTML += task.renderTask();
        });
        break;
    }
    this.saveTasks(); // TEMP
    document.getElementById('tasks-list').innerHTML = tasksHTML;
    document.getElementById('items-left').innerText = `${this.__tasks.filter(task => !task.completed).length} items left`;
  }

  changeView(view) {
    document.querySelector(`[data-view="${this.__view}"]`).className = '';
    document.querySelector(`[data-view="${view}"]`).className = 'selected';
    this.__view = view;
  }

  updateTask(id) {
    this.__tasks.find(task => task.id == id).updateTask();
  }

  removeTask(id) {
    const index = this.__tasks.findIndex(task => task.id == id);
    if (index > -1) {
      this.__tasks.splice(index, 1);
    }
  }
}

class Task {
  constructor(id, title, completed = false) {
    this.__id = id;
    this.__title = title;
    this.__completed = completed;
  }
  
  renderTask() {
    return `
      <li class="${this.__completed ? "task done" : "task"}">
        <button class="checkmark" name="complete-task" data-id="${this.__id}"></button>
        <span class="title">${this.__title}</span>
        <button class="remove-task cross" name="delete-task" data-id="${this.__id}"></button>
      </li>
    `;
  }

  updateTask() {
    this.__completed = !this.__completed;
  }

  get title() {
    return this.__title;
  }
  
  get id() {
    return this.__id;
  }
  
  get completed() {
    return this.__completed;
  }
}

// TODO
function toggleTheme() {
  if (document.body.className) {
    document.body.className = '';
  } else {
    document.body.className = 'light-theme';
  }
}

// TODO
let todos = new Tasks();

function updateView(elem) {
  todos.changeView(elem.dataset.view);
  todos.renderTasks();
}

const buttonActions = {
  'all-tasks': updateView,
  'active-tasks': updateView,
  'completed-tasks': updateView,
  'clear-completed': () => {
    todos.removeCompleted();
    todos.renderTasks();
  },
  'add-task': 'add-task',
  'delete-task': (elem) => {
    todos.removeTask(elem.dataset.id);
    todos.renderTasks();
  },
  'complete-task': (elem) => {
    todos.updateTask(elem.dataset.id);
    todos.renderTasks();
  }
}

window.onload = () => {
  console.log('page loaded.');
  document.querySelector('.tasks').addEventListener('click', (ev) => {
    if (ev.target.tagName == 'BUTTON') {
      buttonActions[ev.target.name](ev.target);
    }
  });

  document.querySelector('form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const input = ev.target.firstElementChild;
    todos.addTask(input.value);
    todos.renderTasks();
    input.value = '';
  });

  const tasks = window.localStorage.getItem('tasks');
  if (tasks) {
    let bool = false;
    let taskName = '';

    // This regex matches either the task name, or a boolean.
    // eg. 'task one' or 'false'
    for (let matched of tasks.match(/(false|true)|[\w\d' ]+/gi)) {
      if (bool) {
        todos.addTask(taskName, (matched == ' false') ? false : true);
        bool = false;
      } else {
        taskName = matched;
        bool = true;
      }
    }
  }
  todos.renderTasks();
}


