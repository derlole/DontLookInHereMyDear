 import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem('todos');
      const storedDate = await AsyncStorage.getItem('lastDate');
      const currentDate = new Date().toDateString();

      if (storedTodos) {
        let parsedTodos = JSON.parse(storedTodos);

        // Lösche normale Todos, wenn ein neuer Tag ist
        if (storedDate !== currentDate) {
          parsedTodos = parsedTodos.filter(todo => todo.persistent || !todo.completed);
        }

        setTodos(parsedTodos);
      }

      await AsyncStorage.setItem('lastDate', currentDate);
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const saveTodos = async (newTodos) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(newTodos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const addTodo = () => {
    if (inputText.trim()) {
      const newTodo = {
        id: Date.now().toString(),
        text: inputText.trim(),
        completed: false,
        persistent: false,
      };
      const newTodos = [...todos, newTodo];
      setTodos(newTodos);
      saveTodos(newTodos);
      setInputText('');

      // API Platzhalter: Hier kannst du die API-Aufrufe einfügen
      sendToAPI('add', newTodo);
    }
  };

  const toggleComplete = (id) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(newTodos);
    saveTodos(newTodos);

    const todo = newTodos.find(t => t.id === id);
    sendToAPI('update', todo);
  };

  const togglePersistent = (id) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, persistent: !todo.persistent } : todo
    );
    setTodos(newTodos);
    saveTodos(newTodos);

    const todo = newTodos.find(t => t.id === id);
    sendToAPI('update', todo);
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      const newTodos = todos.map(todo =>
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      );
      setTodos(newTodos);
      saveTodos(newTodos);
      setEditingId(null);
      setEditText('');

      const todo = newTodos.find(t => t.id === editingId);
      sendToAPI('update', todo);
    }
  };

  const deleteTodo = (id) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    setTodos(newTodos);
    saveTodos(newTodos);

    sendToAPI('delete', { id });
  };

  const API_BASE_URL = 'https://vs-api.lires.de/api';

  // Platzhalter für API-Aufrufe
  const sendToAPI = (action, todo) => {
    const url =
      action === 'add'
        ? `${API_BASE_URL}/todos`
        : `${API_BASE_URL}/todos/${todo.id}`;

    const method = action === 'add' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE';

    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: action === 'delete' ? undefined : JSON.stringify(todo),
    };

    fetch(url, options)
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'API request failed');
        }
        return response.status === 204 ? null : response.json();
      })
      .then((data) => console.log('API response:', data))
      .catch((error) => console.error('API error:', error));

    console.log(`API Call: ${action}`, url, todo);
  };

  const renderTodo = ({ item }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity onPress={() => toggleComplete(item.id)} style={styles.checkbox}>
        <Text style={item.completed ? styles.checked : styles.unchecked}>
          {item.completed ? '✓' : '○'}
        </Text>
      </TouchableOpacity>
      {editingId === item.id ? (
        <TextInput
          style={styles.editInput}
          value={editText}
          onChangeText={setEditText}
          onSubmitEditing={saveEdit}
          autoFocus
        />
      ) : (
        <Text style={[styles.todoText, item.completed && styles.completedText]}>
          {item.text}
        </Text>
      )}
      <View style={styles.buttons}>
        <TouchableOpacity onPress={() => startEdit(item.id, item.text)} style={styles.button}>
          <Text style={styles.buttonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => togglePersistent(item.id)} style={styles.button}>
          <Text style={styles.buttonText}>{item.persistent ? '📌' : '📍'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.button}>
          <Text style={styles.buttonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo Liste</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Neues Todo hinzufügen..."
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addTodo}
        />
        <TouchableOpacity onPress={addTodo} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
    padding: 10,
    color: '#fff',
    backgroundColor: '#1e1e1e',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  checkbox: {
    marginRight: 10,
  },
  checked: {
    color: '#4caf50',
    fontSize: 36,
  },
  unchecked: {
    color: '#888',
    fontSize: 36,
  },
  todoText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
    padding: 5,
    color: '#fff',
    backgroundColor: '#2e2e2e',
  },
  buttons: {
    flexDirection: 'row',
  },
  button: {
    marginLeft: 10,
    padding: 5,
  },
  buttonText: {
    fontSize: 16,
  },
});
