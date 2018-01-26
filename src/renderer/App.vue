<template>
  <div id="app">
    <button>click handler.</button>
  </div>
</template>

<script>

  export default {
    name: 'drawer-movie',
    mounted() {
      this.onIpcMsg()
    },
    methods: {
      onIpcMsg() {
        console.log(this.$clientIpcRenderer)
        this.$clientIpcRenderer.on('hello', (event, res) => {
          console.log(event, res) /* disabled eslint line */
        })
      },
      handler(arg) {
        this.$clientIpcRenderer.send('hello', arg)
      },
    },
  };
</script>

<style>
  /* CSS */
</style>
