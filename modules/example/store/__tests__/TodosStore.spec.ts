import Vuex from 'vuex'
import {createLocalVue} from '@vue/test-utils'
import {getModule} from 'vuex-module-decorators'
import TodosStore from '../todos'
import { ITodo } from '../types'

import { provideVuex } from 'provide-consume-decorator'
import apiMock from './todos.api.mock'


const Vue = createLocalVue()
Vue.use(Vuex)

/**
 * Factory function returns a new store instance
 */
const factory = () => {
  @provideVuex({
    axios: () => apiMock
  })
  class TodosStoreMock extends TodosStore {

  }
  const store = new Vuex.Store({
    modules: {
      todos: TodosStoreMock
    }
  })
  return getModule(TodosStoreMock, store)
}


describe('TodosStore', () => {
  it('has to get a store instance', async (done) => {
    const service = factory()
    expect(service).toBeInstanceOf(Object)
    done()
  });
  it('setTodos', () => {
    const service = factory()
    const todo: ITodo = {
      id: '1',
      text: 'test',
      timeCreated: new Date,
      isComplete: false
    }
    service.setTodos([todo])
    expect(service.todos[0]).toBe(todo)
  });
  it('pushTodo', () => {
    const service = factory()
    const todo: ITodo = {
      id: '2',
      text: 'test',
      timeCreated: new Date,
      isComplete: false
    }
    service.pushTodo(todo)
    expect(service.todos[0]).toBe(todo)
  })
  it('createTodo/getTodos', async (done) => {
    const service = factory()
    await service.createTodo({
      id: '3',
      text: 'test1',
      timeCreated: new Date,
    })
    const todos = await service.getTodos()
    const todo = todos.find((e: ITodo) => e.text === 'test1')
    expect(todo).toBeInstanceOf(Object)
    expect(todo!.text).toEqual('test1')
    // getTodos should also save todos locally
    const localTodo = service.todos.find(e => e.text === 'test1')
    expect(localTodo).toBeInstanceOf(Object)
    expect(localTodo!.text).toEqual('test1')
    done()
  })
  it('deleteTodo', async (done) => {
    const service = factory()
    await service.createTodo({
      id: '4',
      text: 'test2',
      timeCreated: new Date,
    })
    await service.getTodos()
    const todo = service.todos.find((e: ITodo) => e.text === 'test2')
    expect(todo).toBeInstanceOf(Object)
    await service.deleteTodo(todo as ITodo)
    await service.getTodos()
    const notFound = service.todos.find((e: ITodo) => e.text === 'test2')
    expect(notFound).toBeUndefined()
    done()
  })
  it('setTodoComplete', async (done) => {
    const service = factory()
    await service.createTodo({
      id: '5',
      text: 'test3',
      timeCreated: new Date,
    })
    await service.getTodos()
    const todo = service.todos.find((e: ITodo) => e.text === 'test3')
    expect(todo).toBeInstanceOf(Object)
    await service.setTodoComplete({id: todo!.id, data: {isComplete: true}})
    await service.getTodos()
    const completeTodo = service.todos.find((e: ITodo) => e.text === 'test3')
    expect(completeTodo!.isComplete).toBe(true)
    await service.setTodoComplete({id: todo!.id, data: {isComplete: false}})
    await service.getTodos()
    const incompleteTodo = service.todos.find((e: ITodo) => e.text === 'test3')
    expect(incompleteTodo!.isComplete).toBe(false)
    done()
  })
})



