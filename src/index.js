const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  if(!username) {
    return response.status(404).json({error: "username header is missing"})
  }

  const userExists = users.find((user) => user.username === username)
  if(!userExists) {
    return response.status(404).json({error: "user doesn't exists"})
  }
  request.user = userExists
  next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const usernameAlreadyExists = users.find(user => user.username === username)
  if(usernameAlreadyExists) return response.status(400).json({error: "user doesn't exists"})
  const newUser = {
     id: uuidv4(),name,username, todos: []
  }
  users.push(newUser)
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const {username} = request.header
  const {user} = request
  const todos = user.todos
  return response.status(201).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { deadline,title} = request.body
  const {user} = request
  const newTodo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(newTodo)
  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const {title, deadline} = request.body
  const {id} = request.params
  const {user} = request
  const todoExists = user.todos.find(todo => todo.id === id)
  if(!todoExists) return response.status(404).json({error: "todo doesnt exists"})
  todoExists.title = title
  todoExists.deadline = new Date(deadline)
  return response.status(200).json(todoExists)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request
  const todoExists = user.todos.find(todo => todo.id === id)

  if(!todoExists) return response.status(404).json({error: "todo doesnt exists"})

  todoExists.done = true
  return response.status(200).json(todoExists)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request

  const todoExists = user.todos.find(todo => todo.id === id)

  if(!todoExists) return response.status(404).json({error: "todo doesnt exists"})

  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  user.todos.splice(todoIndex,1)
  return response.status(204).send()

});

module.exports = app;