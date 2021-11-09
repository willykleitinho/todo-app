
// Task manager with localStorage saving
// and Drag and Drop (only on desktop)

class Tasks {
  constructor() {
    this.__tasks = [];
    this.__id = 0;
    this.__view = 'all';
  }

  addTask(title, completed = false) {
    this.__tasks.push(new Task(this.__id++, title, completed));
  }

  // save tasks to the local storage in a format of 
  // [String, Boolean] arrays
  // eg. ["task 1", false]
  saveTasks() {
    let str = '';
    for (let task of this.__tasks) {
      str += `["${task.title}", ${task.completed}]`;
    }
    window.localStorage.setItem('tasks', str);
  }
  
  removeCompleted() {
    this.__tasks = this.__tasks.filter(task => !task.completed);
    this.renderTasks();
  }

  // Filter and render tasks based on view mode
  renderTasks() {
    let tasksHTML = '';
    let position = 1;

    switch (this.__view) {
      case 'all':
        this.__tasks.forEach(task => {
          tasksHTML += task.renderTask(position++);
        });
        break;

      case 'active':
        this.__tasks.filter(task => !task.completed).forEach(task => {
          tasksHTML += task.renderTask(position++);
        });
        break;

      case 'completed':
        this.__tasks.filter(task => task.completed).forEach(task => {
          tasksHTML += task.renderTask(position++);
        });
        break;
    }

    this.saveTasks();

    document.getElementById('tasks-list').innerHTML = tasksHTML;
    document.getElementById('items-left').innerText = `${this.__tasks.filter(task => !task.completed).length} item(s) left`;

    // Add drag and drop event listeners
    document.querySelectorAll('[draggable="true"').forEach(task => {
      task.addEventListener('dragstart', dragStart);
      task.addEventListener('dragend', dragEnd);
    });
  }

  changeView(view) {
    document.querySelector(`[data-view="${view}"]`).className = 'selected';
    document.querySelector(`[data-view="${this.__view}"]`).className = '';

    this.__view = view;
    this.renderTasks();
  }

  updateTask(id) {
    this.__tasks.find(task => task.id == id).switchState();
    this.renderTasks();
  }

  removeTask(id) {
    const index = this.__tasks.findIndex(task => task.id == id);

    if (index > -1) {
      this.__tasks.splice(index, 1);
    }

    this.renderTasks();
  }

  // Save in localStorage the tasks that where changed
  // using the drag and drop and render them again
  updatePositions() {
    const newTasks = [];

    document.querySelectorAll('.task').forEach(item => {
      newTasks.push(this.__tasks.find(task => task.id == item.dataset.id));
    });

    this.__tasks = newTasks;
    this.renderTasks();
  }
}

class Task {
  constructor(id, title, completed = false) {
    this.__id = id;
    this.__title = title;
    this.__completed = completed;
  }
  
  renderTask(position) {
    return `
      <li class="${this.__completed ? "task done" : "task"}" data-position="${position}" data-id="${this.__id}" draggable="true">
        <button class="checkmark" name="complete-task"}"><span class="hidden">Update task state</span></button>
        <span class="title">${this.__title}</span>
        <button class="remove-task-button" name="delete-task"><span class="hidden">Delete task</span></button>
      </li>
    `;
  }

  // If task is completed, mark it as
  // uncompleted, and vice versa
  switchState() {
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

function toggleTheme() {
  if (document.body.className) {
    document.body.className = '';
    window.localStorage.setItem('theme', 'dark');
  } else {
    document.body.className = 'light-theme';
    window.localStorage.setItem('theme', 'light');
  }
}

// Init Task Manager
let todos = new Tasks();

function updateView(elem) {
  todos.changeView(elem.dataset.view);
}

const buttonActions = {
  'all-tasks': updateView,
  'active-tasks': updateView,
  'completed-tasks': updateView,
  'clear-completed': () => {
    todos.removeCompleted();
  },
  'delete-task': (elem) => {
    todos.removeTask(elem.parentElement.dataset.id);
  },
  'complete-task': (elem) => {
    todos.updateTask(elem.parentElement.dataset.id);
  }
}

// Add event listeners when page loads
window.onload = () => {
  const theme = window.localStorage.getItem('theme');
  if (theme) {
    if (theme == 'light') {
      document.body.className = 'light-theme';
    }
  }

  document.querySelector('.tasks').addEventListener('click', (ev) => {
    if (ev.target.tagName == 'BUTTON') {
      buttonActions[ev.target.name](ev.target);
    }
  });

  document.getElementById('add-task-form').addEventListener('submit', (ev) => {
    ev.preventDefault();

    const input = ev.target.querySelector('#add-task-input');

    if (input.value) {
      todos.addTask(input.value.slice(0, 35));
      todos.renderTasks();

      input.value = '';
    }
  });

  // Get tasks from local storage and load them
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
    todos.renderTasks();
  }
  
  const tasksList = document.getElementById('tasks-list');

  // Drag and drop (while dragging inside tasks list)
  tasksList.addEventListener('dragover', function (ev) {
    ev.preventDefault();
    
    const underneathElem = document.elementFromPoint(ev.pageX, ev.pageY);
    const middle = underneathElem.offsetTop + underneathElem.offsetHeight / 2;

    if (underneathElem.tagName == 'LI') {
      if (ev.pageY > middle) {
        // if underneathElem (element under mouse pointer) has a sibling
        if (sibling = underneathElem.nextElementSibling) {
          this.insertBefore(dropzoneIndicator, underneathElem.nextElementSibling);
        } else {
          tasksList.appendChild(dropzoneIndicator);
        }
      } else {
        this.insertBefore(dropzoneIndicator, underneathElem);
      }
    }
  });

}

// Drag and drop functionality

/* 
  drag events:

    dragstart     started dragging
    dragend       stopped dragging

    dragover      dragging over dropzone
*/

// Dropzone indicator element
const dropzoneIndicator = document.createElement('li');
dropzoneIndicator.innerText = "Here is my new place";
dropzoneIndicator.classList.add('dropzone-indicator');

// Temp reservoir for tasks list info
const tasksListInfo = {
  height: undefined,
  children: undefined,
  taskElemHeight: undefined
};


// dragstart event handler
function dragStart(ev) {
  const tasksList = document.getElementById('tasks-list');

  tasksListInfo.height = tasksList.offsetHeight;
  tasksListInfo.children = tasksList.children.length;
  tasksListInfo.taskElemHeight = Math.ceil(tasksList.offsetHeight / tasksList.children.length);

  // this: dragged element
  tasksList.insertBefore(dropzoneIndicator, this);
  this.style.display = 'none';
}


// dragend event handler
function dragEnd(ev) {
  const tasksList = document.getElementById('tasks-list');

  // this: dragged element
  tasksList.insertBefore(this, dropzoneIndicator);
  tasksList.removeChild(dropzoneIndicator);

  this.style.display = 'flex';

  todos.updatePositions();
}
