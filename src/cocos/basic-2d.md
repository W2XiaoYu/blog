---
layout: doc
title: Cocos Creator 3.8.x 2D 基础
---

# Cocos Creator 3.8.x 2D 基础

这份笔记只走 Cocos Creator **3.8.x** 的 2D 主线：先认识场景、节点和组件，再慢慢接上事件、资源、动画与物理。示例统一使用 TypeScript，可以边看边放进空项目里练习。

> 看到 `cc.Class`、`cc.loader`、`cc.systemEvent`、`runAction` 时要注意：这些大多是 2.x 旧教程的写法，不要直接放进 3.8.x 项目。

## 先认识三个东西

### Scene：场景

场景就是一个游戏页面，例如：

- `menu.scene`：开始菜单。
- `game.scene`：游戏关卡。
- `result.scene`：结算页面。

### Node：节点

节点是场景里的对象，例如玩家、敌人、按钮和文字。

节点可以设置位置、旋转、缩放和显隐：

```ts
this.node.setPosition(100, 50, 0)
this.node.angle = 30
this.node.setScale(1.2, 1.2, 1)
this.node.active = false
```

### Component：组件

组件给节点增加功能：

- `Sprite`：显示图片。
- `Label`：显示文字。
- `Button`：处理按钮点击。
- `UITransform`：设置 2D 节点的宽高和锚点。
- 自己写的 `.ts` 脚本：实现游戏逻辑。

简单理解：**Node 是一个空盒子，Component 决定盒子能做什么。**

## 编辑器常用区域

| 面板 | 用途 |
| --- | --- |
| 层级管理器 | 查看当前场景的节点树 |
| 场景编辑器 | 摆放节点和调整大小 |
| 资源管理器 | 管理脚本、图片、场景、音频、预制体 |
| 属性检查器 | 修改节点和组件属性 |
| 控制台 | 查看日志和报错 |

推荐目录：

```text
assets/
├─ scenes/       # 场景
├─ scripts/      # TypeScript 脚本
├─ prefabs/      # 预制体
├─ textures/     # 图片和图集
├─ audio/        # 音频
└─ resources/    # 需要动态加载的资源
```

## 第一个组件脚本

在资源管理器中右键，选择 **Create → TypeScript → NewComponent**，创建 `Hello.ts`：

```ts
import { _decorator, Component } from 'cc'

const { ccclass, property } = _decorator

@ccclass('Hello')
export class Hello extends Component {
  @property
  message = '你好，Cocos'

  start() {
    console.log(this.message)
  }
}
```

把脚本拖到一个节点上。选中节点后，可以在属性检查器中修改 `message`。

- `@ccclass('Hello')`：把类注册成 Cocos 组件。
- `@property`：让属性可以保存并显示在属性检查器中。
- `start()`：组件第一次开始运行时调用。

## 生命周期怎么用

不需要一开始背完，先记下面几个：

| 方法 | 什么时候执行 | 常见用途 |
| --- | --- | --- |
| `onLoad()` | 节点第一次加载 | 获取组件、准备数据 |
| `onEnable()` | 节点或组件启用 | 注册事件 |
| `start()` | 所有 `onLoad` 之后 | 开始游戏逻辑 |
| `update(dt)` | 每一帧 | 移动角色 |
| `onDisable()` | 节点或组件停用 | 取消事件 |
| `onDestroy()` | 组件销毁 | 最终清理 |

```ts
onLoad() {
  console.log('加载')
}

start() {
  console.log('开始')
}

update(deltaTime: number) {
  // deltaTime 是上一帧到这一帧经过的秒数
}
```

## 案例一：点击按钮增加分数

### 场景准备

在 `Canvas` 下面创建：

```text
Canvas
├─ ScoreLabel   # Label，显示分数
└─ AddButton    # Button，点击加分
```

创建 `ScoreManager.ts`，挂到 `Canvas`：

```ts
import { _decorator, Component, Label } from 'cc'

const { ccclass, property } = _decorator

@ccclass('ScoreManager')
export class ScoreManager extends Component {
  @property(Label)
  scoreLabel: Label | null = null

  private score = 0

  start() {
    this.updateScoreText()
  }

  onAddScore() {
    this.score += 1
    this.updateScoreText()
  }

  private updateScoreText() {
    if (this.scoreLabel) {
      this.scoreLabel.string = `分数：${this.score}`
    }
  }
}
```

### 属性怎么连接

1. 把 `ScoreLabel` 节点拖到脚本的 `Score Label` 属性。
2. 找到 `AddButton` 的 `Button` 组件。
3. 在 `Click Events` 中添加一个事件。
4. `Target` 拖入 `Canvas`，组件选择 `ScoreManager`，方法选择 `onAddScore`。

运行后，每点一次按钮，分数加一。

## 案例二：用键盘移动角色

创建一个带 `Sprite` 的 `Player` 节点，把 `PlayerMove.ts` 挂上去：

```ts
import {
  _decorator,
  Component,
  EventKeyboard,
  input,
  Input,
  KeyCode,
  Vec3,
} from 'cc'

const { ccclass, property } = _decorator

@ccclass('PlayerMove')
export class PlayerMove extends Component {
  @property
  speed = 300

  private left = false
  private right = false
  private up = false
  private down = false

  onEnable() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
  }

  onDisable() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this)
  }

  update(deltaTime: number) {
    let x = 0
    let y = 0

    if (this.left) x -= 1
    if (this.right) x += 1
    if (this.up) y += 1
    if (this.down) y -= 1

    const direction = new Vec3(x, y, 0)
    if (direction.lengthSqr() === 0) return

    direction.normalize()

    const position = this.node.position
    this.node.setPosition(
      position.x + direction.x * this.speed * deltaTime,
      position.y + direction.y * this.speed * deltaTime,
      position.z,
    )
  }

  private onKeyDown(event: EventKeyboard) {
    this.setKeyState(event.keyCode, true)
  }

  private onKeyUp(event: EventKeyboard) {
    this.setKeyState(event.keyCode, false)
  }

  private setKeyState(keyCode: KeyCode, pressed: boolean) {
    if (keyCode === KeyCode.KEY_A) this.left = pressed
    if (keyCode === KeyCode.KEY_D) this.right = pressed
    if (keyCode === KeyCode.KEY_W) this.up = pressed
    if (keyCode === KeyCode.KEY_S) this.down = pressed
  }
}
```

这里有两个关键点：

- 移动距离乘 `deltaTime`，不同帧率下速度才基本一致。
- 斜向移动前先 `normalize()`，否则斜着走会更快。

## 案例三：拖动 2D 节点

把 `Drag2D.ts` 挂到一个有 `UITransform` 的 2D 节点上：

```ts
import {
  _decorator,
  Component,
  EventTouch,
  Node,
  UITransform,
  Vec3,
} from 'cc'

const { ccclass, requireComponent } = _decorator

@ccclass('Drag2D')
@requireComponent(UITransform)
export class Drag2D extends Component {
  onEnable() {
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
  }

  onDisable() {
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
  }

  private onTouchMove(event: EventTouch) {
    const parentTransform = this.node.parent?.getComponent(UITransform)
    if (!parentTransform) return

    const touch = event.getUILocation()
    const position = parentTransform.convertToNodeSpaceAR(
      new Vec3(touch.x, touch.y, 0),
    )

    this.node.setPosition(position)
  }
}
```

触摸位置是 UI 坐标，节点位置是父节点本地坐标，所以中间要用 `convertToNodeSpaceAR()` 转换。

## 案例四：点击角色切换图片

准备两张图片，把它们的 `SpriteFrame` 拖到脚本属性：

```ts
import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc'

const { ccclass, property } = _decorator

@ccclass('ChangeSkin')
export class ChangeSkin extends Component {
  @property(SpriteFrame)
  normalFrame: SpriteFrame | null = null

  @property(SpriteFrame)
  happyFrame: SpriteFrame | null = null

  private sprite: Sprite | null = null
  private happy = false

  onLoad() {
    this.sprite = this.getComponent(Sprite)
  }

  onEnable() {
    this.node.on(Node.EventType.TOUCH_END, this.changeSkin, this)
  }

  onDisable() {
    this.node.off(Node.EventType.TOUCH_END, this.changeSkin, this)
  }

  private changeSkin() {
    this.happy = !this.happy

    if (this.sprite) {
      this.sprite.spriteFrame = this.happy
        ? this.happyFrame
        : this.normalFrame
    }
  }
}
```

`Sprite` 是显示图片的组件，`SpriteFrame` 是具体的图片资源。

## 案例五：生成子弹预制体

先在场景中做好一个 `Bullet` 节点，再把它拖到资源管理器的 `prefabs` 文件夹中，生成 `Bullet.prefab`。

把下面脚本挂到玩家节点：

```ts
import { _decorator, Component, instantiate, Node, Prefab } from 'cc'

const { ccclass, property } = _decorator

@ccclass('Shooter')
export class Shooter extends Component {
  @property(Prefab)
  bulletPrefab: Prefab | null = null

  @property(Node)
  bulletLayer: Node | null = null

  shoot() {
    if (!this.bulletPrefab || !this.bulletLayer) return

    const bullet = instantiate(this.bulletPrefab)
    bullet.setParent(this.bulletLayer)
    bullet.setWorldPosition(this.node.worldPosition)
  }
}
```

再给子弹挂一个简单移动脚本：

```ts
import { _decorator, Component } from 'cc'

const { ccclass, property } = _decorator

@ccclass('BulletMove')
export class BulletMove extends Component {
  @property
  speed = 600

  @property
  lifeTime = 2

  update(deltaTime: number) {
    const position = this.node.position
    this.node.setPosition(
      position.x + this.speed * deltaTime,
      position.y,
      position.z,
    )

    this.lifeTime -= deltaTime
    if (this.lifeTime <= 0) {
      this.node.destroy()
    }
  }
}
```

少量子弹可以直接销毁。数量很多时，应改用 `NodePool` 或自定义对象池复用。

## 案例六：10 秒倒计时

创建一个 `Label`，把它拖到脚本的 `Time Label` 属性：

```ts
import { _decorator, Component, Label } from 'cc'

const { ccclass, property } = _decorator

@ccclass('CountDown')
export class CountDown extends Component {
  @property(Label)
  timeLabel: Label | null = null

  private remaining = 10

  start() {
    this.showTime()
    this.schedule(this.tick, 1)
  }

  private tick() {
    this.remaining -= 1
    this.showTime()

    if (this.remaining <= 0) {
      this.unschedule(this.tick)
      console.log('时间到')
    }
  }

  private showTime() {
    if (this.timeLabel) {
      this.timeLabel.string = `${this.remaining}`
    }
  }
}
```

`schedule(callback, interval)` 按秒定时执行，比自己在 `update()` 中累计时间更直白。

## 案例七：弹窗打开和关闭动画

把脚本挂到弹窗根节点：

```ts
import { _decorator, Component, tween, Tween, Vec3 } from 'cc'

const { ccclass } = _decorator

@ccclass('Popup')
export class Popup extends Component {
  open() {
    this.node.active = true
    this.node.setScale(0, 0, 1)

    tween(this.node)
      .to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
      .start()
  }

  close() {
    tween(this.node)
      .to(0.15, { scale: new Vec3(0, 0, 1) }, { easing: 'backIn' })
      .call(() => {
        this.node.active = false
      })
      .start()
  }

  onDestroy() {
    Tween.stopAllByTarget(this.node)
  }
}
```

如果弹窗一开始就是隐藏状态，控制它的脚本最好挂在外层常驻节点上，否则隐藏节点后无法直接通过按钮找到并执行它的 `open()`。

## 案例八：切换场景

先在构建发布配置中加入 `menu` 和 `game` 场景，再调用：

```ts
import { _decorator, Component, director } from 'cc'

const { ccclass } = _decorator

@ccclass('SceneButton')
export class SceneButton extends Component {
  openGame() {
    director.loadScene('game')
  }

  backMenu() {
    director.loadScene('menu')
  }
}
```

场景名不需要写 `.scene` 后缀。

## 案例九：动态加载图片

把图片放到：

```text
assets/resources/textures/avatar.png
```

代码：

```ts
import { _decorator, Component, resources, Sprite, SpriteFrame } from 'cc'

const { ccclass } = _decorator

@ccclass('LoadAvatar')
export class LoadAvatar extends Component {
  start() {
    resources.load(
      'textures/avatar/spriteFrame',
      SpriteFrame,
      (error, spriteFrame) => {
        if (error) {
          console.error(error)
          return
        }

        const sprite = this.getComponent(Sprite)
        if (sprite) {
          sprite.spriteFrame = spriteFrame
        }
      },
    )
  }
}
```

注意：

- 路径相对于 `resources` 文件夹。
- 不写 `.png` 后缀。
- 加载图片的 `SpriteFrame` 时，路径末尾加 `/spriteFrame`。
- 能直接拖到属性检查器的资源，不必全部动态加载。

## 案例十：2D 碰撞检测

给玩家添加：

- `RigidBody2D`
- `BoxCollider2D`
- 下面的 `PlayerCollision.ts`

如果项目使用 Box2D，还要勾选 `RigidBody2D` 的 **Enabled Contact Listener**。

```ts
import {
  _decorator,
  Collider2D,
  Component,
  Contact2DType,
  IPhysics2DContact,
} from 'cc'

const { ccclass } = _decorator

@ccclass('PlayerCollision')
export class PlayerCollision extends Component {
  private collider: Collider2D | null = null

  onLoad() {
    this.collider = this.getComponent(Collider2D)
  }

  onEnable() {
    this.collider?.on(
      Contact2DType.BEGIN_CONTACT,
      this.onBeginContact,
      this,
    )
  }

  onDisable() {
    this.collider?.off(
      Contact2DType.BEGIN_CONTACT,
      this.onBeginContact,
      this,
    )
  }

  private onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null,
  ) {
    console.log('碰到了：', otherCollider.node.name)

    if (otherCollider.node.name === 'Coin') {
      otherCollider.node.destroy()
    }
  }
}
```

简单小游戏只需要判断碰撞时，可以先使用 Builtin 2D；需要重力、速度、弹跳等完整刚体效果时，再使用 Box2D。

## 常用节点操作速查

```ts
import { find, Label, Sprite, Vec3 } from 'cc'

// 获取当前节点上的组件
const sprite = this.getComponent(Sprite)

// 获取子节点
const button = this.node.getChildByName('Button')

// 按路径查找
const score = find('Canvas/HUD/Score')

// 获取和修改位置
const position = this.node.position
this.node.setPosition(new Vec3(100, 50, 0))

// 获取和修改世界位置
const worldPosition = this.node.worldPosition
this.node.setWorldPosition(0, 0, 0)

// 显示和隐藏
this.node.active = true
this.node.active = false

// 获取文字并修改
const label = this.getComponent(Label)
if (label) label.string = '游戏开始'

// 销毁节点
this.node.destroy()
```

`find()` 和 `getComponent()` 不要放在 `update()` 里反复执行，通常在 `onLoad()` 中获取一次并保存。

## 常见问题

### 脚本拖不到节点上

先看控制台。只要项目里有 TypeScript 编译错误，新脚本就可能无法正常识别。还要检查 `@ccclass` 名称是否重复。

### 点节点没有触摸事件

检查：

- 节点是否有 `UITransform`。
- `UITransform` 的宽高是不是 0。
- 节点是否在 `Canvas` 下。
- 是否被上层节点挡住。
- 脚本或节点是否处于启用状态。

### 图片显示不出来

检查 `Sprite` 的 `SpriteFrame` 是否为空，节点是否启用，颜色透明度是否为 0，以及节点是不是放在 `Canvas` 下。

### 事件执行了多次

注册和取消要成对出现：

```ts
onEnable() {
  this.node.on(Node.EventType.TOUCH_END, this.onClick, this)
}

onDisable() {
  this.node.off(Node.EventType.TOUCH_END, this.onClick, this)
}
```

## 3.8.x 与旧写法对照

| 2.x 旧写法 | 3.8.x 写法 |
| --- | --- |
| `cc.Class({...})` | `@ccclass` + `class extends Component` |
| `cc.Node` | `import { Node } from 'cc'` |
| `cc.loader.loadRes()` | `resources.load()` 或 Asset Bundle |
| `cc.instantiate()` | 导入 `instantiate()` |
| `node.runAction()` | `tween()` 或动画系统 |
| `cc.systemEvent` | `input` |
| `'touch-start'` | `Node.EventType.TOUCH_START` |

## 动手练一遍

概念看完容易散，最好按这个顺序亲手串一次：

1. 点击按钮让分数增加。
2. 用 WASD 移动角色。
3. 点击金币后销毁金币并加分。
4. 用预制体生成子弹。
5. 做一个 10 秒倒计时。
6. 时间结束后打开结算弹窗。
7. 点击重新开始，重新加载当前场景。

等重新开始按钮真正把场景跑起来，Cocos Creator 2D 的基本工作方式也就连成了一条线。

## 官方资料

- [Cocos Creator 3.8 用户手册](https://docs.cocos.com/creator/3.8/manual/zh/)
- [Cocos Creator 3.8 API](https://docs.cocos.com/creator/3.8/api/zh/)
- [第一个 2D 游戏](https://docs.cocos.com/creator/3.8/manual/zh/getting-started/first-game-2d/)
- [组件生命周期](https://docs.cocos.com/creator/3.8/manual/zh/scripting/life-cycle-callbacks.html)
- [节点事件系统](https://docs.cocos.com/creator/3.8/manual/zh/engine/event/event-node.html)
- [动态加载资源](https://docs.cocos.com/creator/3.8/manual/zh/asset/dynamic-load-resources.html)
- [2D 物理系统](https://docs.cocos.com/creator/3.8/manual/zh/physics-2d/)
