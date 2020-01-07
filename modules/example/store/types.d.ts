import {AxiosInstance} from 'axios';

export interface ITodosStore {
  api: AxiosInstance
  todos: ITodo[]
  setTodos: (todos: ITodo[]) => void
  pushTodo: (todo: ITodo) => void
  getTodos: () => Promise<ITodo[]>
  createTodo: (todo: ITodo) => Promise<ITodo>
  deleteTodo: (todo: ITodo) => Promise<any>
  setTodoComplete: (opts: {id: string, data: any}) => Promise<any>
} 

export interface ITodo {
  id: string,
  text: string
  timeCreated: Date
  isComplete?: boolean
}
