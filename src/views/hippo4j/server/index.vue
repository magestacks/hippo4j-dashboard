<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.tenantId"
        placeholder="租户ID"
        style="width:220px"
        class="filter-item"
        @change="tenantSelectList()"
      >
        <el-option
          v-for="item in tenantOptions"
          :key="item.key"
          :label="item.display_name"
          :value="item.key"
        />
      </el-select>
      <el-select
        v-model="listQuery.itemId"
        placeholder="项目ID"
        style="width:220px"
        class="filter-item"
        @change="itemSelectList()"
      >
        <el-option
          v-for="item in itemOptions"
          :key="item.key"
          :label="item.display_name"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="fetchData"
      >
        搜索
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column label="实例标识" align="center">
        <template slot-scope="scope">{{ scope.row.identify }}</template>
      </el-table-column>
      <el-table-column label="Active" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.active | statusFilter">
            {{ scope.row.active }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="核心线程" align="center">
        <template slot-scope="scope">{{ scope.row.coreSize }}</template>
      </el-table-column>
      <el-table-column label="最大线程" align="center">
        <template slot-scope="scope">{{ scope.row.maximumSize }}</template>
      </el-table-column>
      <el-table-column label="队列类型" align="center">
        <template slot-scope="scope">{{ scope.row.queueType }}</template>
      </el-table-column>
      <el-table-column label="队列容量" align="center">
        <template slot-scope="scope">{{ scope.row.queueCapacity }}</template>
      </el-table-column>
      <el-table-column label="拒绝策略" align="center">
        <template slot-scope="scope">{{ scope.row.rejectedName }}</template>
      </el-table-column>
      <el-table-column label="线程存活" align="center">
        <template slot-scope="scope">{{ scope.row.keepAliveTime }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="180"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              操作<i class="el-icon-arrow-down el-icon--right"/>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleInfo(row)">查看</el-dropdown-item>
              <el-dropdown-item @click.native="handleUpdate(row)">编辑</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="instanceDialogFormVisible"
      width="1000px"
    >
      <test></test>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="110px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="《负载相关》"></el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="当前负载" prop="currentLoad">
              <el-input v-model="runTimeTemp.currentLoad" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="峰值负载" prop="peakLoad">
              <el-input v-model="runTimeTemp.peakLoad" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="内存占比" prop="currentLoad">
              <el-input v-model="runTimeTemp.memoryProportion" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="剩余内存" prop="currentLoad">
              <el-input v-model="runTimeTemp.freeMemory" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="《线程相关》"></el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="核心线程">
              <el-input v-model="runTimeTemp.coreSize" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前线程" prop="poolSize">
              <el-input v-model="runTimeTemp.poolSize" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大线程" prop="maximumSize">
              <el-input v-model="runTimeTemp.maximumSize" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活跃线程" prop="activeSize">
              <el-input v-model="runTimeTemp.activeSize" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="LargestSize" prop="largestPoolSize">
              <el-input v-model="runTimeTemp.largestPoolSize" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="《队列相关》"></el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="阻塞队列">
              <el-input v-model="runTimeTemp.queueType" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="队列容量" prop="queueCapacity">
              <el-input v-model="runTimeTemp.queueCapacity" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="队列元素" prop="queueSize">
              <el-input v-model="runTimeTemp.queueSize" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="队列剩余容量" prop="queueRemainingCapacity">
              <el-input v-model="runTimeTemp.queueRemainingCapacity" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="《其它信息》"></el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最后更新时间" prop="clientLastRefreshTime">
              <el-input v-model="runTimeTemp.clientLastRefreshTime" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务总量" prop="completedTaskCount">
              <el-input v-model="runTimeTemp.completedTaskCount" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="instanceDialogFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="handleInfo()">
          刷新
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="1000px">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="110px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="核心线程" prop="coreSize">
              <el-input v-model="temp.coreSize" placeholder="核心线程"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大线程" prop="maxSize">
              <el-input v-model="temp.maximumSize" placeholder="最大线程"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <!--<el-col :span="12">
            <el-form-item label="队列容量" prop="queueCapacity">
              <el-input
                v-model="temp.queueCapacity"
                placeholder="队列容量"
              />
            </el-form-item>
          </el-col>-->
          <el-col :span="12">
            <el-form-item label="KATime/S" prop="keepAliveTime">
              <el-input
                v-model="temp.keepAliveTime"
                placeholder="Time / S"
              />
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogPluginVisible" title="Reading statistics">
      <el-table :data="pluginData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"/>
        <el-table-column prop="pv" label="Pv"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as itemApi from '@/api/hippo4j-item'
  import * as tenantApi from '@/api/hippo4j-tenant'
  import * as threadPoolApi from '@/api/hippo4j-threadPool'
  import waves from '@/directive/waves'
  import Pagination from '@/components/Pagination'
  import axios from 'axios'

  export default {
    name: 'JobProject',
    components: { Pagination },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          DEV: 'info',
          TEST: 'success',
          UAT: 'warning',
          PROD: 'danger'
        }
        return statusMap[status]
      }
    },
    data() {
      return {
        isRejectShow: false, // 是否显示spi拒绝策略
        list: null,
        listLoading: false,
        total: 0,
        listQuery: {
          current: 1,
          size: 10,
          tpId: '',
          itemId: ''
        },
        pluginTypeOptions: ['reader', 'writer'],
        dialogPluginVisible: false,
        pluginData: [],
        dialogFormVisible: false,
        runTimeTemp: {},
        tenantOptions: [],
        instanceDialogFormVisible: false,
        threadPoolOptions: [],
        itemOptions: [],
        itemTempOptions: [],
        queueTypeOptions: [
          { key: 1, display_name: 'ArrayBlockingQueue' },
          { key: 2, display_name: 'LinkedBlockingQueue' },
          { key: 3, display_name: 'LinkedBlockingDeque' },
          { key: 4, display_name: 'SynchronousQueue' },
          { key: 5, display_name: 'LinkedTransferQueue' },
          { key: 6, display_name: 'PriorityBlockingQueue' },
          { key: 9, display_name: 'ResizableLinkedBlockingQueue (支持动态修改队列大小)' }
        ],
        rejectedOptions: [
          { key: 1, display_name: 'CallerRunsPolicy' },
          { key: 2, display_name: 'AbortPolicy' },
          { key: 3, display_name: 'DiscardPolicy' },
          { key: 4, display_name: 'DiscardOldestPolicy' },
          { key: 5, display_name: 'RunsOldestTaskPolicy' },
          { key: 6, display_name: 'SyncPutQueuePolicy' },
          { key: 99, display_name: 'CustomRejectedPolicy（自定义 SPI 策略）' }
        ],
        alarmTypes: [{ key: 1, display_name: '报警' }, { key: 0, display_name: '不报警' }],
        allowCoreThreadTimeOutTypes: [
          { key: 1, display_name: '超时' },
          { key: 0, display_name: '不超时' }
        ],
        size: 500,
        dialogStatus: '',
        textMap: {
          update: 'Edit',
          create: 'Create'
        },
        rules: {},
        temp: {
          id: undefined,
          tenantId: '',
          itemId: '',
          rejectedType: null,
          customRejectedType: null
        },
        visible: true
      }
    },
    created() {
      // 初始化租户、项目
      this.initSelect()
    },
    methods: {
      onInput() {
        this.$forceUpdate()
      },
      fetchData() {
        if (this.listQuery.tenantId == null || Object.keys(this.listQuery.tenantId).length == 0) {
          alert('租户 ID 不允许为空')
          return
        }
        if (this.listQuery.itemId == null || Object.keys(this.listQuery.itemId).length == 0) {
          alert('项目 ID 不允许为空')
          return
        }
        this.listLoading = true
        threadPoolApi.listClient(this.listQuery).then(response => {
          if (response == null) {
            this.listLoading = false
          }
          const tempResp = response
          const tempList = new Array(response.length)
          for (let i = 0; i < tempResp.length; i++) {
            const tempData = {}
            const url = `http://${response[i].clientAddress}/web/base/info`
            axios
              .get(url)
              .then(res => {
                const { data } = res.data
                if (data != null) {
                  tempData.identify = tempResp[i].identify
                  tempData.active = tempResp[i].active
                  tempData.clientAddress = tempResp[i].clientAddress
                  tempData.coreSize = data.coreSize
                  tempData.maximumSize = data.maximumSize
                  tempData.queueType = data.queueType
                  tempData.queueCapacity = data.queueCapacity
                  tempData.rejectedName = data.rejectedName
                  tempData.keepAliveTime = data.keepAliveTime
                  tempList.push(tempData)
                }
              })
              .catch(error => {
                console.log(error)
                this.$message.error('查询失败，请尝试刷新页面')
              })
          }

          this.list = tempList
          this.listLoading = false
        })
      },
      changeAlarm(row) {
        threadPoolApi.alarmEnable(row).then(() => {
          this.fetchData()
          this.$notify({
            title: 'Success',
            message: 'Update Successfully',
            type: 'success',
            duration: 2000
          })
        })
      },
      initSelect() {
        tenantApi.list({ size: this.size }).then(response => {
          const { records } = response
          for (let i = 0; i < records.length; i++) {
            this.tenantOptions.push({
              key: records[i].tenantId,
              display_name: records[i].tenantId + ' ' + records[i].tenantName
            })
          }
        })
      },
      resetTemp() {
        this.isRejectShow = false
        this.temp = {
          id: undefined,
          tenantId: '',
          itemId: '',
          rejectedType: null,
          customRejectedType: null
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.isRejectShow = false
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            if (this.isRejectShow) {
              if (this.temp.customRejectedType == null) {
                this.temp.rejectedType = 2
              } else {
                this.temp.rejectedType = this.temp.customRejectedType
              }
            }
            threadPoolApi.created(this.temp).then(() => {
              this.fetchData()
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Created Successfully',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        let rejectedType = this.temp.rejectedType
        if (
          rejectedType != 1 &&
          rejectedType != 2 &&
          rejectedType != 3 &&
          rejectedType != 4 &&
          rejectedType != 5 &&
          rejectedType != 6
        ) {
          this.isRejectShow = true
          this.temp.customRejectedType = this.temp.rejectedType
          this.temp.rejectedType = 99
        } else {
          this.isRejectShow = false
        }
        this.dialogStatus = 'update'
        this.dialogFormVisible = true

        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            const tempData = {
              'coreSize': this.temp.coreSize,
              'maxSize': this.temp.maximumSize,
              'keepAliveTime': this.temp.keepAliveTime
            }
            const url = `http://${this.temp.clientAddress}/web/update/pool`
            axios
              .post(url, tempData)
              .then(res => {
                this.dialogFormVisible = false
                this.$notify({
                  title: 'Success',
                  message: 'Update Successfully',
                  type: 'success',
                  duration: 2000
                })
              })

              .catch(error => {
                console.log(error)
                this.$message.error('查询失败，请尝试刷新页面')
              })

            this.fetchData()
          }
        })
      },
      openDelConfirm(name) {
        return this.$confirm(`此操作将删除 ${name}, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      },
      selectQueueType(value) {
        if (value === 4) {
          this.temp.capacity = 0
        } else if (value === 5) {
          this.temp.capacity = 2147483647
        }
      },

      tenantSelectList() {
        this.listQuery.itemId = null
        this.listQuery.tpId = null

        this.temp.itemId = null

        this.itemOptions = []
        this.itemTempOptions = []
        this.threadPoolOptions = []
        const tenantId = { tenantId: this.listQuery.tenantId, size: this.size }
        itemApi.list(tenantId).then(response => {
          const { records } = response
          for (let i = 0; i < records.length; i++) {
            this.itemOptions.push({
              key: records[i].itemId,
              display_name: records[i].itemId + ' ' + records[i].itemName
            })
          }
        })
      },

      tenantTempSelectList() {
        this.itemTempOptions = []
        if (this.temp.itemId != null && Object.keys(this.temp.itemId).length != 0) {
          this.temp.itemId = null
        }
        const tenantId = { tenantId: this.temp.tenantId, size: this.size }
        itemApi.list(tenantId).then(response => {
          const { records } = response
          for (let i = 0; i < records.length; i++) {
            this.itemTempOptions.push({
              key: records[i].itemId,
              display_name: records[i].itemId + ' ' + records[i].itemName
            })
          }
        })
      },

      itemSelectList() {
        this.listQuery.tpId = null

        this.threadPoolOptions = []
        const itemId = { itemId: this.listQuery.itemId, size: this.size }
        threadPoolApi.list(itemId).then(response => {
          const { records } = response
          for (let i = 0; i < records.length; i++) {
            this.threadPoolOptions.push({
              key: records[i].tpId,
              display_name: records[i].tpId
            })
          }
        })
      },

      selectRejectedType(value) {
        if (value == 99) {
          this.isRejectShow = true
        } else {
          this.isRejectShow = false
        }
      },

      handleInfo(row) {
        this.instanceDialogFormVisible = true
        this.dialogStatus = 'info'

        if (typeof row == 'undefined' || row == null) {
          row = this.tempRow
        } else {
          this.tempRow = {
            clientAddress: row.clientAddress
          }
        }

        this.refresh(row)
      },

      refresh(row) {

        const clientAddress = row.clientAddress
        let httpStr = 'http://' + clientAddress + '/web/run/state'

        axios({
          method: 'get',
          changeOrigin: true,
          url: httpStr,
          headers: { 'Access-Control-Allow-Credentials': true },
          params: {}
        }).then(response => {
          this.runTimeTemp = response.data.data
        })
      }
    }
  }
</script>
