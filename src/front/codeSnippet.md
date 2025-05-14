
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
