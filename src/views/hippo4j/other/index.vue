<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.mark"
        placeholder="线程池类型"
        style="width:260px"
        class="filter-item"
        @change="tenantSelectList()"
      >
        <el-option
          v-for="item in typeOptions"
          :key="item.key"
          :label="item.display_name"
          :value="item.key"
        />
      </el-select>
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
      <el-input
        v-model="listQuery.threadPoolKey"
        clearable
        placeholder="线程池标识"
        style="width: 200px;"
        class="filter-item"
      />
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
      <el-table-column label="线程池标识" align="center">
        <template slot-scope="scope">{{ scope.row.threadPoolKey }}</template>
      </el-table-column>
      <el-table-column label="核心线程" align="center">
        <template slot-scope="scope">{{ scope.row.coreSize }}</template>
      </el-table-column>
      <el-table-column label="最大线程" align="center">
        <template slot-scope="scope">{{ scope.row.maximumSize }}</template>
      </el-table-column>
      <!--<el-table-column label="队列类型" align="center">
        <template slot-scope="scope">{{ scope.row.queueType }}</template>
      </el-table-column>
      <el-table-column label="队列容量" align="center">
        <template slot-scope="scope">{{ scope.row.queueCapacity }}</template>
      </el-table-column>-->
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
              <!--<el-dropdown-item @click.native="handleInfo(row)">查看</el-dropdown-item>-->
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
          <el-col :span="12">
            <el-form-item label="全部修改" prop="allUpdate">
              <el-radio-group v-model="temp.allUpdate">
                <el-radio label="1" border>Yes</el-radio>
                <el-radio label="0" border>No</el-radio>
              </el-radio-group>
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
  import * as threadPoolAdapterApi from '@/api/hippo4j-adapterThreadPool'
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
          itemId: '',
          mark: '',
          tenantId: '',
          threadPoolKey: ''

        },
        pluginTypeOptions: ['reader', 'writer'],
        dialogPluginVisible: false,
        pluginData: [],
        dialogFormVisible: false,
        runTimeTemp: {},
        typeOptions: [
          { key: 'RocketMQSpringCloudStream', display_name: 'RocketMQSpringCloudStream' }
        ],
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
          allUpdate: '1',
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
        if (this.listQuery.mark == null || Object.keys(this.listQuery.mark).length == 0) {
          this.$message.warning('线程池类型不允许为空')
          return
        }
        if (this.listQuery.tenantId == null || Object.keys(this.listQuery.tenantId).length == 0) {
          this.$message.warning('租户 ID 不允许为空')
          return
        }
        if (this.listQuery.itemId == null || Object.keys(this.listQuery.itemId).length == 0) {
          this.$message.warning('项目 ID 不允许为空')
          return
        }
        if (this.listQuery.threadPoolKey == null || Object.keys(this.listQuery.threadPoolKey).length == 0) {
          this.$message.warning('线程池标识不允许为空')
          return
        }
        this.listLoading = true
        threadPoolAdapterApi.list(this.listQuery).then(response => {
          if (response == null) {
            this.listLoading = false
          }
          this.list = response
          this.listLoading = false
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
      updateData() {
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            const clientAddressList = []
            const tempData = {
              'mark': this.listQuery.mark,
              'tenant': this.listQuery.tenantId,
              'item': this.listQuery.itemId,
              'threadPoolKey': this.temp.threadPoolKey,
              'identify': this.temp.identify,
              'clientAddressList': clientAddressList,
              'coreSize': this.temp.coreSize,
              'maximumSize': this.temp.maximumSize
            }
            if (this.temp.allUpdate === '0' || this.temp.allUpdate == undefined || this.temp.allUpdate == null) {
              clientAddressList[0] = this.temp.clientAddress
            } else {
              for (let i = 0; i < this.list.length; i++) {
                if (this.list[i] != null) {
                  clientAddressList[i] = this.list[i].clientAddress
                }
              }
            }
            this.updateExecute(tempData)
          }
        })
      },

      updateExecute(updateData) {
        threadPoolAdapterApi.updatePool(updateData).then(response => {
          this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            message: 'Update Successfully',
            type: 'success',
            duration: 2000
          })
          this.fetchData()
        }).catch(error => {
          console.log(error)
          this.$message.error('修改线程池失败')
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
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
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
        let clientAddressStr = ''
        const clientAddress = row.clientAddress
        let clientBasePath = row.clientBasePath
        if (clientBasePath != null) {
          clientAddressStr = clientAddress + clientBasePath
        } else {
          clientAddressStr = clientAddress
        }
        threadPoolApi.webBaseState({ 'clientAddress': clientAddressStr }).then(response => {
          this.runTimeTemp = response
        }).catch(error => {
          console.log(error)
          this.$message.error('查询失败，请尝试刷新页面')
        })
      }
    }
  }
</script>
