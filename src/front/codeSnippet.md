
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
