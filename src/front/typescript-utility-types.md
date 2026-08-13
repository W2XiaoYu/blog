---
layout: doc
title: TypeScript Utility Types（工具类型）
---

# TypeScript Utility Types（工具类型）

Utility Types 是 TypeScript 提供的一组泛型工具，用来基于已有类型快速生成新类型。它们特别适合处理接口复用、表单状态、API 请求参数和响应数据。

下面的示例以 TypeScript 5.x 为准。内置工具类型可以直接使用，不需要额外导入。

## 示例类型

```ts
interface User {
  id: number
  name: string
  email: string
  age?: number
  readonly createdAt: Date
}

type UserKey = keyof User // "id" | "name" | "email" | "age" | "createdAt"
```

## 属性修饰工具

### `Partial<T>`

把 `T` 的所有属性变成可选，常用于更新接口或表单草稿。

```ts
type UpdateUser = Partial<User>

const patch: UpdateUser = { name: '小明' }
```

### `Required<T>`

把 `T` 的所有属性变成必填，包括原本带 `?` 的属性。

```ts
type CompleteUser = Required<User>
// age 也必须存在
```

### `Readonly<T>`

把 `T` 的所有属性变成只读，适合描述不可变配置或快照。

```ts
type UserSnapshot = Readonly<User>
// snapshot.name = '新名字' // 报错
```

### `Pick<T, K>` / `Omit<T, K>`

`Pick` 保留指定属性，`Omit` 排除指定属性。

```ts
type UserPreview = Pick<User, 'id' | 'name'>
type UserWithoutId = Omit<User, 'id' | 'createdAt'>
```

### `Record<K, T>`

创建一个键为 `K`、值为 `T` 的对象类型。

```ts
type Status = 'idle' | 'loading' | 'success' | 'error'
type StatusText = Record<Status, string>

const statusText: StatusText = {
  idle: '未开始',
  loading: '加载中',
  success: '成功',
  error: '失败',
}
```

## 联合类型工具

### `Exclude<T, U>` / `Extract<T, U>`

`Exclude` 从 `T` 中排除可以赋值给 `U` 的成员；`Extract` 只保留可以赋值给 `U` 的成员。

```ts
type AllStatus = 'idle' | 'loading' | 'success' | 'error'
type FinishedStatus = Exclude<AllStatus, 'idle' | 'loading'>
// "success" | "error"

type StringStatus = Extract<AllStatus, string>
// "idle" | "loading" | "success" | "error"
```

### `NonNullable<T>`

排除 `null` 和 `undefined`。

```ts
type MaybeUser = User | null | undefined
type ExistingUser = NonNullable<MaybeUser> // User
```

## 函数与构造函数工具

### `Parameters<T>` / `ConstructorParameters<T>`

提取函数参数元组，或提取构造函数参数元组。

```ts
function createUser(name: string, age?: number) {
  return { name, age }
}

type CreateUserArgs = Parameters<typeof createUser>
// [name: string, age?: number | undefined]

class ApiClient {
  constructor(public baseURL: string, public timeout = 5000) {}
}
type ApiClientArgs = ConstructorParameters<typeof ApiClient>
// [baseURL: string, timeout?: number]
```

### `ReturnType<T>` / `InstanceType<T>`

`ReturnType` 获取函数返回值类型；`InstanceType` 获取构造函数实例类型。

```ts
type CreatedUser = ReturnType<typeof createUser>
type Client = InstanceType<typeof ApiClient>
```

### `ThisParameterType<T>` / `OmitThisParameter<T>`

获取函数显式声明的 `this` 类型，或移除函数的 `this` 参数。

```ts
function format(this: User, prefix: string) {
  return `${prefix}${this.name}`
}

type FormatThis = ThisParameterType<typeof format> // User
type FormatWithoutThis = OmitThisParameter<typeof format>
```

### `ThisType<T>`

用于对象字面量的上下文类型标记，常见于实现带 `data` 和 `methods` 的对象模型。

```ts
type Model<D, M> = {
  data: D
  methods: M & ThisType<D & M>
}
```

### `NoInfer<T>`

阻止某个位置参与类型推断，让类型由其他参数决定，适合约束默认值或回退值。

```ts
function choose<C extends string>(
  values: C[],
  defaultValue?: NoInfer<C>,
) {
  return defaultValue ?? values[0]
}

choose(['small', 'large'], 'small')
// choose(['small', 'large'], 'medium') // 报错
```

## 异步工具

### `Awaited<T>`

递归获取 `Promise` 最终解析值类型，也能处理 thenable。

```ts
type UserResponse = Awaited<Promise<User>> // User
type NestedResponse = Awaited<Promise<Promise<User>>> // User
type ListResponse = Awaited<ReturnType<typeof fetchUsers>>

declare function fetchUsers(): Promise<User[]>
```

## 字符串字面量工具

这四个工具只作用于字符串字面量类型：`Uppercase`、`Lowercase`、`Capitalize`、`Uncapitalize`。

```ts
type Method = 'get' | 'post'
type HttpMethod = Uppercase<Method> // "GET" | "POST"
type EventName = Capitalize<'click'> // "Click"
type FieldName = Uncapitalize<'Name'> // "name"
type LowerMethod = Lowercase<'GET'> // "get"
```

## 常用自定义工具类型

内置工具类型主要处理一层结构。下面这些类型适合在业务项目中补充使用。

```ts
// 递归可选：适合深层配置的局部覆盖
type DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T

// 递归只读：适合不可变状态和配置
type DeepReadonly<T> = T extends Function
  ? T
  : T extends Array<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T

// 递归必填
type DeepRequired<T> = T extends object
  ? { [K in keyof T]-?: DeepRequired<T[K]> }
  : T

// 去除 readonly
type Mutable<T> = { -readonly [K in keyof T]: T[K] }

// 所有属性都允许为 null
type Nullable<T> = { [K in keyof T]: T[K] | null }

// 获取对象值的联合类型
type ValueOf<T> = T[keyof T]

// 获取数组元素类型
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never

// 获取 Promise 的解析值类型
type PromiseValue<T> = T extends Promise<infer U> ? PromiseValue<U> : T

// 把联合类型转换成交叉类型
type UnionToIntersection<T> = (
  T extends unknown ? (value: T) => void : never
) extends (value: infer I) => void
  ? I
  : never

// 展开交叉类型，改善编辑器中的类型提示
type Prettify<T> = { [K in keyof T]: T[K] } & {}

// 合并两个对象，右侧类型覆盖同名属性
type Merge<A, B> = Prettify<Omit<A, keyof B> & B>

// 只保留可选属性
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

// 只保留必填属性
type RequiredKeys<T> = Exclude<keyof T, OptionalKeys<T>>
```

## 常见组合场景

### 从接口生成列表项和详情类型

```ts
interface Article {
  id: number
  title: string
  content: string
  author: User
  createdAt: Date
}

type ArticleListItem = Pick<Article, 'id' | 'title' | 'author'>
type ArticleDetail = Readonly<Article>
type CreateArticleInput = Omit<Article, 'id' | 'createdAt'>
type UpdateArticleInput = Partial<CreateArticleInput>
```

### 根据函数自动复用请求类型

```ts
async function getArticle(id: number) {
  return { id, title: 'TypeScript', content: '...' }
}

type ArticleResult = Awaited<ReturnType<typeof getArticle>>
type GetArticleArgs = Parameters<typeof getArticle>
```

## 使用建议

- 优先使用内置工具类型，团队成员更容易理解，也能减少重复定义。
- `DeepPartial`、`DeepReadonly` 等递归类型不要无节制使用；复杂联合类型可能增加类型检查时间。
- `any` 会削弱工具类型的约束效果，公共 API 尽量使用 `unknown`，再通过类型守卫缩小范围。
- 类型只在编译期存在，运行时仍然需要对接口返回值、用户输入等外部数据进行校验。
