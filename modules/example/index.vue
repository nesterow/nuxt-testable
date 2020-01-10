<template>
  <section>
    <add-todo :ds="ds" />
    <todo-list :ds="ds" />
  </section>
</template>

<script lang="ts">
import {
  Component,
  Vue
} from "nuxt-property-decorator"
import { State } from "vuex-class"
import {provide, consume} from 'provide-consume-decorator'
import { getModule } from "vuex-module-decorators"
import TodosStore from './store/todos'

import AddTodo from './components/AddTodo.vue';
import TodoList from './components/TodoList.vue';
import config from './config'

@Component({
  components: {
    AddTodo,
    TodoList
  }
})
@provide({
  //provide a data store
  dataStore() {
    return getModule(TodosStore, this.$store)
  },
  ...config.app
})
export default class extends Vue {

  @consume('dataStore') ds!: TodosStore;

}
</script>

<style scoped>
</style>