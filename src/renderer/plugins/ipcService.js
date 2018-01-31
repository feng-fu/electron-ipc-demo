const { ipcRenderer } = require('electron')
const {
  CLIENT_NORMAL_MSG,
  CRAWLER_NORMAL_MSG,
} = require('./../../constants/constants')
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
  })
}

export default ipcService
