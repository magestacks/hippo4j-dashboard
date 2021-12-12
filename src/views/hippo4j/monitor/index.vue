<template>
  <div class="dashboard-editor-container" v-if='show'>
    <div class="filter-container">
      <el-select v-model="listQuery.tenantId" placeholder="租户ID" style="width:220px" class="filter-item"
                 @change="tenantSelectList()">
        <el-option v-for="item in tenantOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-select v-model="listQuery.itemId" placeholder="项目ID" style="width:220px" class="filter-item"
                 @change="itemSelectList()">
        <el-option v-for="item in itemOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-select v-model="listQuery.tpId" placeholder="线程池ID" style="width:220px" class="filter-item">
        <el-option v-for="item in threadPoolOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
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

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item :label="线程池名称" label-width="200px">
              <span>111111</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart/>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}"
              style="padding-right:8px;margin-bottom:30px;">
        <transaction-table/>
      </el-col>

    </el-row>
  </div>
</template>

<script>
  import LineChart from './components/LineChart'
  import RaddarChart from '../../dashboard/admin/components/RaddarChart'
  import PieChart from '../../dashboard/admin/components/PieChart'
  import BarChart from '../../dashboard/admin/components/BarChart'
  import TransactionTable from '../../dashboard/admin/components/TransactionTable'
  import * as dashborad from '@/api/dashborad'

  import * as itemApi from '@/api/hippo4j-item'
  import * as tenantApi from '@/api/hippo4j-tenant'
  import * as threadPoolApi from '@/api/hippo4j-threadPool'

  const lineChartData = {
    chartInfo: {
      failData: [1, 3, 4, 5, 3, 2],
      successData: [1, 2, 3, 4, 1, 3],
      dayList: ['ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty']
    }
  }

  export default {
    name: 'DashboardAdmin',
    components: {
      LineChart,
      RaddarChart,
      PieChart,
      BarChart,
      TransactionTable
    },
    data() {
      return {
        lineChartData: lineChartData.chartInfo,
        countSucTotal: 0,
        countRunningTotal: 0,
        countFailTotal: 0,
        show: false,
        size: 500,

        tenantOptions: [],
        threadPoolOptions: [],
        itemOptions: [],
        listQuery: {
          current: 1,
          size: 10,
          itemId: '',
          tpId: ''
        }
      }
    },
    async created() {
      this.chartInfo()
      this.lintChart()
      this.initSelect()

    },

    methods: {
      refreshData() {
        this.listQuery.tenantId = null
        this.listQuery.itemId = null
        this.listQuery.tpId = null
      },
      handleSetLineChartData(type) {
        this.lineChartData = lineChartData[type]
      },

      chartInfo() {
        dashborad.chartInfo().then(response => {
          this.show = true
          this.countSucTotal = response.tenantCount,
            this.countRunningTotal = response.threadPoolCount,
            this.countFailTotal = response.itemCount
        })
      },

      lintChart() {
        dashborad.lineChart({}).then(response => {
          this.lineChartData.successData = response.completedTaskCounts
          this.lineChartData.failData = response.rejectCounts
        })
      },

      initSelect() {
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

      tenantSelectList() {
        this.listQuery.itemId = null
        this.listQuery.tpId = null

        this.itemOptions = []
        this.threadPoolOptions = []
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

      itemSelectList() {
        this.listQuery.tpId = null

        this.threadPoolOptions = []
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
      }
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
