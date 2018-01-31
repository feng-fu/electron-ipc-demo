<style scoped>
  .blod {
    font-weight: 700;
  }
  .blue {
    color: #007fff;
  }
  .small-instance {
    height: 5px;
  }
  .normal-instance {
    height: 10px;
  }

  .large-instance {
    height: 20px;
  }
</style>

<template>
  <div class="container">

    <el-menu :default-active="activeCategory" class="el-menu-demo" mode="horizontal" @select="handleSelect">
    <el-menu-item index="5562b415e4b00c57d9b94ac8">前端</el-menu-item>
    <el-menu-item index="5562b410e4b00c57d9b94a92">Android</el-menu-item>
    <el-menu-item index="5562b419e4b00c57d9b94ae2">后端</el-menu-item>
    <el-menu-item index="57be7c18128fe1005fa902de">人工智能</el-menu-item>
    <el-menu-item index="5562b405e4b00c57d9b94a41">iOS</el-menu-item>
    <el-menu-item index="5562b422e4b00c57d9b94b53">工具资源</el-menu-item>
    <el-menu-item index="5562b428e4b00c57d9b94b9d">阅读</el-menu-item>
  </el-menu>
  <div class="large-instance"></div>
  <el-row>
    <div v-for="o in list" :key="o.objectId" @click="openUrl(o.originalUrl)">
    <el-card class="box-card" >
        <div slot="header" class="clearfix">
          {{o.tags.map(v => v.title).join(' /')}}&nbsp;&nbsp;
          <i class="el-icon-time"></i>
          {{o.createdAt | _formatTime}}&nbsp;&nbsp;&nbsp;
          <i class="el-icon-edit"></i>
          {{o.user.username}}
        </div>
      <div class="text blod">
        {{ o.title }} <br />
        <div class="normal-instance"></div>
        <i class="el-icon-view blue"></i>{{o.viewsCount}}&nbsp;&nbsp;
        <i class="el-icon-star-on blue"></i> {{o.collectionCount}}&nbsp;&nbsp;
        <i class="el-icon-tickets blue"></i> {{o.commentsCount}}
      </div>
    </el-card>
    <div class="normal-instance"></div>
    </div>
  </el-row>
  </div>
</template>


<script>
  import axios from 'axios'
  import moment from 'moment'
  export default {
    data() {
      return {
        activeCategory: '5562b415e4b00c57d9b94ac8',
        list: []
      };
    },
    filters: {
      _formatTime(val) {
        return moment(val).fromNow();
      }
    },
    mounted() {
      this.getData()
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath)
        this.activeCategory = key
        this.getData()
      },
      getData() {
        axios.get(`https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&limit=20&category=${this.activeCategory}`)
          .then(r => {
            if(r.status === 200) {
              this.list = r.data.d.entrylist
            }
          })
          .catch(e => {
            console.log(e)
          })
      },
      openUrl(url) {
        window.open(url)
      },
    }
  }
</script>
