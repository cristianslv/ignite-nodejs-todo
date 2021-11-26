const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find((user) => user.username === username);

  if (users.length === 0 || user === undefined) {
    return response.status(404).json({ error: "The specified user does not exist!" });
  }

  request.user = user;

  next();
}

function checksExistsTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (todo === undefined) {
    return response.status(404).json({ error: "There is no todo with the provided id." });
  }

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameTaken = users.find((user) => user.username === username);

  if (usernameTaken != undefined) {
    return response.status(400).json({
      error: "This username has already exists!"
    })
  }

  const newUser = {
    id: v4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const editTodo = {
    title,
    deadline: new Date(deadline)
  };

  user.todos.map((todo) => {
    if (todo.id === id) {
      Object.assign(todo, editTodo);
    }
  });
  
  todo = user.todos.find((todo) => todo.id === id);
  
  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  user.todos.map((todo) => {
    if (todo.id === id) {
      todo.done = true;
    }
  });
  
  todo = user.todos.find((todo) => todo.id === id);

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  user.todos = user.todos.filter((todo) => todo.id != id);

  return response.status(204).json({ message: "Your todo was successfully deleted!" });
});

module.exports = app;