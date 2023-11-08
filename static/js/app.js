import {createTask, getAllTasks, removeSubtaskFrom, removeTask} from "./taskService.js";

refreshTasks();

function refreshTasks() {
    const taskList = document.getElementById("tasks");
    taskList.replaceChildren();

    const tasks = getAllTasks();

    for (const task of tasks) {
        const li = document.createElement("li");
        const header = document.createElement("h2");
        const deleteBtn = document.createElement("button");

        header.textContent = task.name;

        deleteBtn.textContent = "X";
        deleteBtn.addEventListener("click", () => {
            removeTask(task.name);
            refreshTasks();
        });

        li.append(header, deleteBtn);

        if (task.subtasks.length) {
            const ul = document.createElement("ul");

            for (const subtask of task.subtasks) {
                const subtaskLi = document.createElement("li");
                const subtaskDeleteBtn = document.createElement("button");

                subtaskLi.textContent = subtask.name;

                subtaskDeleteBtn.textContent = "X";
                subtaskDeleteBtn.addEventListener("click", () => {
                    removeSubtaskFrom(task.name, subtask.name);
                    refreshTasks();
                });

                ul.append(subtaskLi, subtaskDeleteBtn);
            }

            li.append(ul);
        }

        taskList.append(li);
    }
}

/** @type Subtask[] */
let subtasks = [];

function refreshSubtasks() {
    const subtaskList = document.getElementById("subtasks");
    subtaskList.replaceChildren();

    for (const subtask of subtasks) {
        const li = document.createElement("li");
        const input = document.createElement("input");
        const deleteBtn = document.createElement("button");

        input.value = subtask.name;
        input.addEventListener("input", () => subtask.name = input.value);

        deleteBtn.textContent = "X";
        deleteBtn.addEventListener("click", () => {
            subtasks.splice(subtasks.indexOf(subtask), 1);
            refreshSubtasks();
        });

        li.append(input, deleteBtn);
        subtaskList.append(li);
    }
}

document.getElementById("new-subtask-button").addEventListener("click", () => {
    subtasks.push({ name: "Новая подзадача" });
    refreshSubtasks();
});

document.getElementById("new-task-submit").addEventListener("click", () => {
    /** @type HTMLInputElement */
    const input = document.getElementById("new-task-input");
    if (!input.value) {
        return;
    }

    createTask({ name: input.value, subtasks });

    subtasks = [];
    input.value = "";

    refreshSubtasks();
    refreshTasks();
});
