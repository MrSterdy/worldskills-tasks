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

/**
 * @param {string} input
 */
function isTask(input) {
    return input.startsWith("task:");
}

/**
 * @param {string} taskName
 */
function addPrefix(taskName) {
    return "task:" + taskName;
}

/**
 * @param {string} taskName
 */
function removePrefix(taskName) {
    return taskName.slice("task:".length);
}

/**
 * @param {Task} task
 */
export function updateTask(task) {
    localStorage.setItem(addPrefix(task.name), JSON.stringify(task));
}

/**
 * @param {string} taskName
 */
export function removeTask(taskName) {
    localStorage.removeItem(addPrefix(taskName));
}

/**
 * @param {string} taskName
 *
 * @return {Task | null}
 */
export function getTask(taskName) {
    const item = localStorage.getItem(addPrefix(taskName));

    return item ? JSON.parse(item) : null;
}

/**
 * @return {Task[]}
 */
export function getAllTasks() {
    return Object
        .keys(localStorage)
        .filter(isTask)
        .map(name => getTask(removePrefix(name)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * @param {string} input
 *
 * @return {Task[]}
 */
export function searchTasks(input) {
    const tasks = getAllTasks();
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
