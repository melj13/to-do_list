import uuid from 'short-uuid';
import _ from 'lodash';
import { format } from "date-fns";

export default function (app) {
  /**
     * Retrieves a todo list
     * @param {number} id - The Todo-list ID
     * @return {object} - The Todo-list details
     */
  app.get('/todo-list/:id', async (req, res) => {
    const {
      todos,
      todolists,
    } = req.db.data;

    const todolistId = req.params.id
    const todolist = todolists.find((r) => r.id === todolistId)

    if (!todolist) return res.status(404).json({ message: 'Error: Todo-list does not exist' })

    todolist.todos = _.filter(todos, function (t) {
      return t.todolistid.match(todolist.id);
    })

    return res.status(200).json(todolist)
  });

  /**
     * Todo: Gets all todo list
     * @return {array} - Array of Todo-list
     */
  app.get('/todo-lists', async (req, res) => {
    const {
      todolists,
      todos,
    } = req.db.data;

    if (todolists.length === 0) return res.status(200).json({});

    var todoResponse = todolists

    //Construct response
    for (var [i, todolist] of todolists.entries()) {
      todoResponse[i].todos =
        _.filter(todos, function (t) {
          return t.todolistid.match(todolist.id);
        })
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (!page && !limit) {
      res.status(200).json(todoResponse);
      return
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < todoResponse.length) {
      results.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit,
      };
    }

    results.results = todoResponse.slice(startIndex, endIndex);

    res.status(200).json(results);
  });

  /**
     * Creates a new todo-list
     * @param {string} title - title of the todo-list
     * @param {string} color - color of the todo-list
     * @param {string} created_at - timestamp creation of todo-list
     * @param {string} updated_at - timestamp updated of todo-list
     * @return {object} - The todo-list created
     */
  app.post('/todo-list', async (req, res) => {
    const {
      todos,
      todolists,
    } = req.db.data;

    let result = {}
    let todoArr = []

    let color = req.body.color
    if (!color) color = "white"

    if (!req.body.title) return res.status(422).json("Todo-list must have title")

    const todolistRec = {
      id: uuid.generate(),
      title: req.body.title,
      color: color,
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };

    todolists.push(todolistRec);
    req.db.write();

    result = todolistRec

    if (req.body.todos != null) {
      if (req.body.todos.length > 0) {
        todoArr = []
        for (var [i, todosEntry] of req.body.todos.entries()) {
          const todoRec = {
            id: uuid.generate(),
            todolistid: todolistRec.id,
            title: todosEntry.title,
            description: todosEntry.description,
            isComplete: 0,
            createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          }

          todos.push(todoRec);
          req.db.write();
          todoArr.push(todoRec);
        }
        result.todos = todoArr
      }
    }

    return res.status(200).json(result)
  });

  /**
   * Creates a new todos
   * @param {string} todolistId - id of todo-list
   * @param {string} title - title of the todo
   * @param {string} description - color of the todo-list
   * @return {object} - The todo created
   */
  app.post('/todos', async (req, res) => {
    const {
      todos,
      todolists,
    } = req.db.data;

    if (!req.body.todolistId) return res.status(422).json("Todo must have todolistId")
    if (!req.body.title) return res.status(422).json("Todo must have title")

    const todolistId = req.body.todolistId
    const todolist = todolists.find((r) => r.id === todolistId)
    if (!todolist) return res.status(404).json({ message: 'Error: Todo-list does not exist' })

    let description = req.body.description ? req.body.description : ""

    const todosRec = {
      id: uuid.generate(),
      todolistid: req.body.todolistId,
      title: req.body.title,
      description: description,
      isComplete: 0,
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };

    todos.push(todosRec);
    req.db.write();

    return res.status(200).json(todosRec)
  });

  /**
     * Update todo-list via ID
     * @param {number} id - id of the todo-list
     * @param {string} title - title of the todo-list
     * @param {string} color - color of the todo-list
     * @return {object} - The Todo-list Updated
     */
  app.put('/todo-list', async (req, res) => {
    const {
      todolists,
    } = req.db.data;

    if (!req.body.title) return res.status(422).json("Todo must have title")

    const todolistId = req.body.id;
    const checkTodoList = todolists.find((r) => r.id === todolistId);
    if (!checkTodoList) return res.status(404).json({ message: 'Error: Todo-list does not exist' });

    const fieldsToUpdate = {
      ...req.body,
      updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };

    // Update record
    let updatedUser = "";
    todolists.map((r) => {
      if (r.id === todolistId) {
        updatedUser = _.assign(r, fieldsToUpdate)
      }
      return r;
    })

    req.db.write()
    console.log(`Updated Successfully ID: ${todolistId}`)

    return res.status(200).json(updatedUser)
  });

  /**
   * Update todos via ID
   * @param {number} id - id of the todos
   * @param {string} title - title of the todos
   * @param {string} description - description of the todos
   * @param {string} isComplete - isComplete of the todos
   * @return {object} - The Todos Updated
   */
  app.patch('/todos', async (req, res) => {
    const {
      todos,
    } = req.db.data;

    if (!req.body.title) return res.status(422).json("Todo must have title")

    const todosId = req.body.id;
    const checkTodos = todos.find((r) => r.id === todosId);
    if (!checkTodos) return res.status(404).json({ message: 'Error: Todos does not exist' });

    const fieldsToUpdate = {
      ...req.body,
      updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };

    // Update record
    let updatedTodos = "";
    todos.map((r) => {
      if (r.id === todosId) {
        updatedTodos = _.assign(r, fieldsToUpdate)
      }
      return r;
    })

    req.db.write()
    console.log(`Updated Successfully ID: ${todosId}`)

    return res.status(200).json(updatedTodos)
  });

  /**
   * Delete todo-list via ID
   * @param {number} id - id of the todo-list
   */
  app.delete('/todo-list/:id', async (req, res) => {
    const {
      todos,
      todolists
    } = req.db.data;

    const todoListId = req.params.id;

    const checkTodoList = todolists.find((r) => r.id === todoListId);
    if (!checkTodoList) return res.status(404).json({ message: 'Error: Todo-List does not exist' });

    // Delete record
    let deleteTodo = "";
    deleteTodo = _.remove(todos, function (n) {
      return n.todolistid.match(todoListId)
    })

    let deleteTodoList = "";
    deleteTodoList = _.remove(todolists, function (n) {
      return n.id.match(todoListId)
    })

    req.db.write()
    console.log(`Deleted Successfully Todo-List ID: ${todoListId}`)

    return res.status(200).json(`Deleted Successfully Todo-List ID: ${todoListId}`)
  });

  /**
 * delete todos via ID
 * @param {number} id - id of the todos
 */
  app.delete('/todos/:id', async (req, res) => {
    const {
      todos,
    } = req.db.data;

    const todosId = req.params.id;

    const checkTodos = todos.find((r) => r.id === todosId);
    if (!checkTodos) return res.status(404).json({ message: 'Error: Todos does not exist' });

    // Delete record
    let deleteTodo = "";
    deleteTodo = _.remove(todos, function (n) {
      return n.id.match(todosId)
    })

    req.db.write()
    console.log(`Deleted Successfully ID: ${todosId}`)

    return res.status(200).json(`Deleted Successfully Todo ID: ${todosId}`)
  });
}
