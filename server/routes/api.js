const express = require('express');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'todos.json');

const ensureStorage = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]', 'utf8');
  }
};

const readTodos = () => {
  ensureStorage();
  const raw = fs.readFileSync(dataFile, 'utf8');
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

const writeTodos = (todos) => {
  ensureStorage();
  fs.writeFileSync(dataFile, JSON.stringify(todos, null, 2), 'utf8');
  return todos;
};

module.exports = (io) => {
  const router = express.Router();

  router.get('/todos', (req, res) => {
    const todos = readTodos();
    console.log(`[API] GET /todos - ${todos.length} Todos geladen`);
    res.json(todos);
  });

  router.post('/todos', (req, res) => {
    const { text, persistent = false, completed = false, id } = req.body;
    if (!text || typeof text !== 'string') {
      console.log(`[API] POST /todos - Fehler: Text erforderlich`);
      return res.status(400).json({ error: 'Todo text is required' });
    }

    const todo = {
      id: id || Date.now().toString(),
      text: text.trim(),
      completed: Boolean(completed),
      persistent: Boolean(persistent),
      createdAt: new Date().toISOString(),
    };

    const todos = readTodos();
    todos.push(todo);
    writeTodos(todos);

    console.log(`[API] POST /todos - Neues Todo hinzugefügt: "${todo.text}" (ID: ${todo.id})`);

    io.emit('todos:changed', {
      action: 'add',
      todo,
      todos,
    });

    res.status(201).json(todo);
  });

  router.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { text, completed, persistent } = req.body;
    const todos = readTodos();
    const index = todos.findIndex((item) => item.id === id);

    if (index === -1) {
      console.log(`[API] PUT /todos/${id} - Fehler: Todo nicht gefunden`);
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updatedTodo = {
      ...todos[index],
      text: typeof text === 'string' ? text.trim() : todos[index].text,
      completed: typeof completed === 'boolean' ? completed : todos[index].completed,
      persistent: typeof persistent === 'boolean' ? persistent : todos[index].persistent,
      updatedAt: new Date().toISOString(),
    };

    todos[index] = updatedTodo;
    writeTodos(todos);

    console.log(`[API] PUT /todos/${id} - Todo aktualisiert: "${updatedTodo.text}"`);

    io.emit('todos:changed', {
      action: 'update',
      todo: updatedTodo,
      todos,
    });

    res.json(updatedTodo);
  });

  router.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    const todos = readTodos();
    const todoToDelete = todos.find((item) => item.id === id);
    const exists = todos.some((item) => item.id === id);

    if (!exists) {
      console.log(`[API] DELETE /todos/${id} - Fehler: Todo nicht gefunden`);
      return res.status(404).json({ error: 'Todo not found' });
    }

    const remaining = todos.filter((item) => item.id !== id);
    writeTodos(remaining);

    console.log(`[API] DELETE /todos/${id} - Todo gelöscht: "${todoToDelete.text}"`);

    io.emit('todos:changed', {
      action: 'delete',
      id,
      todos: remaining,
    });

    res.status(204).send();
  });

  return router;
};
