import apiMock from '../store/__tests__/todos.api.mock';

export default {
  app: { /* additional app config, goes to index.vue */ },
  store: {
    todos: {
      axios: () => apiMock
    }
  },
}