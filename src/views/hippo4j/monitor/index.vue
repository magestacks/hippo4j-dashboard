<template>
  <div class="dashboard-editor-container" v-if='show'>
    <div class="filter-container">
      <el-select v-model="listQuery.tenantId" placeholder="租户ID" style="width:220px" class="filter-item"
        @change="tenantSelectList()">
        <el-option v-for="item in tenantOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.itemId" placeholder="项目ID" style="width:220px" class="filter-item"
        @change="itemSelectList()">
        <el-option v-for="item in itemOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.tpId" placeholder="线程池ID" style="width:220px" class="filter-item"
        @change="threadPoolSelectList()">
        <el-option v-for="item in threadPoolOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.identify" placeholder="IP : Port" style="width:220px" class="filter-item">
        <el-option v-for="item in identifyOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>

      <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px;" icon="el-icon-search"
        @click="fetchData">
        搜索
      </el-button>
      <!--<el-button v-waves class="filter-item" type="primary" style="margin-left: 10px;" icon="el-icon-refresh"
                 @click="refreshData">
        重置
      </el-button>-->
    </div>

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;padding-left:32px">
      <el-col :span="12">
        <el-form label-position="left" style="customStyle">
          <el-form-item label="租户ID" label-width="200px">
            <span>{{ temp.tenantId }}</span>
          </el-form-item>
          <el-form-item label="项目ID" label-width="200px">
            <span>{{ temp.itemId }}</span>
          </el-form-item>

          <el-form-item label="线程池ID" label-width="200px">
            <span>{{ temp.tpId }}</span>
          </el-form-item>

          <el-form-item label="实例ID" label-width="200px">
            <span>{{ fromIdentify }}</span>
          </el-form-item>
          <el-form-item label="是否报警" label-width="200px">
            <span>{{ temp.isAlarm | alarmFilter}}</span>
          </el-form-item>

        </el-form>
      </el-col>
      <el-col :span="12">
        <el-form label-position="left" style="customStyle">
          <el-form-item label="核心线程" label-width="200px">
            <span>{{ temp.coreSize }}</span>
          </el-form-item>
          <el-form-item label="最大线程" label-width="200px">
            <span>{{ temp.maxSize }}</span>
          </el-form-item>

          <el-form-item label="队列类型" label-width="200px">
            <span>{{ temp.queueType | queueFilter }}</span>
          </el-form-item>

          <el-form-item label="队列容量" label-width="200px">
            <span>{{ temp.capacity }}</span>
          </el-form-item>
          <el-form-item label="拒绝策略" label-width="200px">
            <span>{{ temp.rejectedType | rejectedFilter}}</span>
          </el-form-item>
        </el-form>
      </el-col>

    </el-row>

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData.chartInfo" />
    </el-row>

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart-two :chart-data="lineChartData.chartInfo" />
    </el-row>

  </div>
</template>

<script>
import LineChart from './components/LineChart'
import LineChartTwo from './components/LineChartTwo'
import * as dashborad from '@/api/dashborad'

import * as itemApi from '@/api/hippo4j-item'
import * as tenantApi from '@/api/hippo4j-tenant'
import * as threadPoolApi from '@/api/hippo4j-threadPool'
import * as instanceApi from '@/api/hippo4j-instance'
import * as monitorApi from '@/api/hippo4j-monitor'

// const lineChartData = {
//   chartInfo: {
//     poolSizeList: [],
//     activeSizeList: [],
//     queueSizeList: [],
//     completedTaskCountList: [],
//     rejectCountList: [],
//     dayList: [],
//     queueRemainingCapacityList: [],
//     currentLoadList: []
//   }
// }

export default {
  name: 'DashboardAdmin',
  components: {
    LineChart,
    LineChartTwo
  },
  filters: {
    queueFilter (type) {
      if ('1' == type) {
        return 'ArrayBlockingQueue'
      } else if ('2' == type) {
        return 'LinkedBlockingQueue'
      } else if ('3' == type) {
        return 'LinkedBlockingDeque'
      } else if ('4' == type) {
        return 'SynchronousQueue'
      } else if ('5' == type) {
        return 'LinkedTransferQueue'
      } else if ('6' == type) {
        return 'PriorityBlockingQueue'
      } else if ('9' == type) {
        return 'ResizableLinkedBlockingQueue'
      }
    },

    rejectedFilter (type) {
      if ('1' == type) {
        return 'CallerRunsPolicy'
      } else if ('2' == type) {
        return 'AbortPolicy'
      } else if ('3' == type) {
        return 'DiscardPolicy'
      } else if ('4' == type) {
        return 'DiscardOldestPolicy'
      }
    },

    alarmFilter (type) {
      if ('0' == type) {
        return '报警'
      } else if ('1' == type) {
        return '忽略'
      }
    }
  },
  data () {
    return {
      // lineChartData: lineChartData.chartInfo,
      lineChartData: {
        chartInfo: {
          poolSizeList: [],
          activeSizeList: [],
          queueSizeList: [],
          completedTaskCountList: [],
          rejectCountList: [],
          dayList: [],
          queueRemainingCapacityList: [],
          currentLoadList: []
        }
      },
      countSucTotal: 0,
      countRunningTotal: 0,
      countFailTotal: 0,
      show: false,
      size: 500,

      tenantOptions: [],
      threadPoolOptions: [],
      itemOptions: [],
      identifyOptions: [],
      listQuery: {
        current: 1,
        size: 10,
        itemId: '',
        tpId: '',
        tenantId: '',
        identify: '',
        instanceId: ''
      },

      temp: {},
      fromIdentify: ''
    }
  },
  async created () {
    this.chartInfo()
    this.initSelect()

  },
  methods: {
    handleSetLineChartData (type) {
      this.lineChartData = lineChartData[type]
    },
    fetchData () {
      if (this.listQuery.tenantId == null || Object.keys(this.listQuery.tenantId).length == 0) {
        alert('租户ID不允许为空')
        return
      }
      if (this.listQuery.itemId == null || Object.keys(this.listQuery.itemId).length == 0) {
        alert('项目ID不允许为空')
        return
      }
      if (this.listQuery.tpId == null || Object.keys(this.listQuery.tpId).length == 0) {
        alert('线程池ID不允许为空!')
        return
      }
      if (this.listQuery.identify == null || Object.keys(this.listQuery.identify).length == 0) {
        alert('IP:PORT不允许为空!')
        return
      }

      this.listQuery.instanceId = this.listQuery.identify
      threadPoolApi.info(this.listQuery).then(response => {
        console.log(response)
        this.temp = response
        this.fromIdentify = this.listQuery.identify
      })

      this.initChart()

    },
    refreshData () {
      this.listQuery.tenantId = null
      this.listQuery.itemId = null
      this.listQuery.tpId = null
    },

    chartInfo () {
      dashborad.chartInfo().then(response => {
        this.show = true
        this.countSucTotal = response.tenantCount,
          this.countRunningTotal = response.threadPoolCount,
          this.countFailTotal = response.itemCount
      })
    },


    initSelect () {
      tenantApi.list({ 'size': this.size }).then(response => {
        const { records } = response
        for (var i = 0; i < records.length; i++) {
          this.tenantOptions.push({
            key: records[i].tenantId,
            display_name: records[i].tenantId + ' ' + records[i].tenantName
          })
        }
      })
    },

    tenantSelectList () {
      this.listQuery.itemId = null
      this.listQuery.tpId = null
      this.listQuery.identify = null

      this.itemOptions = []
      this.threadPoolOptions = []
      this.identifyOptions = []
      const tenantId = { 'tenantId': this.listQuery.tenantId, 'size': this.size }
      itemApi.list(tenantId).then(response => {
        const { records } = response
        for (var i = 0; i < records.length; i++) {
          this.itemOptions.push({
            key: records[i].itemId,
            display_name: records[i].itemId + ' ' + records[i].itemName
          })
        }
      })
    },

    itemSelectList () {
      this.listQuery.tpId = null
      this.listQuery.identify = null

      this.threadPoolOptions = []
      this.identifyOptions = []
      const itemId = { 'itemId': this.listQuery.itemId, 'size': this.size }
      threadPoolApi.list(itemId).then(response => {
        const { records } = response
        for (var i = 0; i < records.length; i++) {
          this.threadPoolOptions.push({
            key: records[i].tpId,
            display_name: records[i].tpId
          })
        }
      })
    },

    threadPoolSelectList () {
      this.listQuery.identify = null

      this.identifyOptions = []
      const listArray = [this.listQuery.itemId, this.listQuery.tpId]
      instanceApi.list(listArray).then(response => {
        const { records } = response
        for (var i = 0; i < response.length; i++) {
          this.identifyOptions.push({
            key: response[i].identify,
            display_name: response[i].clientAddress
          })
        }
      })
    },

    initChart () {
      const params = {
        "tenantId": this.listQuery.tenantId,
        "itemId": this.listQuery.itemId,
        "tpId": this.listQuery.tpId,
        "instanceId": this.listQuery.identify
      }
      monitorApi.active(this.listQuery).then(response => {
        this.lineChartData.chartInfo.dayList = response.times
        this.lineChartData.chartInfo.poolSizeList = response.poolSizeList

        this.lineChartData.chartInfo.activeSizeList = response.activeSizeList
        this.lineChartData.chartInfo.queueSizeList = response.queueSizeList
        this.lineChartData.chartInfo.completedTaskCountList = response.completedTaskCountList

        this.lineChartData.chartInfo.rejectCountList = response.rejectCountList
        this.lineChartData.chartInfo.queueRemainingCapacityList = response.queueRemainingCapacityList
        this.lineChartData.chartInfo.currentLoadList = response.currentLoadList
      })

    }
  },
  beforeDestroy () {
    this.lineChartData = {
      chartInfo: {}
    };
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
