import factory from './__factory'
import TodosStore from '../store/todos'
import { getModule } from "vuex-module-decorators"

//@ts-ignore
import TodoList from '../components/TodoList.vue';

const createComponent = () => {

  const component = factory(TodoList)
  
  const props = {
    ds: getModule(TodosStore, component.vm.$store)
  }

  const data = {

  }

  component.setProps(props)
  component.setData(data)
  return component

}

describe("TodoList.vue",  () => {
  it('mounts with store', () => {
    const wrap = createComponent()
    expect(wrap.vm).toBeInstanceOf(Object)
    expect((wrap.vm as any).ds.todos).toBeInstanceOf(Array)
  })
  it('setComplete()', async () => {
    const wrap = createComponent();
    const ctx = wrap.vm as Vue & any;
    await ctx.ds.createTodo({
      id: '1',
      text: 'test',
      timeCreated: new Date,
    });
    await ctx.ds.getTodos();
    expect(ctx.ds.todos[0].text).toBe('test')
    await ctx.setComplete(ctx.ds.todos[0])
    expect(ctx.ds.todos[0].isComplete).toBe(true)
  })
  it('deleteTodo()', async () => {

  })
})