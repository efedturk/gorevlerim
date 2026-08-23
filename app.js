const storageKey = "gorevlerim-pwa-v2";
const oldStorageKey = "gorevlerim-pwa-v1";
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const titleInput = document.querySelector("#task-title");
const categoryInput = document.querySelector("#task-category");
const priorityInput = document.querySelector("#task-priority");
const dateInput = document.querySelector("#task-date");
const summary = document.querySelector("#summary");
let filter = "all";
let tasks = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem(oldStorageKey) || "[]");

const priorityNames = { low: "Düşük", medium: "Orta", high: "Yüksek" };
const categoryNames = { personal: "Kişisel", school: "Okul", work: "İş", other: "Diğer" };
const save = () => localStorage.setItem(storageKey, JSON.stringify(tasks));
const dayKey = () => new Date().toLocaleDateString("en-CA");

function formatDate(date) {
  if (!date) return "Tarih yok";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));
}

function matchesFilter(task) {
  if (filter === "all") return true;
  if (filter === "active") return !task.done;
  if (filter === "completed") return task.done;
  if (filter === "today") return task.date === dayKey();
  return !task.done && task.date && task.date < dayKey();
}

function editTask(task) {
  const title = prompt("Görev başlığı:", task.title);
  if (title === null) return;
  if (!title.trim()) return alert("Görev başlığı boş olamaz.");
  const date = prompt("Son tarih (YYYY-AA-GG, boş bırakılabilir):", task.date || "");
  if (date === null) return;
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return alert("Tarihi YYYY-AA-GG biçiminde gir.");
  task.title = title.trim(); task.date = date; save(); render();
}

function render() {
  const visible = tasks.filter(matchesFilter);
  taskList.innerHTML = "";
  visible.forEach(task => {
    task.category ||= "personal";
    const item = document.createElement("li");
    item.className = `task-item ${task.done ? "completed" : ""}`;
    item.innerHTML = `<input class="check" type="checkbox" ${task.done ? "checked" : ""} aria-label="Görevi tamamla"><div><p class="task-title"></p><div class="metadata"><span class="badge category">${categoryNames[task.category]}</span><span class="badge priority-${task.priority}">${priorityNames[task.priority]}</span><span>${formatDate(task.date)}</span></div></div><div class="task-actions"><button class="edit" aria-label="Görevi düzenle">✎</button><button class="delete" aria-label="Görevi sil">×</button></div>`;
    item.querySelector(".task-title").textContent = task.title;
    item.querySelector(".check").addEventListener("change", () => { task.done = !task.done; save(); render(); });
    item.querySelector(".edit").addEventListener("click", () => editTask(task));
    item.querySelector(".delete").addEventListener("click", () => { if (confirm("Bu görev silinsin mi?")) { tasks = tasks.filter(current => current.id !== task.id); save(); render(); } });
    taskList.append(item);
  });
  emptyState.hidden = visible.length !== 0;
  const completed = tasks.filter(task => task.done).length;
  summary.textContent = tasks.length ? `${completed} / ${tasks.length} görev tamamlandı.` : "Bugün için harika bir plan yap.";
}

function addTask() {
  const title = titleInput.value.trim();
  if (!title) return titleInput.focus();
  tasks.unshift({ id: crypto.randomUUID(), title, category: categoryInput.value, priority: priorityInput.value, date: dateInput.value, done: false });
  titleInput.value = ""; dateInput.value = ""; save(); render();
}

function exportTasks() {
  const file = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(file), download: "gorevlerim-yedek.json" });
  link.click(); URL.revokeObjectURL(link.href);
}

document.querySelector("#add-button").addEventListener("click", addTask);
titleInput.addEventListener("keydown", event => { if (event.key === "Enter") addTask(); });
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => { filter = button.dataset.filter; document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button)); render(); }));
document.querySelector("#clear-completed").addEventListener("click", () => { tasks = tasks.filter(task => !task.done); save(); render(); });
document.querySelector("#export-button").addEventListener("click", exportTasks);
document.querySelector("#import-input").addEventListener("change", event => {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { try { const imported = JSON.parse(reader.result); if (!Array.isArray(imported)) throw Error(); tasks = imported; save(); render(); alert("Yedek geri yüklendi."); } catch { alert("Geçerli bir görev yedek dosyası seç."); } };
  reader.readAsText(file); event.target.value = "";
});
document.querySelector("#theme-button").addEventListener("click", () => { const dark = document.documentElement.dataset.theme !== "dark"; document.documentElement.dataset.theme = dark ? "dark" : ""; localStorage.setItem("gorevlerim-theme", dark ? "dark" : "light"); });
if (localStorage.getItem("gorevlerim-theme") === "dark") document.documentElement.dataset.theme = "dark";
if ("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js");
save(); render();
