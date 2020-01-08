# nuxt-testable


# TL;DR
Whenever I write code, an unit test is always the first debugging tool I use to verify that everything works as intended. Sometimes I catch myself thinking that I cannot imagine development process without writing tests. However, when I work on some projects it is impossible to use TDD, because legacy codebase doesn't follow any good principles (SOLID, GoF) or people who develop it, simply don't know how to write testable code with VueJS. And to my disappointment, I couldn't find any reasonable materials about testing client javascript applications written with VueJS.

In this tutorial, I want to share patterns that help me writing testable VueJS applications. I am going to use [NuxtJS typescript template](https://github.com/nuxt-community/typescript-template) from Nuxt Community, and class-based style for Vue and Vuex components.

------------------
## Setup environment

#### 1. Generate application skeleton and install dependencies:

```bash
~$ vue init nuxt-community/typescript-template vue-testable
~$ cd vue-testable
~$ npm install
~$ npm install vuex-module-decorators
~$ npm install -D @babel/core @types/jest @typescript-eslint/eslint-plugin @typescript-eslint/parser @vue/eslint-config-typescript @vue/test-utils babel-core@7.0.0-bridge.0 babel-eslint babel-jest babel-plugin-dynamic-import-node babel-plugin-transform-decorators eslint eslint-config-google eslint-plugin-nuxt eslint-plugin-vue jest ts-jest vue-jest -D
```

------------------
#### 2. Setup Jest

Open your `package.json` and add following configuration:
```javascript
//package.json
{
 //....
 "jest": {
    "testRegex": "(/__tests__/*|(\\.|/)spec)\\.(jsx?|tsx?)$",
    "moduleFileExtensions": [
      "js",
      "ts",
      "json",
      "vue"
    ],
    "transform": {
      ".*\\.(vue)$": "vue-jest",
      "^.+\\.ts?$": "ts-jest",
      "^.+\\.js$": "babel-jest"
    },
    "testURL": "http://localhost/"
  }

}
```

Open `tsconfig.json` and add `@types/jest` to the "types" section:
```javascript
//package.json
{
 //...
 "types": [
   "@nuxt/types",
   "@nuxtjs/axios",
   "@types/jest"
 ]
}
```
Also, if the "scripts" section in the `package.json` doesn't have "test" script, add following:
```javascript
//package.json
{
 //..
 "scripts": {
    //...
    "test": "NODE_ENV=test jest"
  },
}

```

------------------
#### 2. Setup babel plugins

This is optional, but recommended step. If you're building an universal application you'll find `dynamic imports` very useful. You might need it to import libraries dynamically only on the client side, because some UI libraries don't care about server environment and reference `window` and `document` objects.

Open `package.json` and add following configuration:

```javascript
//package.json
{
 //....
 "babel": {
    "plugins": [
      [
        "dynamic-import-node",
        {
          "noInterop": true
        }
      ]
    ],
    "env": {
      "test": {
        "presets": [
          [
            "@babel/preset-env",
            {
              "targets": {
                "node": "current"
              }
            }
          ]
        ]
      }
    }
  }
}
```

------------------


## Organising the code 

Let's take a pause and consider how we organise the application code. 

Application structure so far:

```
.
├── [assets]
├── [components]
├── [layouts]
├── [middleware]
├── [pages]
├── [static]
├── [store]
├── [types]
├── nuxt.config.ts
├── package-lock.json
├── package.json
└── tsconfig.json
```

Most people stop at this point and just follow boilerplate defaults. Because the initial application skeleton is self-descriptive you don't have to think where to put a component. And it works whenever you need to create a simple application or a five-pages-site. But what if your application grows to hundreds of views/pages? What if you need most of the views to be customisable enough to move them between projects? How would you achieve this?


--------
## Modules

Instead of writing application by boilerplate, I suggest to treat default application structure as an *assembly point* for *independent modules*. I mean 'modules' in broader sense than just nuxt modules. In this case a module should fit for any vuex-driven application.

Let's see what would a module structure look like for a Vue/Vuex application. A module should include following entities: components, vuex store, styles, restapi/middleware, type definitions, etc.

Now, we can remove "components" and "middleware" directories from application and add "modules" instead:


```
.
├── [modules]
|     |
|     └──[module]
|          ├── [__tests__]
|          ├── [components]
|          ├── [store]
|          ├── index.vue
|          └── index.ts
|
├── [layouts]
├── [pages]
├── [static]
├── [store]
├── [types]
├── nuxt.config.ts
├── package-lock.json
├── package.json
└── tsconfig.json
```


---------------
## Class-based components.
Writing vue components as classes allows for more sharp and maintainable code. Also, it gives us an opportunity to use inheritance and apply OOP patterns in more concise way.

Following libraries help us to write components in class-based style: 
[vuex-module-decorators](https://github.com/championswimmer/vuex-module-decorators) and [nuxt-property-decorator](https://github.com/nuxt-community/nuxt-property-decorator). Later we'll see how they work in detail.

## Writing a simple app
Let's write a simple todo application. I believe you've done one of those before, but this time instead of jumping right into visual part of the application, we'll do the data model first and start from creating Vuex store. More importantly, we'll begin with writing a specification for our Vuex store. "Specification" is just another word for "test". 

During development process, a specification is the first debugging tool. If you had never written a test before, just think about it as of a sophisticated "console.log". 

## Test Vuex modules

To begin, create a couple new files in our example module: `store/todos.ts` and `store/__tests__/TodosStore.spec.ts`.
```
[modules]
    |
    └──[example]
        |
        ├── [store]
        |      ├──[__tests__]
        |      |        └── TodosStore.spec.ts
        .      └──todos.ts
```

Let's leave `todos.ts` with an empty export for now:
```typescript
// store/todos.ts
export default {}
```


Add following code to the `TodosStore.spec.ts` :

```typescript
// store/__tests__/TodosStore.spec.ts

import Vuex from 'vuex'
import {createLocalVue} from '@vue/test-utils'
import {getModule} from 'vuex-module-decorators'
import TodosStore from '../todos'

const Vue = createLocalVue()
Vue.use(Vuex)

/**
 * Factory function returns a new store instance
 */
const factory = () => {
  const store = new Vuex.Store({
    modules: {
      todos: TodosStore
    }
  })
  return getModule(TodosStore, store)
}

/**
 * The test case
 */
describe('TodosStore', () => {
  it('has to get a store instance', async (done) => {
    const service = factory()
    expect(service).toBeInstanceOf(Object)
    done()
  })
})


```
###### SPECIFICATION STRUCTURE
  
1. Imports

  - In order to create a vue exemplar we'll use `createLocalVue()` from `@vue/test-utils`
  - To use Vuex module as a class instance we will use `getModule()` [details](https://github.com/championswimmer/vuex-module-decorators#accessing-modules-with-nuxtjs)

2. Factory function

  - A factory function should build and return our testable component. If the factory function is more complex we can put in to a dedicated file.

3. Test case

 - Everything you put into `describe()` should be related to one use case
 - Unit tests are placed inside `it()`

###### RUNNING THE TEST

Let's try to execute the test first time:
```bash
~$ npm test

Error:
  Type '{}' provides no match for the signature 'new (...args: any[]): VuexModule<ThisType<any>, any>'.

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
```
The test should fail because we don't yet have our store module in place.

Here is how TDD process goes most of the time: 
1. You write a failing test.
2. You make the test pass.
3. You write next failing test and return to step one.

To be realistic, this is not always the case. Sometimes you need to write the test subject before writing the spec, but it doesn't matter if you use the spec for debugging. Also, not everything should be covered by tests - only the parts that affect your program correctness. 

### Vuex module
Now, let's make the test pass. At the current state our test should pass simply when we create a complete Vuex module.

##### USEFUL TIP:
> Run `npm test -- --watch` to run tests automatically whenever you save files.

```typescript
// store/todos.ts

import {Module, VuexModule, Mutation, Action} from 'vuex-module-decorators';
import {ITodosStore} from './types'

@Module({
  name: 'todos',
  namespaced: true
})
export default class extends VuexModule implements ITodosStore {

}
```

Don't forget to add type defs as you go:
```typescript
// store/types.d.ts

export interface ITodosStore {

} 
``` 

##### TEST OUTPUT:
```
 PASS  modules/example/store/__tests__/TodosStore.spec.ts
  TodosStore
    ✓ has to get a store instance (7ms)
```

After the first test is successful, we can be sure that our store instance is constructed correctly and we can proceed with creating actual application model. 

### Vuex state and mutations

When you design a data model for you typescript application, the best place to start is the type declaration. Let's declare an interface `ITodo` which describes structure of a todo item:

```typescript
// store/types.d.ts

export interface ITodosStore {
  todos: ITodo[]
} 

export interface ITodo {
  id?: string,
  text: string
  timeCreated: Date
  isComplete?: boolean
}

```

Now, let's specify the methods responsible for changing `todos` state.
I assume that vuex actions are asynchronous and return a `Promise` object, when vuex actions are synchronous and should not return anything:

```typescript
// store/types.d.ts

export interface ITodosStore {
  todos: ITodo[]
  setTodos: (todos: ITodo[]) => void
  pushTodo: (todo: ITodo) => void
  getTodos: () => Promise<ITodo[]>
  createTodo: (todo: ITodo) => Promise<ITodo>
  deleteTodo: (todo: ITodo) => Promise<any>
  setTodoComplete: (opts: {id: string, data: any}) => Promise<any>
} 

export interface ITodo {
  id?: string,
  text: string
  timeCreated: Date
  isComplete?: boolean
}

```

At this point, if you run the test it would fail due to type errors. Because our store doesn't implement interface `ITodosStore` as it supposed to. Let's fix it:

```typescript
// store/todos.ts

import {Module, VuexModule, Mutation, Action} from 'vuex-module-decorators';
import {ITodosStore, ITodo} from './types'

@Module({
  name: 'todos',
  namespaced: true,
})
export default class extends VuexModule implements ITodosStore {
  /**
   * Todos state
   */
  todos: ITodo[] = [];
  /**
   * Todos mutation
   * @param todos: ITodo[]
   */
  @Mutation
  setTodos(todos: ITodo[]) {
    this.todos = todos;
  }
  /**
   * pushTodo
   * @param todo: ITodo
   */
  @Mutation
  pushTodo(todo: ITodo) {
    this.todos.push(todo);
  }
  /**
   * getTodos
   * @returns Promise<ITodo[]>
   */
  @Action
  async getTodos(): Promise<ITodo[]> {
    this.setTodos([])
    return []
  }
  /**
   * createTodo 
   */
  @Action
  async createTodo(todo: ITodo) {
    return todo
  }
  /**
   * deleteTodo 
   */
  @Action
  async deleteTodo(todo: ITodo) {

  }
  /**
   * setTodoComplete 
   */
  @Action
  async setTodoComplete(todo: ITodo, isComplete: boolean) {

  }
}
``` 

### Testing mutations
Once we've designed store structure, it is time to implement mutations. 
We'll start from writing a test:
```typescript
// store/__tests__/TodosStore.spec.ts

⌃...
it('setTodos', () => {
  const service = factory()
  const todo: ITodo = {
    id: '1',
    text: 'test',
    timeCreated: new Date,
    isComplete: false
  }
  service.setTodos([todo])
  expect(service.todos[0]).toBe(todo)
});
it('pushTodos', () => {
  const service = factory()
  const todo: ITodo = {
    id: '2',
    text: 'test',
    timeCreated: new Date,
    isComplete: false
  }
  service.pushTodo(todo)
  expect(service.todos[0]).toBe(todo)
})
⌄...

```
This tests should fail because there is a little mistake in our program. If you ran the tests the output of second test would insist that the todo object doesn't match expectation. In fact, the object in the store matches the one we checked in the previous test. 
To understand why did it happen, we have to know how javascript imports work and why `factory` is one of the most commonly used patterns in javascript. The reason it happens is [Module caching](https://nodejs.org/api/modules.html#modules_caching) which helps your program to prevent multiple execution when you import the same dependency into different components. Any time you import something you get the same exemplar from the cache. That's the reason vue requires you to return component's state from a factory method `data()`. For the vuex store it may not seem something important, but not until you want to build a universal/ssr application where every client app must receive its own instance of global state.
 
To fix this issue the store state should be built by a factory method. In our case, we need to add the option `stateFactory: true` to the vuex module: 

```typescript
// store/todos.ts

import {Module, VuexModule, Mutation, Action} from 'vuex-module-decorators';
import {ITodosStore, ITodo} from './types'

@Module({
  name: 'todos',
  namespaced: true,
  stateFactory: true
})
export default class extends VuexModule implements ITodosStore {
⌄...
}
```
Now the tests should pass and possible cause of bugs is resolved.


### Dependency injection
We came to the point where we have to think about communication with the server. The standard application boilerplate suggests to use [Axios](https://github.com/axios/axios) as a nuxt plugin to make requests. We're going to use axios, but not as a global plugin.

I don't like the idea of coupling such dependencies with vuex store. To understand why, imagine that you want to copy-paste our todo module into another application. Everything would be great if the new environment would use same API. But usually, this is not the case, and your only option is to dig trough the code trying to make it work with new environment. I've seen people performing such tasks with large components, and it didn't seem like something enjoyable.

To avoid such complications our module should depend on an abstract interface rather than on particular axios instance. In the other words - we should be able to configure our store to use different axios instances whenever we need to consume data from different API.


In order to make our modules configurable and abstracted from some dependencies, we use patterns that put into practice [Inversion Of Control](https://en.wikipedia.org/wiki/Inversion_of_control) technique. Such patterns are [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) or some variations of Provide/Consume (i.e. vue's provide/inject, HoC, etc).

For vue class-based components I've decided to write [class decorators](https://www.npmjs.com/package/provide-consume-decorator) which work the same way for Vue components and Vuex modules.

Install `provide-consume-decorator` library:
```bash
~$ npm install provide-consume-decorator
``` 

### Add Axios

In the `store/todos.ts`, let's add the `api` property which references an axios instance. And decorate the class with `@provideVuex`:

```typescript
// store/todos.ts
import axios, {AxiosInstance} from 'axios';
import {provideVuex, consume} from 'provide-consume-decorator';
import {Module, VuexModule, Mutation, Action} from 'vuex-module-decorators';
import {ITodosStore, ITodo} from './types'

@Module({
  name: 'todos',
  namespaced: true,
  stateFactory: true
})
@provideVuex({
  axios: ()=> axios.create()
})
export default class extends VuexModule implements ITodosStore {
  
  @consume('axios') api!: AxiosInstance;

  ⌄...
}
```

We made it possible to change component's dependencies by replacing one object. 


### Mocking server

Often, the client application development is ahead of backend. For whatever reason it happens, it is always best when your UI is ready to work with actual http requests. Axios community provides various solutions for mocking http requests so you could re-produce api endpoints locally. This is very useful, but I would suggest to use actual backend service for tests, and mocking only non-implemented methods. 

In our case, we can afford mocking entire API on the client side.

The library I found very useful is [axios-mock-adapter](https://github.com/ctimmerm/axios-mock-adapter):

```bash
~$ npm i -D axios-mock-adapter
```

Here is how I wrote a fake API with `axios-mock-adapter`:

```typescript
// __tests__/todos.api.mock.ts

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ITodo } from '../types';
const $instance = axios.create();
const mock = new MockAdapter($instance);


const todos: ITodo[] = []

/**
 * get todos
 */
mock.onGet('/todos').reply((config) => {
  return [200, JSON.stringify(todos)]
})

/**
 * create a new todo
 */
mock.onPost('/todos').reply((config) => {
  const todo: ITodo = JSON.parse(config.data);
  todo.id = Math.random().toString();
  todos.push(todo);
  return [200, todo]
})

/**
 * update todo
 */
mock.onPut(/\/todos\/\.*/).reply((config) => {
  const id = config.url!.replace('/todos/', '')
  const data = JSON.parse(config.data)
  delete data.id;
  const index = todos.map((t) => t.id).indexOf(id)
  Object.assign(todos[index], data)
  return [200, 'ok']
})

/**
 * delete todo
 */
mock.onDelete(/\/todos\/\.*/).reply((config) => {
  const id = config.url!.replace('/todos/', '')
  const index = todos.map((t) => t.id).indexOf(id)
  todos.splice(index, 1)
  return [200, 'ok']
})

export default $instance;
```

Let's put it to `__tests__/todos.api.mock.ts`.


### Testing Vuex actions

After we've got a server mock (or actual server) ready, it's time to mate it with our test environment.

In order to use different API with the test, we'll use `@provideVuex` decorator, only this time we'll supply dependencies for test environment.

Let's open `TodosStore.spec.ts` and edit our factory function as follows:

```typescript
// store/__tests__/TodosStore.spec.ts
⌃...
import { provideVuex } from 'provide-consume-decorator'
import apiMock from './todos.api.mock'

const factory = () => {

  @provideVuex({
    axios: () => apiMock
  })
  class TodosStoreMock extends TodosStore {}

  const store = new Vuex.Store({
    modules: {
      todos: TodosStoreMock
    }
  })
  return getModule(TodosStoreMock, store)
}
⌄...
``` 
We added a new class `TodosStoreMock` that extends actual `TodosStore`. Then we provided a mocked axios instance. It works the same way for any dependencies, for example you could supply another config object or a `localStorage` for your test.

Now let's implement the actions. And as usual, we'll start from writing a test:

```typescript
// store/__tests__/TodosStore.spec.ts
⌃...
it('createTodo/getTodos', async (done) => {
  const service = factory()
  await service.createTodo({
    id: '3',
    text: 'test1',
    timeCreated: new Date,
  })
  const todos = await service.getTodos()
  const todo = todos.find((e: ITodo) => e.text === 'test1')
  expect(todo).toBeInstanceOf(Object)
  expect(todo!.text).toEqual('test1')
  // getTodos should also save todos locally
  const localTodo = service.todos.find(e => e.text === 'test1')
  expect(localTodo).toBeInstanceOf(Object)
  expect(localTodo!.text).toEqual('test1')
  done()
})
⌄...
```

After the test fails, let's create actual API calls in `store/todos.ts`:

```typescript
⌃...
  /**
   * getTodos
   * @returns Promise<ITodo[]>
   */
  @Action
  async getTodos(): Promise<ITodo[]> {
    return this.api!.get('/todos').then((res) => {
      this.setTodos(res.data)
      return res.data
    })
  }

  /**
   * createTodo 
   */
  @Action
  async createTodo(todo: ITodo) {
    return this.api!.post('/todos', todo).then((res) => {
      return res.data
    })
  }

  /**
   * deleteTodo 
   */
  @Action
  async deleteTodo(todo: ITodo) {
    return this.api!.delete(`/todos/${todo.id}`)
  }

  /**
   * setTodoComplete 
   */
  @Action
  async setTodoComplete(opts: {id: string, data: any}) {
    return this.api!.put(`/todos/${opts.id}`, {...opts.data})
  }
⌄...
```

> When the tests pass, our todo store is ready! 

Consider this: We we didn't connect our store to the nuxt app but we have a strong proof that it works. This is very important when you work with a team, because the specification will also serve as an usage example for other developers.

-----------

## Writing Vue components

Again, before rushing to the code I suggest to take a break and think how we would communicate with the vuex store inside UI components.

Out of the box, Vuex suggests to access the store trough the global plugin which provides the `$store` context. But out of the common sense, I don't want our UI depending on particular vuex store implementation. To understand why, imagine that you want to use our UI components in  other application which doesn't use Vuex at all.

In order to such level of abstraction we'll make UI components depend on the interface `ITodosStore`. So if you copy-paste our UI into another vuejs app which doesn't use Vuex, you just need to supply implementation of `ITodosStore` that fits application architecture.

Here is how we achieve it:

Our parent component (index.vue) will get an instance of `ITodosStore` and supply it to the children components. There are at least two ways to make it work. First is to use vue's `Provide/Inject`. The second one is to pass dependencies using component's props. I will use the second approach because in this case it is more explicit, however vue's `Provide/Inject` might be a better way for more complex applications.


Let's create component backbones in our module directory. We need three components: `AddTodo.vue`, `TodoList.vue`, plus `index.vue` which is our parent component

#### Directory structure so far:
```
[module]
    ├──[__tests__]
    └──[components]
    |    ├── AddTodo.vue
    |    └── TodoList.vue
    ├──[store]  
    ├── index.ts
    └── index.vue     
```

------

`components/AddTodo.vue` - a children component (consumer):
```html
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

```
------
`index.vue` - the parent component (provider, assembly point):
```html
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
  }

})
export default class extends Vue {

  @consume('dataStore') ds!: TodosStore;

}
</script>

```

------

### Testing vue components

Testing vue components is similar to what did with our Vuex module. However, it requires more configuring. Because now our tests has to use mounted Vue components with connected Vuex store. 

We'll write a factory function which will return mounted component with our store module. Also, let's make our factory function reusable, because now we'll test more than one component.

Create file `__tests__/__factory.ts` with following content:
```typescript
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
```
Here we use `@vue/test-utils` to mount our component with store and requires props.

Our new factory takes a vue component, then configures vuex module and extends vue component providing required properties. As a result it returns a mounted component instance. Using factories to make code reusable is good practice in general.

#### Writing a test
Now we write a test for `AddTodo.vue`. Create `__tests__/AddTodo.spec.ts`. When I write tests, I always assume that I need to make the spec to look as much "declarative" as possible, because the other developer may need to look inside the spec. It is best when you see the component's options at the top of file.

```typescript
// __tests__/AddTodo.spec.ts
import factory from './__factory'
import TodosStore from '../store/todos'
import { getModule } from "vuex-module-decorators"

//@ts-ignore
import AddTodo from '../components/AddTodo.vue';

const createComponent = () => {
  const component = factory(AddTodo)
  //props
  const props = {
    ds: getModule(TodosStore, component.vm.$store)
  }
  //reactive data
  const data = {

  }
  //component
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
})
```
The first test checks if the component mounts correctly. In this case, we expect that our component has a property `ds` (datastore) which provides `TodosStore`. The success run of this test would ensure that vuex module initialised correctly.


Our component already has the `ds` property and our first test should pass. So let's create another test and think how our component should work.

 
### TDD and vue components

When you writing an application (not a UI kit) don't make your unit tests to depend on component's markup. Yes, vue test utils provide you with tools to test html markup, but during development, html markup updates very often and it can create a lot of routine to maintain the tests. The best way to avoid it, is to write the tests only for javascript context that isn't related to markup. Or to test markup in the way so it doesn't depend on complex css selectors. My approach to this is simple - I don't touch markup in the unit tests, because it is something that you can do much better by hand (using browser). HTML markup can be tested by `e2e` tests in the pre-release phase (if your company does it).


Back to the code. Now we need to add actual functionality to our component. This is the case, when sometimes I write a method before I write the test. Because designing component's behaviour is more convenient inside the component. So we'll return to our test when we realise how the component would work. 

Let's modify our `AddTodo.vue` component following way:
```typescript
<template>
  <div/>
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
```

This component should work as follows: The `create()` method references `this.todo` getter which returns an `ITodo` object, then it posts new todo using an action from the our vuex module. If the action successful we reset `this.text`. Later, we'll use `this.text` as a model for a text input. Of course, a real app would need more routine to make a request (loading/error states, try-catch) but in this case it would be enough.

So what we need to verify after we wrote this peace of code? Two things: 1. We need to be sure that our store changed. 2. We have to know if component's state updated.

Writing the test:
```typescript
⌃...
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
⌄...
```
In this test we get components context `wrap.vm`, then we set reactive data props, and after the request is done we check if datastore is changed and `ctx.text` reset to initial value. As usual, if the test fails we should make it pass. 

### Connecting the dots
It is time to connect our module to the nuxt application in order to proceed with UI development. 

It is simple, we need to provide our vuex module to the global store and mount our parent component somewhere.

Connecting the store module is usually as simple as importing it to the `~/store/index.ts` and adding it to the `modules` constant. But, do you remember that we don't have an actual api yet? During development it is normal to use mocked api. It would be nicer to setup configuration for development environment which would use required entities when we have `dev` environment, but in this simple case I am going to configure dev. store in place:

```typescript
⌃...
// ~/store/index.ts

import TodosStore from '~/modules/example/store/todos';

//TODO: apply only for dev environ
import {provideVuex} from 'provide-consume-decorator';
import axiosMock from '~/modules/example/store/__tests__/todos.api.mock'
@provideVuex({
  axios: ()=> axiosMock
})
class TodosStoreMock extends TodosStore {}

export const modules = {
  'todos': TodosStoreMock
}

export const modules = {
  'todos': TodosStoreMock
}
⌄...
```

For the vue components, we can mount them anyway our vue application allows it. In this case I will mount the component right to the index `/` route rewriting `~/pages/index.vue`:

```typescript
// ~/pages/index.vue

<script lang="ts">
import {
  Component,
  Vue
} from "nuxt-property-decorator"
import Todos from '~/modules/example'

@Component
export default class extends Todos {

}
</script>

``` 

#### Adding component's markup
Once the nuxt application is set and running let's see what happens if we add some markup to the `AddTodo.vue`. My makup looks as follows:
```html
<template>
  <section>
    <input type="text" v-model="text" /> 
    <button @click="create">+ add</button>
  </section>
</template>
```
Let's test it with the browser and [Vue Devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd?hl=en). 
```
~$ npm run dev
```
I don't know about you, but my component worked as expected. And usually it works at first try. Notice that it is the first time we launch the browser, a fifteen minutes would pass for me to get to this point if I din't write this post. And this is not a long time considering that at this point we've done more than `50%` of the work relying only on unit tests. And now the development process will go much faster.

### What next
We have some work left to complete this application. However any further work would be just repeating the steps I described above. So I just share the result in [this repository](#) or let you do it yourself if you managed to read whole post.

Cheers!



