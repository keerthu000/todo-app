// Load tasks from localStorage on page load
document.addEventListener('DOMContentLoaded', function () {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => addTaskToDOM(task.title, task.content, task.dueDate, task.completed));
});

// Add Task Button Event Listener

document.getElementById('addTaskButton').addEventListener('click', function () {
    const title = document.getElementById('taskTitle').value.trim();
    const content = document.getElementById('taskContent').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;

    if (title && content && dueDate) {
        const task = { title, content, dueDate, completed: false };
        saveTaskToLocalStorage(task);
        addTaskToDOM(task.title, task.content, task.dueDate, task.completed);

        // Reset form
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskContent').value = '';
        document.getElementById('taskDueDate').value = '';
        showToast('Task added successfully!', 'success'); 
    } else {
        showToast('Please fill out all fields!', 'danger');
        alert('Please fill out all fields.');
    }
});

// Function to Save Task to localStorage
function saveTaskToLocalStorage(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to Remove Task from localStorage
function removeTaskFromLocalStorage(title) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.filter(task => task.title !== title);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

// Function to Update Task in localStorage
function updateTaskInLocalStorage(title, completed) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.map(task => {
        if (task.title === title) {
            task.completed = completed;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

// Function to Add Task to DOM
function addTaskToDOM(title, content, dueDate, completed) {
    const taskList = document.getElementById('taskList');

    const taskItem = document.createElement('li');
    taskItem.className = `list-group-item d-flex justify-content-between align-items-center animate__animated animate__fadeIn ${completed ? 'task-complete' : ''}`;

    const taskDetails = document.createElement('div');
    taskDetails.className = 'flex-grow-1';
    taskDetails.innerHTML = `
    <li class="list-item">
        <div class="task-details">
            <div class="task-title"><i class="fas fa-tasks"></i> ${title}</div>
            <div class="task-content"><i class="fas fa-align-left"></i> ${content}</div>
            <div class="task-due-date text-muted"><i class="fas fa-calendar-alt"></i> Due: ${dueDate}</div>
            ${completed ? '<div class="badge bg-success mt-2">✅ Task Completed</div>' : '<span class="badge bg-warning text-dark">Pending</span>'}
        </div>
`;


    const taskActions = document.createElement('div');
    taskActions.className = 'd-flex align-items-center gap-2';
    taskActions.innerHTML = `
    <div class="task-actions">
        <button class="completeTaskButton" title="Mark as done"><i class="fas fa-check-circle text-success"></i></button>
        <button class="editTaskButton" title="Edit"><i class="fas fa-edit text-warning"></i></button>
        <button class="deleteTaskButton" title="Delete"><i class="fas fa-trash-alt text-danger"></i></button>
    </div>
    </li>
    `;

    taskItem.appendChild(taskDetails);
    taskItem.appendChild(taskActions);
    taskList.appendChild(taskItem);

    // Complete Task
taskActions.querySelector('.completeTaskButton').addEventListener('click', function () {
    const isNowCompleted = !completed;
    // Update DOM visually
    if (isNowCompleted) {
        taskItem.classList.add('task-complete');
        taskDetails.querySelector('.badge')?.classList.remove('bg-warning', 'text-dark');
        taskDetails.querySelector('.badge')?.classList.add('bg-success');
        taskDetails.querySelector('.badge').textContent = "✅ Task Completed";
    } else {
        taskItem.classList.remove('task-complete');
        taskDetails.querySelector('.badge')?.classList.remove('bg-success');
        taskDetails.querySelector('.badge')?.classList.add('bg-warning', 'text-dark');
        taskDetails.querySelector('.badge').textContent = "Pending";
    }

    // Update localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.map(task => {
        if (task.title === title && task.content === content && task.dueDate === dueDate) {
            task.completed = isNowCompleted;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
});


    // Edit Task
    taskActions.querySelector('.editTaskButton').addEventListener('click', function () {
        const newTitle = prompt('Edit Task Title:', title);
        const newContent = prompt('Edit Task Content:', content);
        const newDueDate = prompt('Edit Due Date:', dueDate);

        taskDetails.innerHTML = `
        <div class="task-title"><i class="fas fa-tasks"></i> ${newTitle}</div>
        <div class="task-content"><i class="fas fa-align-left"></i> ${newContent}</div>
        <div class="task-due-date text-muted"><i class="fas fa-calendar-alt"></i> Due: ${newDueDate}</div>
        ${completed ? '<div class="badge bg-success mt-2">✅ Task Completed</div>' : ''}
    `;
    
            removeTaskFromLocalStorage(title);
            saveTaskToLocalStorage({ title: newTitle, content: newContent, dueDate: newDueDate, completed });
        
    });

    // Delete Task
    taskActions.querySelector('.deleteTaskButton').addEventListener('click', function () {
        taskItem.classList.add('animate__animated', 'animate__fadeOut');
        showToast('Task deleted.', 'warning'); 
        setTimeout(() => {
            taskList.removeChild(taskItem);
            removeTaskFromLocalStorage(title);
        }, 500);
    });
}
document.getElementById('searchInput').addEventListener('input', filterTasks);
document.getElementById('filterStatus').addEventListener('change', filterTasks);
function filterTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterValue = document.getElementById('filterStatus').value;

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm) ||
            task.content.toLowerCase().includes(searchTerm);

        const matchesStatus =
            filterValue === 'all' ||
            (filterValue === 'completed' && task.completed) ||
            (filterValue === 'pending' && !task.completed);

        return matchesSearch && matchesStatus;
    });

    renderTaskList(filteredTasks);
}
function renderTaskList(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Clear current list

    tasks.forEach(task => {
        addTaskToDOM(task.title, task.content, task.dueDate, task.completed);
    });
}
// Export tasks as JSON
document.getElementById('exportJson').addEventListener('click', function () {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'tasks.json');
});

// Export tasks as Plain Text
document.getElementById('exportText').addEventListener('click', function () {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const text = tasks.map((task, index) => 
        `Task ${index + 1}:\nTitle: ${task.title}\nContent: ${task.content}\nDue Date: ${task.dueDate}\nStatus: ${task.completed ? "Completed" : "Pending"}\n`
    ).join('\n---\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'tasks.txt');
});

// Reusable download function
function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
function showToast(message, type = 'success') {
    const toastElement = document.getElementById('liveToast');
    const toastBody = toastElement.querySelector('.toast-body');

    // Set message and type class
    toastBody.textContent = message;
    toastElement.className = `toast align-items-center text-white bg-${type} border-0`;

    // Show the toast
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}
  
