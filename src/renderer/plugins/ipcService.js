const { ipcRenderer } = require('electron')
const {
  CLIENT_NORMAL_MSG,
  CRAWLER_NORMAL_MSG,
} = require('./../../constants/constants')
const ipcService = Object.create(null)
const callbackCache = {
  client: [],
  crawler: [],
}

const rendererFactory = (channel, platform) => ({
  send: (msgType, msgData) => {
    ipcRenderer.send(channel, {
      type: msgType,
      data: msgData,
    })
  },
  on: (type, callback) => {
    callbackCache.push({
      type,
      callback,
    })
  },
  sendSync: (type, data) => ipcRenderer.sendSync(channel, {
    type,
    data,
  }),
  detach: (type, cb) => {
    const index = callbackCache[platform].findIndex(v => v.type === type)
    index !== -1 ? callbackCache[platform].splice(index, 1) : (cb && cb(new Error(`event type ${type} not exist!`)))
  },
})

const eventHandlerContainer = platform => ((event, msg) => {
  Object.values(callbackCache[platform]).forEach((cache) => {
    if (cache.type === msg.type) {
      cache.callback && cache.callback(event, msg.data)
      console.log(`receive msg type : ${cache.type}, msg handler ${cache.callback}`)
    }
  })
})

ipcService.install = (Vue) => {
  Vue.prototype.$clientIpcRenderer = rendererFactory(CLIENT_NORMAL_MSG, 'crawler')
  Vue.prototype.$crawlerIpcRenderer = rendererFactory(CRAWLER_NORMAL_MSG, 'client')

  ipcRenderer.on(CLIENT_NORMAL_MSG, eventHandlerContainer('client'))
  ipcRenderer.on(CRAWLER_NORMAL_MSG, eventHandlerContainer('crawler'))
}

export default ipcService
