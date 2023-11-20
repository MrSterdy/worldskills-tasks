/**
 * @typedef {{
 *     name: string,
 *     finished: boolean
 * }} Subtask
 */

/**
 * @typedef {{
 *     name: string,
 *     subtasks: Subtask[],
 *     date: string,
 *     finished: boolean
 * }} Task
 */

class TaskService {
    /**
     * @param {string} input
     */
    #isTask(input) {
        return input.startsWith("task:");
    }

    /**
     * @param {string} taskName
     */
    #addPrefix(taskName) {
        return "task:" + taskName;
    }

    /**
     * @param {string} taskName
     */
    #removePrefix(taskName) {
        return taskName.slice("task:".length);
    }

    /**
     * @param {Task} task
     */
    updateTask(task) {
        localStorage.setItem(this.#addPrefix(task.name), JSON.stringify(task));
    }

    /**
     * @param {string} taskName
     */
    removeTask(taskName) {
        localStorage.removeItem(this.#addPrefix(taskName));
    }

    /**
     * @param {string} taskName
     *
     * @return {Task | null}
     */
    getTask(taskName) {
        const item = localStorage.getItem(this.#addPrefix(taskName));

        return item ? JSON.parse(item) : null;
    }

    /**
     * @return {Task[]}
     */
    getAllTasks() {
        return Object
            .keys(localStorage)
            .filter(this.#isTask)
            .map(name => this.getTask(this.#removePrefix(name)))
            .sort((a, b) => {
                // Нормализовать до [-1; 1]
                const date = Math.min(Math.max(new Date(b.date).getTime() - new Date(a.date).getTime(), -1), 1);

                // Отсортировать так, что незавершенные были сверху, а завершенные снизу
                return (a.finished || -1) + date - (b.finished || -1);
            })
    }

    /**
     * @param {string} input
     *
     * @return {Task[]}
     */
    searchTasks(input) {
        const tasks = this.getAllTasks();
        const search = tasks
            .map(task =>
                [
                    task.name.split(" "),
                    task.subtasks.map(subtask => subtask.name.split(" ")),
                    task.date.split("T")
                ].flat(2));

        /** @type Task[] */
        const result = [];

        const inputWords = input.trim().split(" ");

        search.forEach((sentence, i) => {
            let matches = 0;
            for (const word of sentence) {
                for (const inputWord of inputWords) {
                    if (word.toLowerCase().includes(inputWord.toLowerCase())) {
                        matches++;
                    }
                }
            }

            if (matches < inputWords.length) {
                return;
            }

            result.push(tasks[i]);
        });

        return result;
    }
}

const taskService = new TaskService();

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
    const now = new Date();

    const nowValue = now.toLocaleString("sv").replace(" ", "T");
    newDateInput.min = nowValue;
    newDateInput.value = nowValue;

    newNameInput.value = "";

    subtasks = [];

    const taskList = document.getElementById("tasks");
    taskList.replaceChildren();

    const tasks = search ? taskService.searchTasks(search) : taskService.getAllTasks();

    for (const task of tasks) {
        const li = document.createElement("li");
        const header = document.createElement("h3");
        const editBtn = document.createElement("button");

        const taskDate = new Date(task.date);

        header.textContent = task.name;

        if (task.finished) {
            li.classList.add("finished");
        } else if (taskDate.getTime() < now.getTime()) {
            li.classList.add("expired");
        } else {
            if (
                now.getFullYear() === taskDate.getFullYear() &&
                now.getMonth() === taskDate.getMonth() &&
                now.getDate() === taskDate.getDate()
            ) {
                header.textContent += ` [Сегодня до ${taskDate.toLocaleTimeString()}]`;
            } else {
                const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                const overmorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1);
                if (
                    tomorrow.getFullYear() === taskDate.getFullYear() &&
                    tomorrow.getMonth() === taskDate.getMonth() &&
                    tomorrow.getDate() === taskDate.getDate()
                ) {
                    header.textContent += " [Завтра]";
                } else if (
                    overmorrow.getFullYear() === taskDate.getFullYear() &&
                    overmorrow.getMonth() === taskDate.getMonth() &&
                    overmorrow.getDate() === taskDate.getDate()
                ) {
                    header.textContent += " [Послезавтра]";
                } else {
                    const timeDiff = taskDate.getTime() - now.getTime();
                    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

                    header.textContent += ` [Через ${dayDiff} дней]`;
                }
            }
        }

        editBtn.textContent = "Изменить";
        editBtn.addEventListener("click", () => {
            li.replaceChildren();

            const nameInput = document.createElement("input");
            const subtasksUl = document.createElement("ul");
            const newSubtaskBtn = document.createElement("button");
            const deleteBtn = document.createElement("button");
            const cancelBtn = document.createElement("button");
            const saveBtn = document.createElement("button");
            const finishBtn = document.createElement("button")

            const dateLabel = document.createElement("label");
            const dateInput = document.createElement("input");

            nameInput.value = task.name;

            /** @type Subtask[] */
            const editSubtasks = task.subtasks.map(subtask => ({ ...subtask }));

            subtasksUl.classList.add("task-subtasks");

            const refreshEditSubtasks = () => {
                subtasksUl.replaceChildren();

                for (const [subtaskI, subtask] of editSubtasks.entries()) {
                    const subtaskLi = document.createElement("li");
                    const subtaskInput = document.createElement("input");
                    const removeSubtaskBtn = document.createElement("button");
                    const finishSubtaskBtn = document.createElement("button");

                    subtaskInput.value = subtask.name;
                    subtaskInput.addEventListener("input", () => subtask.name = subtaskInput.value);

                    removeSubtaskBtn.textContent = "Удалить подзадачу";
                    removeSubtaskBtn.addEventListener("click", () => {
                        editSubtasks.splice(subtaskI, 1);
                        refreshEditSubtasks();
                    });

                    finishSubtaskBtn.textContent = subtask.finished
                        ? "Пометить подзадачу незавершенной"
                        : "Пометить подзадачу завершенной";
                    finishSubtaskBtn.addEventListener("click", () => {
                        subtask.finished = !subtask.finished;
                        refreshEditSubtasks();
                    });

                    subtaskLi.append(subtaskInput, removeSubtaskBtn, finishSubtaskBtn);
                    subtasksUl.append(subtaskLi);
                }
            };

            refreshEditSubtasks();

            dateLabel.classList.add("task-date-label");

            dateLabel.textContent = "До";

            dateInput.value = task.date;
            dateInput.type = "datetime-local";
            dateInput.min = newDateInput.min;

            dateLabel.append(dateInput);

            newSubtaskBtn.textContent = "Добавить подзадачу";
            newSubtaskBtn.addEventListener("click", () => {
                editSubtasks.push({ name: "Новая подзадача", finished: false });
                refreshEditSubtasks();
            });

            deleteBtn.textContent = "Удалить задачу";
            deleteBtn.addEventListener("click", () => {
                document.getElementById("confirm").onclick = () => {
                    document.getElementById("confirm-delete").close();
                    taskService.removeTask(task.name);
                    refreshTasks();
                };

                document.getElementById("confirm-delete").show();
            });

            finishBtn.textContent = task.finished ? "Пометить задачу незавершенной" : "Пометить задачу завершенной";
            finishBtn.addEventListener("click", () => {
                task.finished = !task.finished;
                finishBtn.textContent = task.finished ? "Пометить задачу незавершенной" : "Пометить задачу завершенной";
            });

            cancelBtn.textContent = "Отмена";
            cancelBtn.addEventListener("click", () => refreshTasks());

            saveBtn.textContent = "Сохранить";
            saveBtn.addEventListener("click", () => {
                if (!nameInput.value || (task.finished && editSubtasks.some(subtask => !subtask.finished))) {
                    return;
                }
                taskService.removeTask(task.name);
                taskService.updateTask({ name: nameInput.value, date: dateInput.value, subtasks: editSubtasks, finished: task.finished });
                refreshTasks();
            });

            li.append(nameInput, subtasksUl, newSubtaskBtn, dateLabel, finishBtn, deleteBtn, cancelBtn, saveBtn);
        });

        li.append(header);

        if (task.subtasks.length) {
            const ul = document.createElement("ul");

            for (const subtask of task.subtasks) {
                const subtaskLi = document.createElement("li");
                subtaskLi.textContent = `${subtask.name} [${subtask.finished ? "Выполнено" : "Активно"}]`;
                ul.append(subtaskLi);
            }

            li.append(ul);
        }

        li.append(editBtn);

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
        input.required = true;
        input.addEventListener("input", () => subtask.name = input.value);

        deleteBtn.textContent = "Удалить подзадачу";
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

    taskService.updateTask({ name: newNameInput.value, subtasks, date: newDateInput.value, finished: false });

    refreshSubtasks();
    refreshTasks();
});
