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

  try {
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
};

module.exports = (io, socket) => {
    socket.on('test_msg', (data) => {
        console.log(data);
    });

    socket.on('set-text', (data) => {
        console.log('[SOCKET] Text empfangen:', data);
        io.emit('text-update', data);
    });

    socket.on('request:todos', () => {
        const todos = readTodos();
        socket.emit('todos:init', todos);
    });

    const todos = readTodos();
    console.log(`[SOCKET] Neuer Client verbunden: ${socket.id} - ${todos.length} Todos verfügbar`);
    socket.emit('todos:init', todos);
};