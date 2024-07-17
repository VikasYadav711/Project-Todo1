const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/todo.html");
});

app.get("/todoScript.js", function (req, res) {
  res.sendFile(__dirname + "/todoScript.js");
});

// Route to handle adding a new todo
app.post("/", function (req, res) {
  saveTodoInFile(req.body, function (err, savedTodo) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).json(savedTodo);
  });
});

// Route to get all todos
app.get("/todo-data", function (req, res) {
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).json(data);
  });
});

// Route to delete a todo
app.delete("/delete-todo/:id", function (req, res) {
  const todoId = req.params.id;
  deleteTodoById(todoId, function (err) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).send("success");
  });
});

// Route to update a todo
app.patch("/update-todo/:id", function (req, res) {
  const todoId = req.params.id;
  const updates = req.body;

  updateTodoById(todoId, updates, function (err) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).send("success");
  });
});

app.listen(3000, function () {
  console.log("server on port 3000");
});

// Existing functions for handling todos
function readAllTodos(callback) {
  fs.readFile("./task.txt", "utf-8", function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    let todos = [];
    if (data.length !== 0) {
      todos = JSON.parse(data);
    }

    callback(null, todos);
  });
}

function saveTodoInFile(todo, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    const id = Date.now().toString(); // Generate a unique id
    const savedTodo = { ...todo, id }; // Add the 'id' property to the todo

    data.push(savedTodo);

    fs.writeFile("./task.txt", JSON.stringify(data), function (err) {
      if (err) {
        callback(err);
        return;
      }

      callback(null, savedTodo);
    });
  });
}

function deleteTodoById(id, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    const updatedTodos = data.filter((todo) => todo.id !== id);

    fs.writeFile("./task.txt", JSON.stringify(updatedTodos), function (err) {
      if (err) {
        callback(err);
        return;
      }

      callback(null);
    });
  });
}

function updateTodoById(id, updates, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    const updatedTodos = data.map((todo) => {
      if (todo.id === id) {
        return { ...todo, ...updates };
      }
      return todo;
    });

    fs.writeFile("./task.txt", JSON.stringify(updatedTodos), function (err) {
      if (err) {
        callback(err);
        return;
      }

      callback(null);
    });
  });
}
