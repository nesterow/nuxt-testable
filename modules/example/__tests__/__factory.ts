import Vuex from 'vuex';
import {createLocalVue, mount, config, VueClass} from '@vue/test-utils';
import TodosStore from '../store/todos';
import { Vue } from "nuxt-property-decorator";

export default (VueComponent: VueClass<Vue>, props?: any, attrs?: any) => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store({
    modules: {
      'todos': TodosStore
    }
  })
  return mount(VueComponent, {
    props,
    attrs,
    store,
    localVue
  })
}