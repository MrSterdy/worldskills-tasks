import {updateTask, getAllTasks, removeTask, searchTasks} from "./taskService.js";

/** @type HTMLInputElement */
const newNameInput = document.getElementById("new-task-input");

/** @type HTMLInputElement */
const newDateInput = document.getElementById("new-task-date");

/** @type Subtask[] */
let subtasks = [];

refreshTasks();

/**
 * @param {string?} search
 */
function refreshTasks(search = undefined) {
    const now = new Date().toLocaleString("sv").replace(" ", "T");
    newDateInput.min = now;
    newDateInput.value = now;

    newNameInput.value = "";

    subtasks = [];

    const taskList = document.getElementById("tasks");
    taskList.replaceChildren();

    const tasks = search ? searchTasks(search) : getAllTasks();

    for (const task of tasks) {
        const li = document.createElement("li");
        const header = document.createElement("h2");
        const editBtn = document.createElement("button");

        let headerText = task.name;
        headerText += ` [${task.finished ? "Выполнено" : "Активно"}]`;
        const taskDate = new Date(task.date);
        if (!task.finished && taskDate.getTime() < new Date().getTime()) {
            headerText += ` [Истечено]`;
        }
        headerText += ` [До ${taskDate.toLocaleString()}]`;

        header.textContent = headerText;

        editBtn.textContent = "E";
        editBtn.addEventListener("click", () => {
            li.replaceChildren();

            const nameInput = document.createElement("input");
            const subtasksUl = document.createElement("ul");
            const newSubtaskBtn = document.createElement("button");
            const deleteBtn = document.createElement("button");
            const cancelBtn = document.createElement("button");
            const saveBtn = document.createElement("button");

            const finishLabel = document.createElement("label")
            const finishCheckbox = document.createElement("input");

            const dateLabel = document.createElement("label");
            const dateInput = document.createElement("input");

            nameInput.value = task.name;

            /** @type Subtask[] */
            const editSubtasks = task.subtasks.map(subtask => ({ ...subtask }));

            const refreshEditSubtasks = () => {
                subtasksUl.replaceChildren();

                for (const [subtaskI, subtask] of editSubtasks.entries()) {
                    const subtaskLi = document.createElement("li");
                    const subtaskInput = document.createElement("input");
                    const removeSubtaskBtn = document.createElement("button");
                    const finishSubtaskBtn = document.createElement("button");

                    subtaskInput.value = subtask.name;
                    subtaskInput.addEventListener("input", () => subtask.name = subtaskInput.value);

                    removeSubtaskBtn.textContent = "X";
                    removeSubtaskBtn.addEventListener("click", () => {
                        editSubtasks.splice(subtaskI, 1);
                        refreshEditSubtasks();
                    });

                    finishSubtaskBtn.textContent = subtask.finished ? "NF" : "F";
                    finishSubtaskBtn.addEventListener("click", () => {
                        subtask.finished = !subtask.finished;
                        refreshEditSubtasks();
                    });

                    subtaskLi.append(subtaskInput, removeSubtaskBtn, finishSubtaskBtn);
                    subtasksUl.append(subtaskLi);
                }
            };

            refreshEditSubtasks();

            finishLabel.textContent = "Завершить?";

            finishCheckbox.type = "checkbox";
            finishCheckbox.checked = task.finished;

            finishLabel.append(finishCheckbox);

            dateLabel.textContent = "До"

            dateInput.value = task.date;
            dateInput.type = "datetime-local";
            dateInput.min = newDateInput.min;

            dateLabel.append(dateInput);

            newSubtaskBtn.textContent = "N";
            newSubtaskBtn.addEventListener("click", () => {
                editSubtasks.push({ name: "Новая подзадача", finished: false });
                refreshEditSubtasks();
            });

            deleteBtn.textContent = "X";
            deleteBtn.addEventListener("click", () => {
                removeTask(task.name);
                refreshTasks();
            });

            cancelBtn.textContent = "C";
            cancelBtn.addEventListener("click", () => refreshTasks());

            saveBtn.textContent = "S";
            saveBtn.addEventListener("click", () => {
                if (!nameInput.value || (finishCheckbox.checked && editSubtasks.some(subtask => !subtask.finished))) {
                    return;
                }
                removeTask(task.name);
                updateTask({ name: nameInput.value, date: dateInput.value, subtasks: editSubtasks, finished: finishCheckbox.checked });
                refreshTasks();
            });

            li.append(nameInput, subtasksUl, newSubtaskBtn, finishLabel, dateLabel, deleteBtn, cancelBtn, saveBtn);
        });

        li.append(header, editBtn);

        if (task.subtasks.length) {
            const ul = document.createElement("ul");

            for (const subtask of task.subtasks) {
                const subtaskLi = document.createElement("li");
                subtaskLi.textContent = `${subtask.name} [${subtask.finished ? "Выполнено" : "Активно"}]`;
                ul.append(subtaskLi);
            }

            li.append(ul);
        }

        taskList.append(li);
    }
}

function refreshSubtasks() {
    const subtaskList = document.getElementById("subtasks");
    subtaskList.replaceChildren();

    for (const [subtaskI, subtask] of subtasks.entries()) {
        const li = document.createElement("li");
        const input = document.createElement("input");
        const deleteBtn = document.createElement("button");

        input.value = subtask.name;
        input.addEventListener("input", () => subtask.name = input.value);

        deleteBtn.textContent = "X";
        deleteBtn.addEventListener("click", () => {
            subtasks.splice(subtaskI, 1);
            refreshSubtasks();
        });

        li.append(input, deleteBtn);
        subtaskList.append(li);
    }
}

document.getElementById("search").addEventListener("input", function() {
    refreshTasks(this.value);
});

document.getElementById("new-subtask-button").addEventListener("click", () => {
    subtasks.push({ name: "Новая подзадача", finished: false });
    refreshSubtasks();
});

document.getElementById("new-task-submit").addEventListener("click", () => {
    if (!newNameInput.value) {
        return;
    }

    updateTask({ name: newNameInput.value, subtasks, date: newDateInput.value, finished: false });

    refreshSubtasks();
    refreshTasks();
});
