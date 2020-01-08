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
import {ITodosStore} from '../store/types'

@Component
export default class extends Vue {
  @Prop() ds!: ITodosStore;
}
</script>

<style scoped>
</style>