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
    this.saveTasks(); 
    document.getElementById('tasks-list').innerHTML = tasksHTML;
    document.getElementById('items-left').innerText = `${this.__tasks.filter(task => !task.completed).length} items left`;
  }

  changeView(view) {
    document.querySelector(`[data-view="${view}"]`).className = 'selected';
    document.querySelector(`[data-view="${this.__view}"]`).className = '';
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
      <li class="${this.__completed ? "task done" : "task"}" data-id="${this.__id}" draggable="true">
        <button class="checkmark" name="complete-task"}"></button>
        <span class="title">${this.__title}</span>
        <button class="remove-task cross" name="delete-task"></button>
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
    todos.removeTask(elem.parentElement.dataset.id);
    todos.renderTasks();
  },
  'complete-task': (elem) => {
    todos.updateTask(elem.parentElement.dataset.id);
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


  // drag and drop functionality
  const tasksList = document.getElementById('tasks-list');
  const dropzoneIndicator = document.createElement('li');
  dropzoneIndicator.innerText = "Here is my new place";
  dropzoneIndicator.classList.add('dropzone-indicator');
  /* 
  drag events:

    dragstart       started dragging
    drag            is dragging
    dragend         stopped dragging

    dragenter       dropzone enter
    dragover        dropzone is dragging over
    dragleave       dropzone exit
    drop            dropzone dropped
  */

  document.querySelectorAll('[draggable="true"]').forEach(item => {
    item.addEventListener('dragstart', dragStart);
    // item.addEventListener('drag', dragging);
    item.addEventListener('dragend', dragEnd);
  });

  const tasksListInfo = {
    height: undefined,
    children: undefined,
    taskHeight: undefined
  };

  function dragStart(ev) {
    const tasksList = document.getElementById('tasks-list');
    if (tasksList.childElementCount < 2) {
      console.log('false');
      return false;
    }
    tasksListInfo.height = tasksList.offsetHeight;
    tasksListInfo.children = tasksList.children.length;
    tasksListInfo.taskHeight = Math.ceil(tasksList.offsetHeight / tasksList.children.length)
    this.style.display = 'none';
    tasksList.insertBefore(dropzoneIndicator, this);
  }

  function dragEnd(ev) {
    console.log('stopped');
    tasksList.insertBefore(this, dropzoneIndicator);
    tasksList.removeChild(dropzoneIndicator);
    this.style.display = 'flex';
  }

  tasksList.addEventListener('dragover', function (ev) {
    ev.preventDefault();
    // offY = ev.pageY - this.offsetTop;
    // console.log(offY);
    const underneathElem = document.elementFromPoint(ev.pageX, ev.pageY)
    const middle = underneathElem.offsetTop + underneathElem.offsetHeight / 2;
    if (underneathElem.tagName == 'LI') {
      if (ev.pageY > middle) {
        this.insertBefore(dropzoneIndicator, underneathElem.nextElementSibling);
      } else {
        this.insertBefore(dropzoneIndicator, underneathElem);
      }
    }
  });

}