import { createTask, getAllTasks } from "./taskService.js";

refreshTasks();

function refreshTasks() {
    const taskList = document.getElementById("tasks");
    taskList.replaceChildren();

    const tasks = getAllTasks();

    for (const task of tasks) {
        const li = document.createElement("li");
        const header = document.createElement("h2");
        header.textContent = task.name;

        li.append(header);

        if (task.subtasks.length) {
            const ul = document.createElement("ul");

            for (const subtask of task.subtasks) {
                const subtaskLi = document.createElement("li");
                subtaskLi.textContent = subtask.name;
                ul.append(subtaskLi);
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

        input.value = subtask.name;

        li.append(input);
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

    refreshTasks();
});
