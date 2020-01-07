import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ITodo } from '../types';
const $instance = axios.create();
const mock = new MockAdapter($instance);


const todos: ITodo[] = []

/**
 * get todos
 */
mock.onGet('/todos').reply((config) => {
  return [200, todos]
})

/**
 * create a new todo
 */
mock.onPost('/todos').reply((config) => {
  const todo: ITodo = JSON.parse(config.data);
  todo.id = Math.random().toString();
  todos.push(todo);
  return [200, todo]
})

/**
 * update todo
 */
mock.onPut(/\/todos\/\.*/).reply((config) => {
  const id = config.url!.replace('/todos/', '')
  const data = JSON.parse(config.data)
  delete data.id;
  const index = todos.map((t) => t.id).indexOf(id)
  Object.assign(todos[index], data)
  return [200, 'ok']
})

/**
 * delete todo
 */
mock.onDelete(/\/todos\/\.*/).reply((config) => {
  const id = config.url!.replace('/todos/', '')
  const index = todos.map((t) => t.id).indexOf(id)
  todos.splice(index, 1)
  return [200, 'ok']
})

export default $instance;