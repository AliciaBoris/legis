document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskDisplay = document.getElementById('taskDisplay');
    const profitInfo = document.getElementById('profit-info');
    const searchTaskInput = document.getElementById('searchTask');
    const addTaskButton = document.getElementById('addTaskButton');
    const updateTaskButton = document.getElementById('updateTaskButton');
    let tasks = [];
    let taskIndexToEdit = null;

    // Format numbers with commas
    function formatNumberWithCommas(number) {
        return new Intl.NumberFormat('en-US').format(number);
    }

    // Load tasks from local storage
    function loadTasksFromLocalStorage() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            displayTasks(tasks);
        }
    }

    // Save tasks to local storage
    function saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to calculate total profit, highest profit, and date of highest profit
    function calculateProfitInfo() {
        let totalProfit = 0;
        let highestProfit = 0;
        let highestProfitDate = '';

        tasks.forEach((task) => {
            totalProfit += task.profit;
            if (task.profit > highestProfit) {
                highestProfit = task.profit;
                highestProfitDate = task.startDate;
            }
        });

        profitInfo.innerHTML = `
            <strong>Total Profit:</strong> ${formatNumberWithCommas(totalProfit)} <br>
            <strong>Highest Profit:</strong> ${formatNumberWithCommas(highestProfit)} <br>
            <strong>Date of Highest Profit:</strong> ${highestProfitDate} <br>
        `;
    }

    // Function to display tasks (accepts filtered or full list of tasks)
    function displayTasks(taskList) {
        taskDisplay.innerHTML = '';

        taskList.forEach((task, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.clientName}</td>
                <td>${task.jobType}</td>
                <td>${task.startDate}</td>
                <td>${task.expectedCompletionDate}</td>
                <td>${formatNumberWithCommas(task.amountCharged)}</td>
                <td>${formatNumberWithCommas(task.amountPaid)}</td>
                <td>${task.natureOfJob}</td>
                <td>${formatNumberWithCommas(task.expenditure)}</td>
                <td>${formatNumberWithCommas(task.balance)}</td>
                <td>${formatNumberWithCommas(task.profit)}</td>
                <td>
                    <button onclick="editTask(${index})">Edit</button>
                    <button onclick="deleteTask(${index})">Delete</button>
                    <button 
                        style="background-color: ${task.completed ? 'green' : 'red'}; color: white;"
                        onclick="toggleCompletion(${index}, this)">
                        ${task.completed ? 'Completed' : 'Incomplete'}
                    </button>
                </td>
            `;
            taskDisplay.appendChild(row);
        });

        calculateProfitInfo();
    }

    // Toggle completion status of a task
    window.toggleCompletion = function (index, button) {
        tasks[index].completed = !tasks[index].completed; // Toggle the completed status
        button.style.backgroundColor = tasks[index].completed ? 'green' : 'red';
        button.textContent = tasks[index].completed ? 'Completed' : 'Incomplete';
        saveTasksToLocalStorage(); // Update local storage
    };

    // Edit task function
    window.editTask = function (index) {
        const task = tasks[index];

        // Fill the form with the task details
        document.getElementById('clientName').value = task.clientName;
        document.getElementById('jobType').value = task.jobType;
        document.getElementById('startDate').value = task.startDate;
        document.getElementById('expectedCompletionDate').value = task.expectedCompletionDate;
        document.getElementById('amountCharged').value = task.amountCharged;
        document.getElementById('amountPaid').value = task.amountPaid;
        document.getElementById('natureOfJob').value = task.natureOfJob;
        document.getElementById('expenditure').value = task.expenditure;

        taskIndexToEdit = index;
        addTaskButton.style.display = 'none'; // Hide the Add button
        updateTaskButton.style.display = 'block'; // Show the Update button
    };

    // Update task function
    updateTaskButton.addEventListener('click', () => {
        const clientName = document.getElementById('clientName').value;
        const jobType = document.getElementById('jobType').value;
        const startDate = document.getElementById('startDate').value;
        const expectedCompletionDate = document.getElementById('expectedCompletionDate').value;
        const amountCharged = parseFloat(document.getElementById('amountCharged').value);
        const amountPaid = parseFloat(document.getElementById('amountPaid').value);
        const natureOfJob = document.getElementById('natureOfJob').value;
        const expenditure = parseFloat(document.getElementById('expenditure').value);

        const balance = amountCharged - amountPaid;
        const profit = amountCharged - expenditure;

        const updatedTask = {
            ...tasks[taskIndexToEdit],
            clientName,
            jobType,
            startDate,
            expectedCompletionDate,
            amountCharged,
            amountPaid,
            natureOfJob,
            expenditure,
            balance,
            profit
        };

        tasks[taskIndexToEdit] = updatedTask; // Update task in array
        taskIndexToEdit = null;

        saveTasksToLocalStorage(); // Update local storage
        displayTasks(tasks); // Re-display tasks

        taskForm.reset(); // Clear form
        addTaskButton.style.display = 'block'; // Show Add button
        updateTaskButton.style.display = 'none'; // Hide Update button
    });

    // Delete task function
    window.deleteTask = function (index) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks.splice(index, 1); // Remove task from array
            saveTasksToLocalStorage(); // Update local storage
            displayTasks(tasks); // Re-display tasks
        }
    };

    // Task form submission (add new task)
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const clientName = document.getElementById('clientName').value;
        const jobType = document.getElementById('jobType').value;
        const startDate = document.getElementById('startDate').value;
        const expectedCompletionDate = document.getElementById('expectedCompletionDate').value;
        const amountCharged = parseFloat(document.getElementById('amountCharged').value);
        const amountPaid = parseFloat(document.getElementById('amountPaid').value);
        const natureOfJob = document.getElementById('natureOfJob').value;
        const expenditure = parseFloat(document.getElementById('expenditure').value);

        const balance = amountCharged - amountPaid;
        const profit = amountCharged - expenditure;

        const task = {
            clientName,
            jobType,
            startDate,
            expectedCompletionDate,
            amountCharged,
            amountPaid,
            natureOfJob,
            expenditure,
            balance,
            profit,
            completed: false // Default completion status: Incomplete
        };

        tasks.push(task); // Add new task
        saveTasksToLocalStorage(); // Save to local storage
        displayTasks(tasks); // Display tasks

        taskForm.reset(); // Clear the form
    });

    // Add search functionality
    searchTaskInput.addEventListener('input', () => {
        const searchTerm = searchTaskInput.value.toLowerCase();
        const filteredTasks = tasks.filter(task =>
            task.clientName.toLowerCase().includes(searchTerm)
        );
        displayTasks(filteredTasks); // Display filtered tasks
    });

    loadTasksFromLocalStorage(); // Load tasks when the page is loaded
});
