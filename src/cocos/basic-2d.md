---
layout: doc
title: Cocos Creator 3.8.x 2D 基础
---

# Cocos Creator 3.8.x 2D 基础

本文面向 Cocos Creator **3.8.x**，示例使用 TypeScript，主要介绍 2D 游戏开发中最常用的概念和 API。

> Cocos Creator 3.x 与 2.x 的 API 差异较大。阅读其它教程时，应先确认版本，避免把 `cc.Class`、`cc.loader`、`cc.systemEvent` 等旧写法带入 3.8.x 项目。

## 编辑器常用面板

- **层级管理器（Hierarchy）**：显示当前场景中的节点树。
- **场景编辑器（Scene）**：编辑节点的位置、大小、旋转和布局。
- **资源管理器（Assets）**：管理场景、脚本、图片、音频、预制体等资源。
- **属性检查器（Inspector）**：编辑节点和组件的属性。
- **控制台（Console）**：查看日志、警告和报错。

推荐先按资源用途划分目录：

```text
assets/
├─ scenes/          # 场景
├─ scripts/         # TypeScript 脚本
│  ├─ components/   # 通用组件
│  ├─ managers/     # 管理器
│  └─ data/         # 数据定义
├─ prefabs/         # 预制体
├─ textures/        # 图片和图集
├─ audio/           # 音频
└─ resources/       # 需要通过 resources 动态加载的资源
```

`resources` 中的内容会被打进构建产物，不要把所有资源都放进去。可以在编辑器中直接引用的资源，优先通过属性检查器绑定。

## 场景、节点和组件

### 场景 Scene

场景是游戏内容的容器。启动页、主菜单、关卡通常可以拆成不同场景，一个游戏至少要有一个启动场景。

### 节点 Node

节点负责组织层级和保存变换信息，本身通常不负责显示。一个角色节点可能由以下组件共同组成：

- `UITransform`：2D 节点的尺寸和锚点。
- `Sprite`：显示图片。
- 自定义脚本：处理移动、生命值和交互逻辑。
- `Collider2D`：提供 2D 碰撞范围。

常用节点操作：

```ts
import { Node, Vec3 } from 'cc'

const player = new Node('Player')

player.setPosition(new Vec3(100, 50, 0))
player.setScale(new Vec3(1.2, 1.2, 1))
player.angle = 30
player.active = true

this.node.addChild(player)

const child = this.node.getChildByName('Player')
child?.removeFromParent()
child?.destroy()
```

`removeFromParent()` 只解除父子关系，`destroy()` 才会销毁对象。销毁操作会延迟到当前帧结束时执行。

### 组件 Component

组件挂载在节点上，负责一项具体能力。自定义脚本通常继承 `Component`，并使用 `@ccclass` 注册为 Cocos 组件。

```ts
import { _decorator, Component, Label, Node } from 'cc'

const { ccclass, property } = _decorator

@ccclass('PlayerInfo')
export class PlayerInfo extends Component {
  @property
  speed = 200

  @property(Node)
  target: Node | null = null

  @property(Label)
  nameLabel: Label | null = null

  start() {
    if (this.nameLabel) {
      this.nameLabel.string = 'Player'
    }
  }
}
```

带 `@property` 的属性可以被序列化并显示在属性检查器中。节点、组件和资源类型要显式写入装饰器，例如 `@property(Node)`。

## 组件生命周期

常用生命周期的执行顺序如下：

```text
onLoad
  ↓
onEnable
  ↓
start
  ↓
update → lateUpdate（每帧执行）
  ↓
onDisable
  ↓
onDestroy
```

```ts
import { _decorator, Component } from 'cc'

const { ccclass } = _decorator

@ccclass('LifeCycleExample')
export class LifeCycleExample extends Component {
  onLoad() {
    // 初始化数据，可以访问场景中的其它节点和资源
  }

  onEnable() {
    // 注册事件；节点每次重新启用时都会执行
  }

  start() {
    // 所有组件的 onLoad 执行后再调用，适合开始游戏逻辑
  }

  update(deltaTime: number) {
    // deltaTime 是距离上一帧的秒数，移动时应乘上它
  }

  lateUpdate(deltaTime: number) {
    // 在 update 之后执行，常用于相机跟随
  }

  onDisable() {
    // 移除在 onEnable 中注册的事件
  }

  onDestroy() {
    // 最终清理
  }
}
```

不要把初始化逻辑写在组件构造函数里。组件由节点创建，应使用 `onLoad()` 或 `start()`。

## 获取节点和组件

优先在属性检查器中绑定引用，这样重命名节点或调整层级时不容易失效。

```ts
import { find, Label, Sprite } from 'cc'

const sprite = this.getComponent(Sprite)
const label = this.node.getComponentInChildren(Label)
const button = this.node.getChildByName('Button')
const score = find('Canvas/HUD/Score')
```

`find()` 会按路径查找节点，适合少量初始化代码。不要在 `update()` 中反复调用 `find()` 或 `getComponent()`，应提前缓存结果。

## 2D 节点与 UITransform

需要参与 2D/UI 渲染的节点通常放在 `Canvas` 节点下面，并使用 `UI_2D` 层。2D 节点常见组件包括：

| 组件 | 用途 |
| --- | --- |
| `UITransform` | 设置宽高、锚点，进行坐标转换和点击区域判断 |
| `Sprite` | 显示 `SpriteFrame` 图片资源 |
| `Label` | 显示文字 |
| `Button` | 按钮状态与点击事件 |
| `Widget` | 相对父节点或屏幕边缘对齐 |
| `Layout` | 自动排列多个子节点 |
| `Mask` | 裁剪子节点显示区域 |
| `Graphics` | 通过代码绘制简单 2D 图形 |

### 尺寸与锚点

节点的位置以锚点为基准。默认锚点通常是 `(0.5, 0.5)`，即节点中心。

```ts
import { UITransform } from 'cc'

const transform = this.getComponent(UITransform)

if (transform) {
  transform.setContentSize(320, 180)
  transform.setAnchorPoint(0.5, 0.5)
}
```

不要使用缩放来代替 UI 尺寸。需要改变布局尺寸时修改 `UITransform`，缩放更适合视觉动画。

### 本地坐标与世界坐标

- `node.position`：相对于父节点的本地坐标。
- `node.worldPosition`：世界坐标。
- `UITransform.convertToWorldSpaceAR()`：本地坐标转世界坐标。
- `UITransform.convertToNodeSpaceAR()`：世界坐标转节点本地坐标。

```ts
import { UITransform, Vec3 } from 'cc'

const transform = this.getComponent(UITransform)
const worldPosition = transform?.convertToWorldSpaceAR(new Vec3(0, 0, 0))

if (transform && worldPosition) {
  const localPosition = transform.convertToNodeSpaceAR(worldPosition)
  console.log(localPosition)
}
```

## Sprite 与 SpriteFrame

`Sprite` 是渲染组件，`SpriteFrame` 是它显示的图片资源。

```ts
import { _decorator, Component, Sprite, SpriteFrame } from 'cc'

const { ccclass, property } = _decorator

@ccclass('Avatar')
export class Avatar extends Component {
  @property(Sprite)
  sprite: Sprite | null = null

  @property(SpriteFrame)
  avatarFrame: SpriteFrame | null = null

  start() {
    if (this.sprite) {
      this.sprite.spriteFrame = this.avatarFrame
    }
  }
}
```

制作大量小图标或序列帧时，可以使用图集减少纹理切换；透明图片周围也应避免保留过多空白区域。

## 触摸和鼠标事件

### 节点范围内的触摸

2D 节点触摸检测依赖 `UITransform`。移动端和编辑器预览都可以使用触摸事件：

```ts
import { _decorator, Component, EventTouch, Node } from 'cc'

const { ccclass } = _decorator

@ccclass('TouchExample')
export class TouchExample extends Component {
  onEnable() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
  }

  onDisable() {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this)
  }

  private onTouchStart(event: EventTouch) {
    const position = event.getUILocation()
    console.log(position.x, position.y)
  }
}
```

事件在 `onEnable()` 注册，就应在 `onDisable()` 中成对移除，防止节点反复启用后重复监听。

### 全局键盘输入

```ts
import { input, Input, EventKeyboard, KeyCode } from 'cc'

onEnable() {
  input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
}

onDisable() {
  input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
}

private onKeyDown(event: EventKeyboard) {
  if (event.keyCode === KeyCode.SPACE) {
    console.log('jump')
  }
}
```

## 一个可用的 2D 拖拽组件

把下面的脚本挂到带有 `UITransform` 的 2D 节点上，即可拖动节点。代码会把触摸位置转换到父节点的本地坐标，避免直接混用屏幕坐标与节点坐标。

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

    const uiPosition = event.getUILocation()
    const localPosition = parentTransform.convertToNodeSpaceAR(
      new Vec3(uiPosition.x, uiPosition.y, 0),
    )

    this.node.setPosition(localPosition)
  }
}
```

## 每帧移动

移动速度通常用“像素/秒”表示，因此需要乘上 `deltaTime`，避免不同帧率下移动速度不同。

```ts
import { _decorator, Component } from 'cc'

const { ccclass, property } = _decorator

@ccclass('AutoMove')
export class AutoMove extends Component {
  @property
  speed = 200

  update(deltaTime: number) {
    const position = this.node.position
    this.node.setPosition(
      position.x + this.speed * deltaTime,
      position.y,
      position.z,
    )
  }
}
```

## Tween 缓动动画

简单的移动、缩放、旋转和透明度变化可以使用 `tween`：

```ts
import { tween, Vec3 } from 'cc'

tween(this.node)
  .to(0.3, { position: new Vec3(300, 0, 0) }, { easing: 'quadOut' })
  .by(0.15, { scale: new Vec3(0.1, 0.1, 0) })
  .by(0.15, { scale: new Vec3(-0.1, -0.1, 0) })
  .call(() => console.log('动画完成'))
  .start()
```

需要停止该节点上的全部 Tween 时：

```ts
import { Tween } from 'cc'

Tween.stopAllByTarget(this.node)
```

## 预制体 Prefab

预制体用于保存一棵可复用的节点结构，例如敌人、子弹、奖励物品和弹窗。

在编辑器中把节点从层级管理器拖到资源管理器，就可以生成 `.prefab` 文件。运行时通过 `instantiate()` 创建实例：

```ts
import { _decorator, Component, instantiate, Node, Prefab } from 'cc'

const { ccclass, property } = _decorator

@ccclass('EnemySpawner')
export class EnemySpawner extends Component {
  @property(Prefab)
  enemyPrefab: Prefab | null = null

  @property(Node)
  enemyLayer: Node | null = null

  spawn() {
    if (!this.enemyPrefab || !this.enemyLayer) return

    const enemy = instantiate(this.enemyPrefab)
    enemy.setParent(this.enemyLayer)
    enemy.setPosition(0, 0, 0)
  }
}
```

频繁创建和销毁的对象（如子弹）应配合 `NodePool` 或自己的对象池复用，减少运行时抖动。

## 动态加载资源

放在 `assets/resources/` 下的资源可以通过 `resources.load()` 加载。路径相对于 `resources` 目录，并且不能带文件扩展名。

```ts
import { resources, Sprite, SpriteFrame } from 'cc'

resources.load(
  'textures/player/spriteFrame',
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
```

加载图片的 `SpriteFrame` 子资源时，路径需要以 `/spriteFrame` 结尾。大型项目可以使用 Asset Bundle 管理分包资源。

## 2D 物理与碰撞

Cocos Creator 3.8.x 的 2D 物理与 3D 物理是两套系统，不要混用组件。

常用 2D 组件：

- `RigidBody2D`：刚体，控制质量、速度、重力和刚体类型。
- `BoxCollider2D`：矩形碰撞体。
- `CircleCollider2D`：圆形碰撞体。
- `PolygonCollider2D`：多边形碰撞体。

Builtin 2D 物理主要提供碰撞检测；需要重力、力和完整刚体模拟时使用 Box2D。Box2D 下监听碰撞前，要勾选 `RigidBody2D` 的 `Enabled Contact Listener`。

```ts
import {
  _decorator,
  Collider2D,
  Component,
  Contact2DType,
  IPhysics2DContact,
} from 'cc'

const { ccclass } = _decorator

@ccclass('HitDetector')
export class HitDetector extends Component {
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
    console.log('碰撞到：', otherCollider.node.name)
  }
}
```

## 场景切换

先在构建发布面板中加入目标场景，再通过场景名切换：

```ts
import { director } from 'cc'

director.loadScene('game')
```

需要跨场景保留的管理节点，可以使用：

```ts
import { director } from 'cc'

director.addPersistRootNode(this.node)
```

持久节点必须是场景根节点的直接子节点，并注意避免切换场景后重复创建。

## 2D 性能基础

- 不要在 `update()` 中频繁执行 `find()`、`getComponent()` 或创建临时数组。
- 大量重复创建的节点使用对象池。
- 合理使用图集，让连续渲染节点尽量使用同一纹理和材质，减少 Draw Call。
- 不需要每帧执行的逻辑，使用事件或 `schedule()` 定时执行。
- 不再使用的动态资源要结合引用计数和 Asset Manager 正确释放。
- 物理碰撞体形状越简单越好，避免滥用复杂多边形碰撞体。
- 真机性能与编辑器预览差异较大，发布前应在目标设备上测试。

## 3.8.x 与旧教程写法对照

| 旧版常见写法 | 3.8.x 推荐写法 |
| --- | --- |
| `cc.Class({...})` | TypeScript 类、`@ccclass`、`extends Component` |
| 全局 `cc.Node` | `import { Node } from 'cc'` |
| `cc.loader.loadRes()` | `resources.load()` 或 Asset Bundle |
| `cc.instantiate(prefab)` | 从 `cc` 导入 `instantiate()` |
| `node.runAction()` | `tween()` 或动画系统 |
| `cc.systemEvent` | 全局 `input` 对象 |
| 字符串 `'touch-start'` | `Node.EventType.TOUCH_START` |

## 官方资料

- [Cocos Creator 3.8 用户手册](https://docs.cocos.com/creator/3.8/manual/zh/)
- [Cocos Creator 3.8 API](https://docs.cocos.com/creator/3.8/api/zh/)
- [第一个 2D 游戏](https://docs.cocos.com/creator/3.8/manual/zh/getting-started/first-game-2d/)
- [组件生命周期](https://docs.cocos.com/creator/3.8/manual/zh/scripting/life-cycle-callbacks.html)
- [节点事件系统](https://docs.cocos.com/creator/3.8/manual/zh/engine/event/event-node.html)
- [动态加载资源](https://docs.cocos.com/creator/3.8/manual/zh/asset/dynamic-load-resources.html)
- [2D 物理系统](https://docs.cocos.com/creator/3.8/manual/zh/physics-2d/)
