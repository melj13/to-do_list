import { it, expect, describe } from 'vitest';
import request from 'supertest'
import app from '../app.js';
import { format } from "date-fns";

var responseTodoList
var responseTodo

/**POST /todo-list **/
describe('Create Todo-list - SUCCESS', () => {
    it("returns status code 200", async (req, res) => {
        const todolistPayload = {
            title: "test todo-list",
            color: "red"
        }

        const response = await request(app).post('/todo-list').send(todolistPayload)
        responseTodoList = JSON.parse(response.text)
        expect(response.statusCode).toBe(200)

    })
})

/**POST /todos **/
describe('Create Todos - SUCCESS', () => {
    it("returns status code 200", async (req, res) => {
        const todoPayload = {
            todolistId: responseTodoList.id,
            title: "test todo",
            description: "test description"
        }
        const response = await request(app).post('/todos').send(todoPayload);
        responseTodo = JSON.parse(response.text)
        expect(response.statusCode).toBe(200)
    })
})

/**PUT /todo-list **/
describe('Update Todo-list - SUCCESS', () => {
    it("returns status code 200", async (req, res) => {
        const todolistupdatedPayload = {
            id: responseTodoList.id,
            title: "test update todo-list",
            color: "red"
        };

        const response = await request(app).put('/todo-list').send(todolistupdatedPayload);
        expect(response.statusCode).toBe(200)
    })
})

/**PATCH /todos **/
describe('Update Todos- SUCCESS', () => {
    it("returns status code 200", async (req, res) => {
        const todosupdatedPayload = {
            id: responseTodo.id,
            title: "test update todo-list",
            description: "test description",
            isComplete: 1
        };

        const response = await request(app).patch('/todos').send(todosupdatedPayload);
        expect(response.statusCode).toBe(200)
    })
})

/**GET /todo-list/:id **/
describe('GET Todo-list - SUCCESS', () => {
    describe('Given the todo-list does exist', () => {
        it("should return 200 status", async (req, res) => {
            const todolistId = responseTodoList.id
            const response = await request(app).get(`/todo-list/${todolistId}`).send();
            expect(response.statusCode).toBe(200)
        })
    })
})

/**GET /todo-lists/?page=PAGE&limit=LIMIT**/
describe('GET All Todo-list - SUCCESS', () => {
    describe('Given the page and limit', () => {
        it("should return 200 status", async (req, res) => {
            const page = 1
            const limit = 2
            const response = await request(app).get(`/todo-lists?page=${page}&limit=${limit}`).send();
            expect(response.statusCode).toBe(200)
        })
    })
})

/**GET /todo-lists/?page=PAGE&limit=LIMIT - FAILED**/
describe('GET Todo-list - FAILED', () => {
    describe('Given the todo-list does not exist', () => {
        it("should return 404 status", async (req, res) => {
            const todolistId = "1"
            const response = await request(app).get(`/todo-list/${todolistId}`).send();
            expect(response.statusCode).toBe(404)
        })
    })
})

/**DELETE /todos/:id **/
describe('DELETE todo - SUCCESS', () => {
    it("should return 200 status", async (req, res) => {
        const todoId = responseTodo.id
        const response = await request(app).delete(`/todos/${todoId}`).send();
        expect(response.statusCode).toBe(200)
    })
})

/**DELETE /todo-list/:id **/
describe('DELETE todo - SUCCESS', () => {
    it("should return 200 status", async (req, res) => {
        const todoListId = responseTodoList.id
        const response = await request(app).delete(`/todo-list/${todoListId}`).send();
        expect(response.statusCode).toBe(200)
    })
})

/**POST /todo-list - FAILED**/
describe('Create Todo-list - FAILED', () => {
    describe('No title given', () => {
        it("return status code 422", async (req, res) => {
            const todolistPayload = {
                color: "red"
            }
            const response = await request(app).post('/todo-list').send(todolistPayload)
            expect(response.statusCode).toBe(422)

        })
    })
})

/**POST /todos - FAILED**/
describe('Create Todos - FAILED', () => {
    describe('No todolistId given', () => {
        it("return status code 422", async (req, res) => {
            const todoPayload = {
                title: "test todo",
                description: "test description"
            }
            const response = await request(app).post('/todos').send(todoPayload);
            responseTodo = JSON.parse(response.text)
            expect(response.statusCode).toBe(422)
        })
    })
})

/**POST /todos - FAILED**/
describe('Create Todos - FAILED', () => {
    describe('No title given', () => {
        it("return status code 422", async (req, res) => {
            const todoPayload = {
                todolistId: responseTodoList.id,
                description: "test description"
            }
            const response = await request(app).post('/todos').send(todoPayload);
            responseTodo = JSON.parse(response.text)
            expect(response.statusCode).toBe(422)
        })
    })
})

/**POST /todos - FAILED**/
describe('Create Todos - FAILED', () => {
    describe('todolistId does not exist', () => {
        it("return status code 404", async (req, res) => {
            const todoPayload = {
                todolistId: "1",
                title: "test todo",
                description: "test description"
            }
            const response = await request(app).post('/todos').send(todoPayload);
            responseTodo = JSON.parse(response.text)
            expect(response.statusCode).toBe(404)
        })
    })
})

/**PUT /todo-list - FAILED**/
describe('Update Todo-list - FAILED', () => {
    describe('todolistId does not exist', () => {
        it("returns status code 404", async (req, res) => {
            const todolistupdatedPayload = {
                id: "1",
                title: "test update todo-list",
                color: "red"
            };

            const response = await request(app).put('/todo-list').send(todolistupdatedPayload);
            expect(response.statusCode).toBe(404)
        })
    })
})

/**PATCH /todos - FAILED**/
describe('Update Todos- FAILED', () => {
    describe('todoId does not exist', () => {
        it("returns status code 404", async (req, res) => {
            const todosupdatedPayload = {
                id: responseTodo.id,
                title: "test update todo-list",
                description: "test description",
                isComplete: 1
            };

            const response = await request(app).patch('/todos').send(todosupdatedPayload);
            expect(response.statusCode).toBe(404)
        })
    })
})