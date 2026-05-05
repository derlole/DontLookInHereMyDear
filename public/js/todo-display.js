
const todoListElement = document.getElementById('todo-list');

const renderTodos = (todos) => {
  if (!todoListElement) return;

  if (!Array.isArray(todos) || todos.length === 0) {
    todoListElement.innerHTML = '<div>Keine Todos vorhanden.</div>';
    return;
  }

  const html = todos
    .map((todo) => {
      const statusClass = todo.completed ? 'accent' : '';
      const pinIcon = todo.persistent ? '📌' : '📍';
      const escapedText = todo.text
        ? todo.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        : '';

      return `
        <div class="todo-item ${statusClass}">
          <span class="pin-icon">${pinIcon}</span>
          <span class="todo-text">${escapedText}</span>
        </div>
      `.trim();
    })
    .join('');

  todoListElement.innerHTML = html;
};

socket.on('connect', () => {
  socket.emit('request:todos');
});

socket.on('todos:init', (todos) => {
  renderTodos(todos);
});

socket.on('todos:changed', ({ todos }) => {
  renderTodos(todos);
});
