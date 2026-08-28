
# 前端代码片段

这里不放完整项目，只收一些短小、独立、复制后稍作调整就能用的前端代码。

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

购物车通常要显示每件商品的小计，也就是 `单价 × 数量`。如果直接在模板里调用普通函数，组件每次更新都会重算所有商品，即使价格和数量根本没变。
<br/>
这里希望某件商品的 `price` 和 `num` 没有变化时，继续复用上一次结果。

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

## 防抖 Debounce

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

## 节流 Throttle

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

## 手写 `bind`

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

## 手写 `Promise.all`

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
---

## View Transitions API 圆形扩散主题切换

仿哔哩哔哩客户端的主题切换效果——切暗色时圆形扩散，切亮色时圆形收回。详细实现请看 [完整文章](/front/view-transition-theme)。
