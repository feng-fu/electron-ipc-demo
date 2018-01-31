# juejin-preview

> a sample juejin preview application use electron

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


## 使用`electron`和`vue`，完成`ipc`通信

### 1. 使用[electron-vue](https://github.com/SimulatedGREG/electron-vue)新建基于`vue`的`electron`环境，更多配置请访问源项目
```
npm i -g vue-cli
vue init simulatedgreg/electron-vue my-project
cd my-project
npm i
npm run dev
```

### 2. 打通`electron`主进程与渲染进程的通信

> 定义常量作为`channel`，也就是事件类型名称
```javascript
const CLIENT_NORMAL_MSG = 'CLIENT_NORMAL_MSG'  // 渲染进程发出消息类型
const CRAWLER_NORMAL_MSG = 'CRAWLER_NORMAL_MSG' // 主进程发出消息类型
```

##### * 渲染进程

在渲染进程中，使用`vue plugin`的形式，具体参见`vue`官方文档[插件](https://cn.vuejs.org/v2/guide/plugins.html)

`ipcRenderer`是[eventEmitter](https://nodejs.org/api/events.html)的一个实例，在渲染进程中使用，你可以通过它来像主进程发送同步和异步消息，也可以通过它来接收来自主进程的消息

```javascript
  const { ipcRenderer } = require('electron')
  const ipcService = Object.create(null)
  const callbackCache = []

  ipcService.install = Vue => {
    Vue.prototype.$ipcRenderer = {
      send: (msgType, msgData) => {
        ipcRenderer.send(CLIENT_NORMAL_MSG, {
          type: msgType,
          data: msgData,
        })
      },
      on: (type, callback) => {
        callbackCache.push({
          type,
          callback,
        })
      }
    }
    ipcRenderer.on(CRAWLER_NORMAL_MSG, (sender, msg) => {
      callbackCache.forEach(cache => {
        if (cache.type === msg.type) {
          cache.callback && cache.callback(msg.data)
        }
      })
    }) // 监听主进程的消息
  }

  export default ipcService

```

在`vue`项目中通过`this.$ipcRenderer.on`的方式添加主进程发送消息的监听，通过`this.$ipcRenderer.send`的方式向主进程发送消息，保证发出消息均为`CLIENT_NORMAL_MSG`类型，收到消息均为`CRAWLER_NORMAL_MSG`，通过消息中的二级固定参数`type`来区分具体类型，并可以通过`detach`的方式来取消特定的类型的消息的监听


最后在`Vue`的入口文件，也就是渲染进程的入口文件使用上面定义的插件 `Vue.use(ipcService)`
*渲染进程中的配置完成*

-----

#### * 主进程

使用`class`的方式来定义，需要传入两个参数来实例化这个`class`，需要传入两个参数，`listener`为监听消息者，`sender`为发送消息者

`ipcMsgHandler`中包含了所有的`handler`，为其传入`this`以便能够在其中向渲染进程发送消息

```javascript
  import ipcMsgHandler from './ipcMsgHandler'

  export default class Ipc {
    constructor(listener, sender) {
      this.listener = listener
      this.sender = sender
      this.addListener(CLIENT_NORMAL_MSG, this.handleFn.bind(this))
      this.handlerList = ipcMsgHandler(this)
    }

    handleFn(event, data) {
      try {
        this.handlerList[data.type](event, data.data)
      } catch (error) {
        console.error('handler event error:' + error.message)
      }
    }

    addListener(chanel, cb) {
      this.listener.on(chanel, cb)
    }


    _sendMsg(chanel, msgBody) {
      this.sender.send(chanel, msgBody)
    }

    sendToClient(type, data) {
      this._sendMsg(CRAWLER_NORMAL_MSG, {
        type,
        data,
      })
    }
  }
```

初始状态下`ipcMsgHandler.js`文件

```javascript
export default _ipc => ({})
```

在主进程的入口文件(`/src/main/index.js`)中对`Ipc`这个`class`实例化，其中需要使用的`listener`为`ipcMain`，`ipcMain`和`ipcRenderer`不同，它只负责对消息的监听，不复杂发送消息，这里需要入口文件中的`mainWindow`下的`webContents`作为消息的发送者，所以需要在`mainWindow`创建成功之后再进行`Ipc`的实例化
```javascript
// ...
function createWindow() {
  mainWindow = new BrowserWindow({
    // ...
  });
  new IpcMgr(ipcMain, mainWindow.webContents)
}
```

### 3. 完成具体功能开发

#### * 引入`element-ui`，使用`babel`配置`css`按需加载，具体配置方式[element-ui官网](http://element-cn.eleme.io/#/zh-CN/component/quickstart)

#### * 分析掘金首页数据来源

掘金首页七种分类下数据均来自一个接口，`https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&limit=20&category=xxx`，通过`category`进行分类的区分

#### * 渲染进程开发

在`App.js`中，在进入页面和切换分类时向主进程发送消息

```javascript
// ...
  methods: {
    startRequest() {
      this.$ipcRenderer.send('start-request', this.activeCategory)
    },
    onRequestBack() {
      this.$ipcRenderer.on('request-back', data => {
        // todo...
      })
    },
  }
```

#### * 主进程开发

现在渲染进程中已经定义了两种消息类型`start-request`和`request-back`，`start-request`告诉主进程开始执行任务，完成后`request-back`告诉渲染进程任务完成，渲染进程收到消息后通过收到的数据来对页面进行操作。

在`ipcMsgHandler.js`中进行拓展，使用`axios`对接口内容进行抓取
```javascript
  import axios from 'axios'
  const handlerList = _ipc => ({
    ['start-request'](event, category) {
      const requestBack = data => {
        _ipc.sendToClient('request-back', data)
      }
      axios.get(`https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&limit=20&category=${category}`)
        .then(r => {
          if(r.status === 200) {
            requestBack({
              success: true,
              rows: r.data.d.entrylist
            })
          } else {
            requestBack({
              success: false,
              error: `server error code: ${r.status}`
            })
          }
        })
        .catch(e => requestBack({
          success: false,
          error: `server error code: ${e.status} msg: ${e.message}`
        }))
    }
  })
```

请求完成后，通过`requestBack`向渲染进程发送消息，渲染页面，操作样式调整，页面看起来大概是这样。

![](https://user-gold-cdn.xitu.io/2018/1/31/1614b985ed5097c5?w=616&h=459&f=png&s=25816)

#### 4. 增加链接跳转

在该项目中如果直接使用`window.open`的方式来打开的话，它会新弹出一个`electron`窗口，所有连接跳转也需要用到`ipc`的方式

在`electron`中，有一个`shell`对象，它提供一个`openExternal`的方法来在默认浏览器中打开链接

在`ipcMsgHandler.js`中新增以下内容

```javascript
  const { shell } = require('electron')
  export default _ipc => ({
    ['open-shell'](event, url) {
      shell.openExternal(url)
    },
    // ...
  })
```

现在就可以在`vue`中通过`this.$ipcRenderer.send('open-shell', url)`的方式来在默认浏览器中打开链接了

**一个通过打通`IPC`通信方式的掘金首页概览客户端就完成了，通过`npm run build`就可以对这个应用进行打包了**

PS: 其实在`electron`中是可以支持跨域访问的，只需要在创建窗口的时候加上一下配置项就行了
```javascript
webPreferences: {
  webSecurity: false,
}
```
