<template>
  <div/>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue
} from "nuxt-property-decorator"
import { State } from "vuex-class"
import {ITodosStore, ITodo} from '../store/types'

@Component
export default class extends Vue {
  @Prop() ds!: ITodosStore;
  
  get todos() {
    return this.ds ? this.ds.todos : []
  }

  //methods
  async setComplete(todo: ITodo) {
    await this.ds!.setTodoComplete({
      id: todo.id as string, 
      data: { isComplete: !todo.isComplete }
    })
    .then(() => this.ds.getTodos())
  }
  async deleteTodo(todo: ITodo) {
    await this.ds.deleteTodo(todo)
      .then(() => this.ds.getTodos())
  }
}
</script>

<style scoped>
</style>