<template>
  <section>
    <input type="text" v-model="text" /> 
    <button @click="create">+ add</button>
  </section>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue
} from "nuxt-property-decorator"
import {ITodosStore, ITodo} from '../store/types'

@Component
export default class extends Vue {
  //props
  @Prop() ds!: ITodosStore;
  
  //data()
  text: string = "";
  
  //getters
  get todo(): ITodo {
    return {
      text: this.text,
      timeCreated: new Date,
      isComplete: false
    }
  }

  //methods
  async create() {
    const todo = this.todo;
    await this.ds.createTodo(todo)
      .then(() => this.ds.getTodos())
    this.text = ""
  }

}
</script>

<style scoped>
</style>