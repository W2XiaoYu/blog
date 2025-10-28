
# 前端代码片段

## EventBus

```js
class EventBus{
        events=new Map()
        on(eventName,callBack){
        if(!this.events.get(eventName)){
            this.events.set(eventName,[])
        }
        this.events.get(eventName).push(callBack)
        }
        once(eventName,callBack){
        const once= (...arg)=>{
            callBack(...arg)
            this.off(eventName,once)
        }            
        this.on(eventName,once)
        }
        emit(eventName,...arg){
        const handle=this.events.get(eventName)
        if(handle){
            handle.forEach(cb=>{
                cb(...arg)
            })
        }
        }
        off(eventName,callBack){
        const handle =this.events.get(eventName)
        //查找对应事件
        if(handle){
            //找到对应事件的对应方法，取消注册
            const index=handle.findIndex(cb=>cb===callBack)
            if(index!==-1){
                handle.splice(index,1)
            }
        }
        }
        clear(eventName){
        if(this.events.has(eventName)){
            this.events.delete(eventName)
        }
        }
}
```

## Vue 计算属性传参

场景：在购物车页面，我们通常需要显示每件商品的小计（如：`单价 * 数量`）。如果使用普通的函数或者直接在模板里计算，每次组件更新时这些小计都会重新计算，即使商品数量没有变化也会重新执行，浪费性能。
<br/>
目标：当某个商品的 `price` 和 `num`没有变化时，它的小计应该缓存，不应该重新计算。

```js
const tableData = ref([
{
    product: '苹果 15',
    price: 8000,
    num: 1,
},
{
    product: '苹果 14',
    price: 7000,
    num: 1,
},
{
    product: '苹果 16',
    price: 11500,
    num: 1,
},
])
function  useComputed(fn){
    const map=new Map()//map 是缓存池，存储每个参数对应的 computed
    return function (...args){
        const key = JSON.stringify(args)//通过 JSON.stringify(args) 生成 key（注意：只有简单对象才安全，复杂结构建议使用稳定的 hash）
        if(map.has(key)){
            return map.get(key)
        }
        const result = computed(()=>{
            return fn(...args)//fn(...args) 是传入的计算函数
        })
        map.set(key,result)
        return result
    }
}


//计算函数
function totalPrice(row){
    return row.price*row.num;
}

const computedPrice=useComputed(totalPrice)

<p>小计为{{computedPrice(row).value}}</p>
```

## 防抖Debounce

```js
function debounce(fn,delay){
    let timer=null;
    return function(...args){
        clearTimeout(timer);
        timer=setTimeout(()=>{
            fn.apply(this,args)
        })
    }
}
//加入 立即执行首次
function debounce(fn,delay，immediate = true){
    let timer=null;
    return function(...args){
        if(immediate&&!timer){
            fn.apply(this,args)
        }
        clearTimeout(timer);
        timer=setTimeout(()=>{
            fn.apply(this,args)
        })
    }
}



```

## 节流Throttle

```js
function throttle(fn,delay){
    let lastTime=0;
    return function(...args){
        const now=Date.now();
         if (now - lastTime >= interval) {
            fn.apply(this, args);
            lastTime = now;
        }
    }
}
```

## 手写bind

```js
Function.prototype.MyBind=function(context){
    if(typeof this!==='function'){
        throw new Error("MyBind 必须是函数调用的")
    
    }
    let _this=this;
    let args=Array.prototype.slice.call(arguments,1)
    let emptyFunction=function () {}
    let returnFunction=function(){
        let bindArgs=Array.prototype.slice.call(argument);
        return _this.apply(this instanceof emptyFunction ? this : context, args.concat(bindArgs))
    }

}

```

## 求两数组交集（Set）

```js
function intersection(arr1,arr2){
    const set1=new Set(arr1);
    const set2=new Set(arr2);
  return [...set1].filter(item=>set2.has(item));

}
```

## 求两数组并集

```js

function union(arr1,arr2){
    return [...new Set([...arr1,...arr2])]
}

```

## 手写Promise.all

```js
//命名为myAll 避免覆盖原有的all方法
Promise.myAll=function (promises){
    //返回一个新的 Promise
    return New Promise((resolve, reject)=>{
        //开始边界处理
        if(!Array.isArray(promises)){
            return reject(new TypeError('Arguments must be an array'))
        }
        if(promises.length===0){
            return resolve([])
        }
        let result=[];
        let count=0;
        for(let i=0;i<promises.length;i++){
            const item=promises[i];
            Promise.resolve(item).then(
                (res)=>{
                    result[i]=res;
                    count++;
                    if(count===promises.length){
                        //所有都成功了就直接返回list
                        resolve(result)
                    }
                }
            ).catch(err=>{
                //只要有一个错误 就直接返回
                reject(error);
            })
        }
    })

}

```