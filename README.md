# drawer-movie

> a desktop application use electron

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build


# lint all JS/Vue component files in `src/`
npm run lint

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[1c165f7](https://github.com/SimulatedGREG/electron-vue/tree/1c165f7c5e56edaf48be0fbb70838a1af26bb015) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).


## 使用`electron`和`vue`和`nodejs`，跑通`ipc`通信

1. 使用[electron-vue](https://github.com/SimulatedGREG/electron-vue)新建基于`vue`的`electron`环境，完成`electron`初体验
```
npm i -g vue-cli
vue init simulatedgreg/electron-vue my-project
cd my-project
npm i
npm run dev
```

2. 打通`electron`主进程与渲染进程的通信

> 定义常量作为`channel`
```javascript
  const MAIN_CHANNEL = 'MAIN_CHANNEL'
  const RENDER_CHANNEL = 'RENDER_CHANNEL'
```
> 在渲染进程中，使用`vue plugin`的形式


```javascript
  const { ipcRenderer } from 'electron'
  const callbackList = []
  const ipcService = Object.create(null) // 创建空对象
  ipcService.install = Vue => {
    Vue.prototype.$ipcRenderer = {
      send: (msgType, msgData) => {
        ipcRenderer.send(MAIN_CHANNEL, {
          type: msgType,
          data: msgData,
        })
      },
      on: (type, callback) => {
        callbackList.push({
          type,
          callback,
        })
      },
      sendSync: (type, data) => ipcRenderer.sendSync(MAIN_CHANNEL, {
        type,
        data,
      }),
      detach: (type, cb) => {
        const index = callbackList.findIndex(v => v.type === type)
        index !== -1 ? callbackList.splice(index, 1) : (cb && cb(new Error(`event type ${type} not exist!`)))
      },
    }
  }

```
