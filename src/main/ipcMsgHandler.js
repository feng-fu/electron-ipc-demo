const { shell } = require('electron')
const axios = require('axios')



const handlerList = _ipc => ({
  ['open-shell'](event, url) {
    shell.openExternal(url)
  },
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

export default handlerList
