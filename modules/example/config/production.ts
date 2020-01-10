import axios from 'axios';

export default {
  app: { /* additional app config, goes to index.vue */ },
  store: {
    todos: {
      axios: () => axios.create()
    }
  },
}