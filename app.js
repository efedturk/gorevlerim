const storageKey = "gorevlerim-pwa-v1";
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const titleInput = document.querySelector("#task-title");
const priorityInput = document.querySelector("#task-priority");
const dateInput = document.querySelector("#task-date");
const summary = document.querySelector("#summary");
let filter = "all";
let tasks = JSON.parse(localStorage.getItem(storageKey) || "[]");

const priorityNames = { low: "Düşük", medium: "Orta", high: "Yüksek" };
const save = () => localStorage.setItem(storageKey, JSON.stringify(tasks));

function formatDate(date) {
  if (!date) return "Tarih yok";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));
}

function render() {
  const visible = tasks.filter(task => filter === "all" || filter === "active" ? !task.done || filter === "all" : task.done);
  taskList.innerHTML = "";
  visible.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item ${task.done ? "completed" : ""}`;
    item.innerHTML = `
      <input class="check" type="checkbox" ${task.done ? "checked" : ""} aria-label="Görevi tamamla">
      <div><p class="task-title"></p><div class="metadata"><span class="badge priority-${task.priority}">${priorityNames[task.priority]}</span><span>${formatDate(task.date)}</span></div></div>
      <button class="delete" aria-label="Görevi sil">×</button>`;
    item.querySelector(".task-title").textContent = task.title;
    item.querySelector(".check").addEventListener("change", () => { task.done = !task.done; save(); render(); });
    item.querySelector(".delete").addEventListener("click", () => { tasks = tasks.filter(current => current.id !== task.id); save(); render(); });
    taskList.append(item);
  });
  emptyState.hidden = visible.length !== 0;
  const completed = tasks.filter(task => task.done).length;
  summary.textContent = tasks.length ? `${completed} / ${tasks.length} görev tamamlandı.` : "Bugün için harika bir plan yap.";
}

function addTask() {
  const title = titleInput.value.trim();
  if (!title) { titleInput.focus(); return; }
  tasks.unshift({ id: crypto.randomUUID(), title, priority: priorityInput.value, date: dateInput.value, done: false });
  titleInput.value = "";
  dateInput.value = "";
  save(); render();
}

document.querySelector("#add-button").addEventListener("click", addTask);
titleInput.addEventListener("keydown", event => { if (event.key === "Enter") addTask(); });
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  filter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  render();
}));
document.querySelector("#clear-completed").addEventListener("click", () => { tasks = tasks.filter(task => !task.done); save(); render(); });
document.querySelector("#theme-button").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "";
  localStorage.setItem("gorevlerim-theme", dark ? "dark" : "light");
});
if (localStorage.getItem("gorevlerim-theme") === "dark") document.documentElement.dataset.theme = "dark";
if ("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js");
render();
