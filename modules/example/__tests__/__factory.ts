import Vuex from 'vuex'
import {createLocalVue, mount, config, VueClass} from "@vue/test-utils";
import TodosStore from '../store/todos'
import apiMock from '../store/__tests__/todos.api.mock'

import { getModule } from "vuex-module-decorators"
import { provideVuex, provide } from 'provide-consume-decorator'
import {Component, Vue } from "nuxt-property-decorator"

export default (VueComponent: VueClass<Vue>, props?: any, attrs?: any) => {
  
  // store mock
  @provideVuex({
    axios: () => apiMock
  })
  class TodosStoreMock extends TodosStore {}
  
  // we also provide `dataStore` to components
  @Component
  @provide({
    dataStore() {
      return getModule(TodosStore, this.$store)
    }
  })
  class VueComponentMock extends VueComponent {}


  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store({
    modules: {
      'todos': TodosStoreMock
    }
  })
  return mount(VueComponentMock, {
    props,
    attrs,
    store,
    localVue
  })
}