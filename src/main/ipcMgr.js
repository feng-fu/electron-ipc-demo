const {
  CLIENT_NORMAL_MSG,
  CRAWLER_NORMAL_MSG,
} = require('../constants/constants')


module.exports = class Ipc {
  constructor(listener, sender) {
    this.listener = listener
    this.sender = sender
    this.addListener(CLIENT_NORMAL_MSG, this.normalHandle.bind(this))
    this.addListener(CRAWLER_NORMAL_MSG, this.normalHandle.bind(this))
  }

  normalHandle() {
    console.log('event')
  }

  addListener(chanel, cb) {
    this.listener.on(chanel, cb)
  }

  _sendMsg(chanel, msgBody) {
    this.sender.send(chanel, msgBody)
  }

  sendToClient(type, data) {
    this._sendMsg(CLIENT_NORMAL_MSG, {
      type,
      data,
    })
  }

  sendToCrawler(type, data) {
    this._sendMsg(CRAWLER_NORMAL_MSG, {
      type,
      data,
    })
  }
}


