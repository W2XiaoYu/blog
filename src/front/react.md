# React

公司业务中技术栈主要是Vue和Flutter,一直没有机会尝试用React去写项目，React学了很久了，过段时间就会忘掉，便记录下。

## React 16.3 之前的旧版生命周期

### 挂载阶段（Mounting）

组件实例被创建并插入 DOM 中，以下是按执行顺序的主要方法：

1. componentWillMount()：在组件即将被挂载到页面的时刻执行，此时可以进行一些初始化操作，如设置 state 等，但在这个方法里进行异步操作（如 setState）可能会导致意外的渲染结果，并且在 React 17 中已被弃用。
2. render()：这是一个必需的方法，它会返回一个 React 元素，用于描述组件的 UI 结构。此方法应该是纯函数，不应该有任何副作用。  
3. componentDidMount()：组件已经被挂载到 DOM 之后执行，常用于进行网络请求、订阅事件、初始化第三方库等操作，因为此时组件已经有了真实的 DOM 节点。

### 更新阶段（Updating）

当组件的 props 或 state 发生变化时，会触发更新阶段，按执行顺序的主要方法有：  

1. componentWillReceiveProps(nextProps)：当组件接收到新的 props 时会被调用，可以在这个方法里根据新的 props 来更新 state，不过在 React 17 中已被弃用
2. shouldComponentUpdate(nextProps, nextState)：这是一个重要的性能优化方法，它会返回一个布尔值，决定组件是否需要重新渲染。默认返回 true，如果返回 false，则组件不会执行后续的更新流程。
3. componentWillUpdate(nextProps, nextState)：在组件即将更新之前调用，此时可以进行一些准备工作，但不能在此方法中调用 setState，在 React 17 中已被弃用。
4. render()：重新渲染组件，返回新的 React 元素。
5. componentDidUpdate(prevProps, prevState)：组件更新完成后调用，常用于在更新后操作 DOM 或进行网络请求。

## React 16.3 - React 17 的新版生命周期

  为了更好地支持异步渲染，React 16.3 引入了两个新的生命周期方法，同时弃用了一些旧的方法。

### 挂载阶段

1. static getDerivedStateFromProps(props, state)：这是一个静态方法，在组件实例化或接收到新的 props 时被调用，用于根据 props 来更新 state，它应该返回一个对象来更新 state，或者返回 null 表示不更新。
2. render()：同旧版。
3. componentDidMount()：同旧版。

### 更新阶段

1. static getDerivedStateFromProps(props, state)：接收到新的 props 时调用，用于更新 state。
2. shouldComponentUpdate(nextProps, nextState)：同旧版。
3. render()：同旧版。
4. getSnapshotBeforeUpdate(prevProps, prevState)：在最近一次渲染输出（提交到 DOM 节点）之前调用，它可以返回一个值，这个值会作为参数传递给 componentDidUpdate。
5. componentDidUpdate(prevProps, prevState, snapshot)：组件更新完成后调用，snapshot 是 getSnapshotBeforeUpdate 返回的值。

### 卸载阶段

1. componentWillUnmount()：同旧版。

## React 18 的生命周期变化

React 18 引入了并发模式，对部分生命周期进行了调整，主要是一些旧的生命周期方法被标记为不安全，如 componentWillMount、componentWillReceiveProps 和 componentWillUpdate 被彻底弃用。

```tsx
import React, { Component } from 'react';

class MyComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        };
    }

    static getDerivedStateFromProps(props, state) {
        // 根据 props 更新 state
        return null;
    }

    componentDidMount() {
        console.log('Component did mount');
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        // 在更新前获取一些信息
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('Component did update');
    }

    componentWillUnmount() {
        console.log('Component will unmount');
    }

    render() {
        return (
            <div>
                <p>Count: {this.state.count}</p>
                <button onClick={() => this.setState({ count: this.state.count + 1 })}>
                    Increment
                </button>
            </div>
        );
    }
}

export default MyComponent;
```

## React函数组件生命周期

在 React 函数组件中，没有像类组件那样固定的生命周期方法，但可以使用 React Hooks 来模拟实现类似的生命周期功能。下面详细介绍如何利用 Hooks 实现与类组件生命周期对应的功能：

### 挂载阶段

类组件中的 componentDidMount 方法在组件挂载到 DOM 后执行，常用于进行网络请求、订阅事件等操作。在函数组件中，可以使用 useEffect 钩子来模拟这一行为。

```tsx
import React, { useEffect } from 'react';

const MyFunctionComponent = () => {
    useEffect(() => {
        // 这里的代码会在组件挂载后执行
        console.log('组件已挂载');

        // 可以进行网络请求等操作
        // 例如：fetchData();

        // 返回一个清理函数，用于在组件卸载时执行
        return () => {
            console.log('组件即将卸载');
        };
    }, []); // 空依赖数组表示只在组件挂载和卸载时执行

    return <div>这是一个函数组件</div>;
};

export default MyFunctionComponent;
```

在上述代码中，useEffect 接收两个参数，第一个参数是一个回调函数，第二个参数是一个依赖数组。当依赖数组为空时，回调函数只会在组件挂载和卸载时执行，模拟了 componentDidMount 和 componentWillUnmount 的功能。

### 更新阶段

类组件中的 componentDidUpdate 方法在组件更新后执行，常用于在更新后操作 DOM 或进行网络请求。在函数组件中，同样可以使用 useEffect 来模拟。

```tsx
import React, { useState, useEffect } from 'react';

const MyFunctionComponent = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // 这里的代码会在组件挂载和每次更新后执行
        console.log('组件已更新，当前 count 值为：', count);

        // 可以进行一些操作，如根据 count 值更新 DOM

        return () => {
            // 清理操作，例如取消订阅等
        };
    }, [count]); // 依赖数组中包含 count，当 count 变化时，回调函数会执行

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>增加计数</button>
        </div>
    );
};

export default MyFunctionComponent;
```

在这个例子中，useEffect 的依赖数组包含了 count，当 count 的值发生变化时，回调函数会执行，模拟了 componentDidUpdate 的功能。

### 卸载阶段

类组件中的 componentWillUnmount 方法在组件卸载前执行，用于清理工作，如取消网络请求、清除定时器、取消订阅事件等。在函数组件中，useEffect 的回调函数可以返回一个清理函数，这个清理函数会在组件卸载时执行。

```tsx
import React, { useEffect } from 'react';

const MyFunctionComponent = () => {
    useEffect(() => {
        // 模拟订阅事件
        const subscription = subscribeToSomeEvent();

        return () => {
            // 组件卸载时取消订阅
            unsubscribeFromSomeEvent(subscription);
        };
    }, []); // 空依赖数组表示只在组件挂载和卸载时执行

    return <div>这是一个函数组件</div>;
};

// 模拟订阅和取消订阅函数
const subscribeToSomeEvent = () => {
    console.log('订阅事件');
    return {};
};

const unsubscribeFromSomeEvent = (subscription) => {
    console.log('取消订阅事件');
};

export default MyFunctionComponent;
```

在上述代码中，useEffect 的回调函数返回了一个清理函数，当组件卸载时，清理函数会被调用，模拟了 componentWillUnmount 的功能。
通过使用 useEffect 钩子，函数组件可以实现与类组件生命周期类似的功能，并且代码更加简洁和易于维护。

## Hook

### useState

**作用**：用于在函数组件中添加 state。在类组件里，state 是一个对象，而在函数组件中，useState 可以管理单个状态值，也可以通过多次调用管理多个状态值。

1. initialState：状态的初始值，可以是任意数据类型。
2. state：当前的状态值。
3. setState：用于更新状态的函数。调用该函数会触发组件重新渲染。

```tsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default Counter;
```

如何在setState获取最新的值

```tsx
const handleClick = () => {
  setCount((prevCount) => {
    const newCount = prevCount + 1;
    console.log('即将更新的 Count 值:', newCount);
    return newCount;
  });
};
```

### useEffect

**作用**：用于处理副作用操作，比如数据获取、订阅、手动修改 DOM 等。在类组件中，这些操作通常在 componentDidMount、componentDidUpdate 和 componentWillUnmount 生命周期方法中进行，而 useEffect 可以将它们合并到一个函数中。
**语法**：

```tsx
useEffect(() => {
  // 副作用操作
  return () => {
    // 清理函数，可选
  };
}, [dependencies]);
```

1. 第一个参数是一个回调函数，包含副作用操作。如果返回一个函数，这个函数会在组件卸载时执行，用于清理副作用，比如取消订阅。
2. 第二个参数 dependencies 是一个可选的数组，包含了依赖项。只有当依赖项发生变化时，副作用函数才会重新执行。如果省略这个数组，副作用函数会在每次组件渲染后都执行；如果传入一个空数组，副作用函数只会在组件挂载和卸载时执行。
**示例**

```tsx
import { useEffect } from 'react';

function useScrollListener(callback) {
  useEffect(() => {
    // 监听滚动事件
    window.addEventListener('scroll', callback);

    // 组件卸载时取消监听
    return () => {
      window.removeEventListener('scroll', callback);
    };
  }, [callback]); // 依赖 callback，确保 callback 变化时重新监听
}

export default useScrollListener;
```

### useContext

**作用**：用于在组件之间共享数据，避免通过 props 层层传递。useContext 接收一个 context 对象作为参数，并返回该 context 的当前值。
**语法/示例**：

```tsx
import React, { createContext, useContext } from 'react';

// 1. 创建 Context 对象
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    // 2. 使用 Provider 组件提供 Context 值
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}


function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}
function ThemedButton() {
  // 3. 使用 useContext Hook 访问 Context 值
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button style={{ background: theme === 'light' ? '#eee' : '#333', color: theme === 'light' ? '#333' : '#eee' }} onClick={toggleTheme}>
      Toggle Theme
    </button>
  );
}

export default App;
```

**注意**：当 Provider 的 value prop 发生变化时，所有使用了 useContext 的组件都会重新渲染。避免过度使用 Context，只在需要共享全局数据时使用。

### useReducer

**作用**：是 useState 的替代方案，适用于管理复杂的状态逻辑，尤其是当状态更新依赖于之前的状态时。它接收一个 reducer 函数和初始状态作为参数，并返回当前状态和一个 dispatch 函数。
**示例**：

```tsx
import React, { useReducer } from 'react';

// reducer 函数
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  // 使用 useReducer
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
    </div>
  );
}

export default Counter;
```

### useRef

**作用**：

1. 访问Dom元素或者React组件实例。

```tsx
import React, { useRef, useEffect } from 'react';

function MyInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    // 组件挂载后，使 input 元素获得焦点
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} />;
}
```

2. 存储可变值，不会触发重新渲染。

```tsx
import React, { useRef, useState, useEffect } from 'react';

function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  return <div>Count: {count}</div>;
}
```

### useMemo

**作用**：它在每次重新渲染的时候能够缓存计算的结果。
**参数**：

1. 计算函数：一个返回计算结果的函数。
2. 依赖项数组：包含计算函数依赖的所有变量。

```tsx
import React, { useMemo, useState } from 'react';

function ExpensiveCalculation({ a, b }) {
  // 模拟一个耗时的计算
  const result = useMemo(() => {
    console.log('Performing expensive calculation...');
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += a + b;
    }
    return sum;
  }, [a, b]);

  return <div>Result: {result}</div>;
}

function Example() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const [count, setCount] = useState(0);

  return (
    <div>
      <input type="number" value={a} onChange={(e) => setA(Number(e.target.value))} />
      <input type="number" value={b} onChange={(e) => setB(Number(e.target.value))} />
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
      <ExpensiveCalculation a={a} b={b} />
      <p>Count: {count}</p>
    </div>
  );
}

export default Example;
```

### useCallback

**作用**：它允许你在函数组件中缓存函数定义。这对于性能优化非常有用，特别是当函数作为 props 传递给子组件时。
**参数**：

1. 回调函数： 这是你需要缓存的函数。
2. 依赖项数组：包含计算函数依赖的所有变量。

```tsx
import React, { useState, useCallback, memo } from 'react';

// 子组件用 memo 包裹：只有 props 变化时才重新渲染
const Button = memo(function Button({ onClick, children }) {
  console.log('Button 组件渲染');
  return <button onClick={onClick}>{children}</button>;
});

function Example() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 用 useCallback 缓存函数引用，避免每次渲染都生成新函数导致 memo 失效
  const handleIncrement = useCallback(() => {
    setCount((c) => c + 1);
  }, []); // 依赖数组为空，函数引用始终不变（用了函数式更新，不依赖外部 count）

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={handleIncrement}>Increment</Button>
      <input value={text} onChange={(e) => setText(e.target.value)} />
    </div>
  );
}

export default Example;
```

::: tip 与 useMemo 的关系
`useCallback(fn, deps)` 等价于 `useMemo(() => fn, deps)`。前者缓存的是函数本身，后者缓存的是函数执行后的结果。配合子组件的 `React.memo` 使用才有意义——如果子组件没有被 `memo` 包裹，父组件每次渲染生成新函数引用并不会带来额外开销，此时用 `useCallback` 反而是负担。
:::

### useLayoutEffect

**作用**：与 `useEffect` 用法完全一致，区别在于**执行时机**。`useLayoutEffect` 会在 DOM 更新后、浏览器绘制前**同步**执行；而 `useEffect` 是在浏览器绘制后**异步**执行。

**何时用**：当你需要在读取 / 修改 DOM 布局后再让浏览器绘制时使用，例如测量元素尺寸、根据 DOM 位置动态定位 tooltip / 浮层、防止页面闪烁。否则默认用 `useEffect` 即可，避免阻塞绘制影响性能。

```tsx
import { useRef, useLayoutEffect, useState } from 'react';

function Tooltip({ content }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    // 在浏览器绘制前读取 DOM 位置，避免出现「先错位再跳正」的闪烁
    const rect = ref.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 8, left: rect.left });
  }, [content]);

  return (
    <>
      <span ref={ref}>{content}</span>
      <div style={{ position: 'fixed', top: position.top, left: position.left }}>{content}</div>
    </>
  );
}
```

### useImperativeHandle

**作用**：配合 `forwardRef` 使用，让父组件通过 ref 调用子组件**主动暴露**的方法，而不是直接拿到整个 DOM 实例。这样既能实现父子通信，又能封装内部实现细节。

```tsx
import { useRef, useImperativeHandle, forwardRef } from 'react';

// 1. 用 forwardRef 包裹子组件，接收父组件传入的 ref
const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null);

  // 2. useImperativeHandle 自定义暴露给父组件的实例值
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    clear: () => {
      if (inputRef.current) inputRef.current.value = '';
    },
  }));

  return <input ref={inputRef} />;
});

function Parent() {
  // 3. 父组件通过 ref 拿到的不是 DOM，而是 { focus, clear }
  const inputRef = useRef(null);

  return (
    <>
      <FancyInput ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
      <button onClick={() => inputRef.current?.clear()}>清空</button>
    </>
  );
}
```

### useId

**作用**：生成一个在**服务端和客户端渲染之间保持一致**的唯一 id。主要解决 SSR（服务端渲染）场景下 id 不一致导致的 hydration 不匹配问题。也可用于关联 `<label htmlFor>` 与表单控件。

::: warning 注意
`useId` 生成的 id **不应**用作列表渲染的 `key`，它只是为了 SSR 一致性而设计；列表 key 应来自业务数据的唯一标识。
:::

```tsx
import { useId } from 'react';

function FormField({ label }) {
  const id = useId(); // 同一组件多实例会得到不同 id，且 SSR/CSR 一致
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}
```

### useDeferredValue

**作用**：React 18 引入的并发特性之一。它返回一个**延迟更新**的值——当有紧急更新（如输入框输入）时，可以让耗时的渲染（如大列表过滤）先渲染旧值，等空闲再渲染新值，从而保证输入不卡顿。类似「防抖」，但底层是基于渲染优先级的，体验更顺滑。

```tsx
import { useState, useDeferredValue, useMemo } from 'react';

function Search({ items }) {
  const [query, setQuery] = useState('');
  // query 立即更新（输入框响应快），deferredQuery 延迟更新
  const deferredQuery = useDeferredValue(query);

  // 只有 deferredQuery 变化才重新过滤，过滤期间用户仍可继续输入
  const filtered = useMemo(() => {
    return items.filter((item) => item.includes(deferredQuery));
  }, [items, deferredQuery]);

  return (
    <input value={query} onChange={(e) => setQuery(e.target.value)} />
    <ul>{filtered.map((item) => <li key={item}>{item}</li>)}</ul>
  );
}
```

### useTransition

**作用**：React 18 并发特性。返回 `[isPending, startTransition]`，把一次状态更新标记为**低优先级 transition**，让 React 可以被更紧急的更新（如输入）打断。`isPending` 可用于展示加载态。

**与 useDeferredValue 的区别**：`useDeferredValue` 作用于「读取的值」（适合库 / 受控场景），`useTransition` 作用于「触发的 setState」（适合你掌控事件处理逻辑时）。

```tsx
import { useState, useTransition } from 'react';

function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  const [isPending, startTransition] = useTransition();

  function handleClick(index) {
    // tab 高亮立即更新（紧急），切 tab 内容用 transition（低优先级）
    setActive(index);
    startTransition(() => {
      setActive(index); // 这里再标记一次，让重内容渲染可被打断
    });
  }

  return (
    <>
      {tabs.map((tab, i) => (
        <button key={i} onClick={() => handleClick(i)}>{tab.title}</button>
      ))}
      {isPending ? <p>切换中…</p> : <div>{tabs[active].content}</div>}
    </>
  );
}
```

### useSyncExternalStore

**作用**：React 18 提供的用于**安全订阅外部数据源**的 Hook（如浏览器 API、第三方状态管理库）。它能正确处理并发模式下的 tearing（撕裂）问题。状态管理库（Redux、Zustand、Recoil 等）底层都基于它实现。日常业务直接订阅 `window.matchMedia`、`IntersectionObserver`、`localStorage` 等时也很有用。

```tsx
import { useSyncExternalStore } from 'react';

// 订阅系统主题色变化
function usePreferredTheme() {
  return useSyncExternalStore(
    // 1. subscribe：注册监听，返回取消监听函数
    (callback) => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    // 2. getSnapshot：返回当前快照（必须返回缓存值，引用需稳定）
    () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    // 3. getServerSnapshot：SSR 时返回的初始值
    () => 'light'
  );
}
```

### 自定义 Hook

当多个组件有相同的状态逻辑时，可以把逻辑抽成一个以 `use` 开头的函数——这就是自定义 Hook。它本质上是把多个内置 Hook 组合起来复用，而不是 React 的特殊机制。

**两条核心规则**：

1. 只能在**函数组件顶层或其他 Hook 内部**调用 Hook，不能放在条件、循环、嵌套函数里（保证 Hook 调用顺序稳定）。
2. 自定义 Hook 命名必须以 `use` 开头（如 `useDebounce`、`useLocalStorage`），否则 React 的 lint 插件无法识别它是个 Hook。

```tsx
import { useState, useEffect } from 'react';

// 一个防抖 Hook：value 变化后等待 delay 才返回最新值
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // 每次重新设置定时器前清掉旧的
  }, [value, delay]);

  return debounced;
}

// 使用
function SearchInput() {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 500); // 输入停顿 500ms 才触发请求
  // useEffect(() => fetchData(debouncedKeyword), [debouncedKeyword]);
  return <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />;
}
```

## Web 唤起 Windows 软件

在某些官网中，可以通过特定的协议（如 myapp://）来唤起 Windows 上的本地软件。这通常需要在 Windows 注册表中注册该协议，并且在 React 应用中使用 window.location.href 来触发唤起。

比如虚幻官网就提供了一个链接，可以唤起 Epic Games Launcher、还有网页上点击后一键加qq好友的链接等等都是利用这个原理实现的。

pc软件安装我用的是 Inno Setup
```pascal
; ================= 3A Launcher URL Protocol =================
Root: HKCR; Subkey: "threealuancher"; ValueType: string; ValueData: "URL:3A Launcher Protocol"; Flags: uninsdeletekey
Root: HKCR; Subkey: "threealuancher"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""
Root: HKCR; Subkey: "threealuancher\DefaultIcon"; ValueType: string; ValueData: "{app}\{#MyAppExeName},0"
Root: HKCR; Subkey: "threealuancher\shell"; Flags: uninsdeletekey
Root: HKCR; Subkey: "threealuancher\shell\open"; Flags: uninsdeletekey
Root: HKCR; Subkey: "threealuancher\shell\open\command"; ValueType: string; ValueData: """{app}\{#MyAppExeName}"" ""%1"""
```
然后在web页中使用如下代码唤起软件
```tsx
const openLocal3ALauncher = () => {
    window.location.href = 'threealuancher://open';
};
```
注意事项：协议的名字不能用数字开头，否则浏览器会认为这是一个无效的协议，导致无法唤起软件。
