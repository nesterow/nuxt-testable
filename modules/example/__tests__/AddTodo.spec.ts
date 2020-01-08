
import factory from './__factory'
import TodosStore from '../store/todos'
import { getModule } from "vuex-module-decorators"

//@ts-ignore
import AddTodo from '../components/AddTodo.vue';

const createComponent = () => {

  const component = factory(AddTodo)
  
  const props = {
    ds: getModule(TodosStore, component.vm.$store)
  }

  const data = {

  }

  component.setProps(props)
  component.setData(data)
  return component

}

describe("AddTodo.vue", () => {
  it('mounts with store', () => {
    const wrap = createComponent()
    expect(wrap.vm).toBeInstanceOf(Object)
    expect((wrap.vm as any).ds.todos).toBeInstanceOf(Array)
  })
  it('create()', async () => {
    const wrap = createComponent()
    const ctx = wrap.vm as any // as Vue & IAddTodo if want it typed
    wrap.setData({
      text: 'test'
    })
    await ctx.create()
    const todo = ctx.ds.todos[0]
    expect(todo.text).toBe('test')
    expect(ctx.text).toBe('')
  })
})