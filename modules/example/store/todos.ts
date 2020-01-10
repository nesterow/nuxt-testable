import axios, {AxiosInstance} from 'axios';
import {provideVuex, consume} from 'provide-consume-decorator';
import {Module, VuexModule, Mutation, Action} from 'vuex-module-decorators';
import {ITodosStore, ITodo} from './types';
import config from '../config';

@Module({
  name: 'todos',
  namespaced: true,
  stateFactory: true
})
@provideVuex(config.store.todos)
export default class extends VuexModule implements ITodosStore {
  
  @consume('axios') api!: AxiosInstance;
  
  /**
   * Todos state
   */
  todos: ITodo[] = [];

  /**
   * Todos mutation
   * @param todos: ITodo[]
   */
  @Mutation
  setTodos(todos: ITodo[]) {
    this.todos = todos;
  }

  /**
   * pushTodo
   * @param todo: ITodo
   */
  @Mutation
  pushTodo(todo: ITodo) {
    this.todos.push(todo);
  }

  /**
   * getTodos
   * @returns Promise<ITodo[]>
   */
  @Action
  async getTodos(): Promise<ITodo[]> {
    return this.api!.get('/todos').then((res) => {
      this.setTodos(res.data)
      return res.data
    })
  }

  /**
   * createTodo 
   */
  @Action
  async createTodo(todo: ITodo) {
    return this.api!.post('/todos', todo).then((res) => {
      return res.data
    })
  }

  /**
   * deleteTodo 
   */
  @Action
  async deleteTodo(todo: ITodo) {
    return this.api!.delete(`/todos/${todo.id}`)
  }

  /**
   * setTodoComplete 
   */
  @Action
  async setTodoComplete(opts: {id: string, data: any}) {
    return this.api!.put(`/todos/${opts.id}`, {...opts.data})
  }


}