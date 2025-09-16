// script.js

// Variables globales
let tasks = [];

// Elementos DOM
const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks-container');
const taskCount = document.getElementById('task-count');
const searchInput = document.getElementById('search-input');
const filterPriority = document.getElementById('filter-priority');
const filterStatus = document.getElementById('filter-status');

const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const cancelEditBtn = document.getElementById('cancel-edit');

// Cargar tareas desde localStorage
function loadTasks() {
  const stored = localStorage.getItem('tasks');
  if (stored) {
    tasks = JSON.parse(stored);
  } else {
    tasks = [];
  }
}

// Guardar tareas en localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Crear elemento HTML para una tarea
function createTaskElement(task) {
  const div = document.createElement('div');
  div.className = 'bg-background border border-border rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center';

  // Información principal
  const infoDiv = document.createElement('div');
  infoDiv.className = 'flex-1';

  const title = document.createElement('h3');
  title.className = 'text-lg font-semibold';
  title.textContent = task.title;
  infoDiv.appendChild(title);

  if (task.subject) {
    const subject = document.createElement('p');
    subject.className = 'text-muted-foreground text-sm';
    subject.textContent = `Materia: ${task.subject}`;
    infoDiv.appendChild(subject);
  }

  if (task.description) {
    const desc = document.createElement('p');
    desc.className = 'text-sm mt-1';
    desc.textContent = task.description;
    infoDiv.appendChild(desc);
  }

  // Fecha y prioridad
  const metaDiv = document.createElement('div');
  metaDiv.className = 'flex flex-wrap gap-4 mt-3 md:mt-0 md:ml-6 items-center';

  if (task.dueDate) {
    const dueDate = document.createElement('span');
    dueDate.className = 'text-sm text-muted-foreground';
    const dateObj = new Date(task.dueDate);
    dueDate.textContent = `Entrega: ${dateObj.toLocaleDateString()}`;
    metaDiv.appendChild(dueDate);
  }

  // Prioridad
  const priority = document.createElement('span');
  priority.className = `priority-${task.priority} text-sm`;
  priority.textContent = `Prioridad: ${capitalize(task.priority)}`;
  metaDiv.appendChild(priority);

  // Estado
  const status = document.createElement('span');
  status.className = `status-${task.status}`;
  status.textContent = capitalizeStatus(task.status);
  metaDiv.appendChild(status);

  // Botones editar y eliminar
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'flex gap-2 mt-3 md:mt-0 md:ml-6';

  const editBtn = document.createElement('button');
  editBtn.className = 'px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90';
  editBtn.textContent = 'Editar';
  editBtn.addEventListener('click', () => openEditModal(task.id));
  actionsDiv.appendChild(editBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'px-3 py-1 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90';
  deleteBtn.textContent = 'Eliminar';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  actionsDiv.appendChild(deleteBtn);

  div.appendChild(infoDiv);
  div.appendChild(metaDiv);
  div.appendChild(actionsDiv);

  return div;
}

// Capitalizar texto
function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Capitalizar estado con espacios
function capitalizeStatus(status) {
  switch (status) {
    case 'pendiente': return 'Pendiente';
    case 'en-progreso': return 'En progreso';
    case 'completada': return 'Completada';
    default: return status;
  }
}

// Renderizar lista de tareas con filtros y búsqueda
function renderTasks() {
  const searchTerm = searchInput.value.toLowerCase();
  const priorityFilter = filterPriority.value;
  const statusFilter = filterStatus.value;

  // Filtrar tareas
  let filtered = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm) || (task.subject && task.subject.toLowerCase().includes(searchTerm));
    const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  tasksContainer.innerHTML = '';

  if (filtered.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'text-center py-8 text-muted-foreground';
    emptyMsg.textContent = 'No hay tareas que coincidan con los filtros.';
    tasksContainer.appendChild(emptyMsg);
  } else {
    filtered.forEach(task => {
      const taskEl = createTaskElement(task);
      tasksContainer.appendChild(taskEl);
    });
  }

  taskCount.textContent = `${filtered.length} tarea${filtered.length !== 1 ? 's' : ''}`;
}

// Agregar nueva tarea
taskForm.addEventListener('submit', e => {
  e.preventDefault();

  const newTask = {
    id: Date.now().toString(),
    title: document.getElementById('task-title').value.trim(),
    subject: document.getElementById('task-subject').value.trim(),
    description: document.getElementById('task-description').value.trim(),
    dueDate: document.getElementById('task-dueDate').value,
    priority: document.getElementById('task-priority').value,
    status: document.getElementById('task-status').value
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  taskForm.reset();
});

// Eliminar tarea
function deleteTask(id) {
  if (confirm('¿Estás seguro de eliminar esta tarea?')) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }
}

// Abrir modal para editar tarea
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById('edit-id').value = task.id;
  document.getElementById('edit-title').value = task.title;
  document.getElementById('edit-subject').value = task.subject;
  document.getElementById('edit-description').value = task.description;
  document.getElementById('edit-dueDate').value = task.dueDate;
  document.getElementById('edit-priority').value = task.priority;
  document.getElementById('edit-status').value = task.status;

  editModal.classList.remove('hidden');
  editModal.classList.add('flex');
}

// Cerrar modal edición
cancelEditBtn.addEventListener('click', () => {
  editModal.classList.add('hidden');
  editModal.classList.remove('flex');
});

// Guardar cambios edición
editForm.addEventListener('submit', e => {
  e.preventDefault();

  const id = document.getElementById('edit-id').value;
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return;

  tasks[index].title = document.getElementById('edit-title').value.trim();
  tasks[index].subject = document.getElementById('edit-subject').value.trim();
  tasks[index].description = document.getElementById('edit-description').value.trim();
  tasks[index].dueDate = document.getElementById('edit-dueDate').value;
  tasks[index].priority = document.getElementById('edit-priority').value;
  tasks[index].status = document.getElementById('edit-status').value;

  saveTasks();
  renderTasks();
  editModal.classList.add('hidden');
  editModal.classList.remove('flex');
});

// Filtros y búsqueda
searchInput.addEventListener('input', renderTasks);
filterPriority.addEventListener('change', renderTasks);
filterStatus.addEventListener('change', renderTasks);

// Inicialización
loadTasks();
renderTasks();