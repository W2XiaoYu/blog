# Vue笔记

## vue自定义指令

### v-animate 动画指令，实现元素在视口内执行动画/也可以实现图片懒加载

```ts

import type { App } from 'vue';
// 指令
export const defineDirective = (app:App) => {
  // 元素滚动动画
  app.directive('animate', {
    mounted (el, binding) {
      const observer = new IntersectionObserver(([{ isIntersecting }]) => {
        if (isIntersecting) {
            // 在可视范围内即可取消监听
          observer.unobserve(el)
          el.classList.add('animate__animated')
          el.classList.add(binding.value)
        }
      }, {
          // 设置监控距离为 图片和可视区域交叉距离为 0.01 时加载图片
        threshold: 0.01
      })
      // 监听绑定的dom元素
      observer.observe(el)
    }
  })
  // 元素hover动画
  app.directive('hover', {
    mounted (el, binding) {
        el.onmouseover=()=>{
            el.classList.add('animate__animated')
            el.classList.add(binding.value)
        }
        el.onmouseout=()=>{
            el.classList.remove('animate__animated')
            el.classList.remove(binding.value)
        }
    }
  })
}

// 使用
 <div v-animate="'animate__fadeInUp'" />
//hover 的使用同上
```

### v-auth 鉴权指令，常用于后台管理系统按钮权限

```ts
import type { App } from 'vue';
import { useUserInfo } from '/@/stores/userInfo';
import { judementSameArr } from '/@/utils/arrayOperation';

/**
 * 用户权限指令
 * @directive 单个权限验证（v-auth="xxx"）
 * @directive 多个权限验证，满足一个则显示（v-auths="[xxx,xxx]"）
 * @directive 多个权限验证，全部满足则显示（v-auth-all="[xxx,xxx]"）
 */
export function authDirective(app: App) {
 // 单个权限验证（v-auth="xxx"）
 app.directive('auth', {
  mounted(el, binding) {
   const stores = useUserInfo();
   if (!stores.userInfos.authBtnList.some((v: string) => v === binding.value)) el.parentNode.removeChild(el);
  },
 });
 // 多个权限验证，满足一个则显示（v-auths="[xxx,xxx]"）
 app.directive('auths', {
  mounted(el, binding) {
   let flag = false;
   const stores = useUserInfo();
   stores.userInfos.authBtnList.map((val: string) => {
    binding.value.map((v: string) => {
     if (val === v) flag = true;
    });
   });
   if (!flag) el.parentNode.removeChild(el);
  },
 });
 // 多个权限验证，全部满足则显示（v-auth-all="[xxx,xxx]"）
 app.directive('auth-all', {
  mounted(el, binding) {
   const stores = useUserInfo();
   const flag = judementSameArr(binding.value, stores.userInfos.authBtnList);
   if (!flag) el.parentNode.removeChild(el);
  },
 });
}
```

待完善....

## 代码片段

### 纯前端实现版本更新提醒(Vite和Element Plus)

```ts
vite.config.ts
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const CurrentTimeVersion = new Date().getTime();//获取时间戳当版本信息
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      // 打包打包的时候执行插件
      versionUpdatePlugin({
        version: CurrentTimeVersion,
      }),
    ],
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
      "import.meta.env.VITE_APP_VERSION": CurrentTimeVersion,
    },
  };
});

```

```ts
//versionUpdatePlugin插件
import fs from "fs";
import path from "path";

interface OptionVersion {
  version: number | string;
}

interface configObj extends Object {
  build: {
    outDir: string; // 用于获取 dist 输出目录
  };
}

const writeVersion = (versionFileName: string, content: string | NodeJS.ArrayBufferView) => {
  // 使用 try-catch 来捕获文件写入错误
  try {
    fs.writeFileSync(versionFileName, content); // 使用 writeFileSync 来保证顺序执行
    console.log(`Version file written to: ${versionFileName}`);
  } catch (err) {
    console.error(`Error writing version file: ${err}`);
  }
};

export default (options: OptionVersion) => {
  let config: configObj = {
    build: {
      outDir: "dist" // 默认输出目录
    }
  };

  return {
    name: "version-update",
    configResolved(resolvedConfig: configObj) {
      // 存储最终解析的配置
      config = resolvedConfig;
    },
    async closeBundle() {
      try {
        // 打包完成后执行
        const distDir = path.resolve(config.build.outDir); // 获取 dist 目录的路径
        console.log(`打包完成.写入 version.json 到目录: ${distDir}`);

        // 生成 version.json 文件路径
        const file = path.join(distDir, "version.json");

        // 这里使用传入的版本信息
        const content = JSON.stringify({ version: options.version });



        // 写入 version.json 文件
        writeVersion(file, content);
        console.log(`版本信息写入成功: ${file}`);
      } catch (err) {
        // 捕获并记录错误
        console.error(`写入错误: ${err}`);
      }
    }
  };
};
```

```ts
//使用webWorker去读取Version.json中的版本信息和环境变量中的版本信息做对比
//version-check.worker.ts
import axios from 'axios';

//读取前端项目根目录下的version.json文件，如果读取失败，请检查并设置可读权限
self.onmessage = async (e) => {
  if (e.data.type === 'checkVersion') {
    try {
      // 请求版本信息
      const response = await axios.get('/version.json?t=' + new Date().getTime());
      const currentVersion = e.data.currentVersion;
      const latestVersion = response.data.version;
      postMessage({
        type: 'versionChecked',
        currentVersion,
        latestVersion,
      });
    } catch (error) {
      console.log(error);
      postMessage({
        type: 'error',
        message: '版本检查失败，请稍后重试。',
      });
    }
  }
};


```

```ts
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus';
import { Action } from 'element-plus';

let worker: Worker | null = null;
let checkInterval: NodeJS.Timeout | null = null;

// 创建版本检查的 Worker
const createVersionCheckWorker = (): Worker => {
  if (!worker) {
    worker = new Worker(new URL('./version-check.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = handleWorkerMessage;
    worker.onerror = handleWorkerError;
  }
  return worker;
};

// 处理 Worker 返回的消息
const handleWorkerMessage = (event: MessageEvent) => {
  const data = event.data;
  const currentVersion = import.meta.env.VITE_APP_VERSION;

  if (data.type === 'versionChecked') {
    console.log('当前版本:', currentVersion);
    console.log('最新版本:', data.latestVersion);

    if (currentVersion !== data.latestVersion) {
      stopVersionCheck(); // 发现新版本，停止定时检查
      promptForUpdate();
    }
  } else if (data.type === 'error') {
    ElMessage.error(data.message);
  }
};

// 处理 Worker 错误
const handleWorkerError = (error: ErrorEvent) => {
  console.log(error);

  // ElMessage.error(`Worker Error: ${error.message}`);
};

// 停止版本检查
export const stopVersionCheck = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  if (worker) {
    worker.terminate(); // 结束 Worker，释放资源
    worker = null;
  }
};

// 提示用户更新应用
const promptForUpdate = () => {
  ElMessageBox.alert('检测到新版本，更新之后将能体验到更多好用的功能，点击确定开始更新', '版本更新提示', {
    confirmButtonText: '确定',
    showClose: false,
    callback: async (action: Action) => {
      const loading = ElLoading.service({
        lock: true,
        text: '更新中',
        background: 'rgba(0, 0, 0, 0.7)',
      });

      try {
        await updateApplication();
      } finally {
        loading.close();
      }
    },
  });
};

// 模拟更新应用的过程
const updateApplication = (): Promise<void> => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      window.location.reload(); // 更新后重载页面
      clearTimeout(timer);
      resolve();
    }, 1000); // 1秒后重载
  });
};

// 启动版本检查
export const versionCheck = async () => {
  const currentVersion = import.meta.env.VITE_APP_VERSION;

  const versionWorker = createVersionCheckWorker();
  versionWorker.postMessage({
    type: 'checkVersion',
    currentVersion,
  });

  checkInterval = setInterval(() => {
    versionWorker.postMessage({
      type: 'checkVersion',
      currentVersion,
    });
  }, import.meta.env.VITE_APP_CHECK_VERSION_INTERVAL || 60000); // 每分钟检查一次版本
};


```

```ts
//使用 
//我是在layout的main.vue中使用的。
onMounted(() => {
  if (process.env.NODE_ENV !== 'development') {
    versionCheck()
  }
})
onBeforeUnmount(() => {
  stopVersionCheck()
})
```

### 仿Element Plus主题切换

```css
//index.css 
:root {
    /* 亮色模式下的背景色 */
    --bg-color: #fff;
    background-color: var(--bg-color);

}
:root.dark {
    /* 暗色模式下的背景色 */
    --bg-color: #000;

}
::view-transition-new(root),
::view-transition-old(root) {
    /* 关闭默认动画，否则影响自定义动画的执行 */
    animation: none;
}


```

```ts
const handleChangeTheme = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!document.startViewTransition) {//有的浏览器不支持这个api ->火狐浏览器
        toggleDarkMode();
        document.documentElement.classList.toggle('dark');
        return;
    }
    // 获取到 transition API 实例
    const transition = document.startViewTransition(() => {
        toggleDarkMode();
        document.documentElement.classList.toggle('dark');
    });
    // 在 transition.ready 的 Promise 完成后，执行自定义动画
    transition.ready.then(() => {
        // 由于我们要从鼠标点击的位置开始做动画，所以我们需要先获取到鼠标的位置
        const { clientX, clientY } = e;

        // 计算半径，以鼠标点击的位置为圆心，到四个角的距离中最大的那个作为半径
        const radius = Math.hypot(
            Math.max(clientX, innerWidth - clientX),
            Math.max(clientY, innerHeight - clientY)
        );

        // 自定义动画
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0% at ${clientX}px ${clientY}px)`,
                    `circle(${radius}px at ${clientX}px ${clientY}px)`,
                ],
            },
            {
                duration: 500,
                pseudoElement: '::view-transition-new(root)',
            }
        );
    });
};

```

## UNI-APP APP端跳转微信打开获客链接

```js
const encodedUrl = encodeURIComponent(
     res.data.customer_link);
    const schemeUrl = `weixin://biz/ww/profile/${encodedUrl}`;
    plus.runtime.openURL(schemeUrl)

manifest.json 中配置
  "android": {
    "schemes": ["weixin"],
```
## uniapp APP打包后 启动很慢的问题
场景： App打包后安装使用，杀死后台后点击图标再次启动，会卡在启动界面很久，时间甚至达到了八九秒。
解决方法：
```ts
//manifest.json 中配置
"app-plus" : {
    "usingComponents" : true,
    "nvueStyleCompiler" : "uni-app",
    "compilerVersion" : 3,
    "splashscreen" : {
        "alwaysShowBeforeRender" : true,
        "waiting" : false,
        "autoclose" : false,
        "delay" : 0
    },
}
//App.vue
onLaunch: function() {
  console.log('App Launch')
  setTimeout(() => {
    plus.navigator.closeSplashscreen();
  }, 100)
},

```