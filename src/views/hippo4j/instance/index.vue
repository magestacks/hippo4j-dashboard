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
      <el-select
        v-model="listQuery.tpId"
        placeholder="线程池ID"
        style="width:220px"
        class="filter-item"
      >
        <el-option
          v-for="item in threadPoolOptions"
          :key="item.key"
          :label="item.display_name"
          :value="item.key"
        />
      </el-select>

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        style="margin-left: 10px;"
        icon="el-icon-search"
        @click="fetchData"
      >
        搜索
      </el-button>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        style="margin-left: 10px;"
        icon="el-icon-refresh"
        @click="refreshData"
      >
        重置
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
        <template slot-scope="scope">{{ scope.row.maxSize }}</template>
      </el-table-column>
      <el-table-column label="队列类型" align="center">
        <template slot-scope="scope">{{ scope.row.queueType | queueFilter }}</template>
      </el-table-column>
      <el-table-column label="队列容量" align="center">
        <template slot-scope="scope">{{ scope.row.capacity }}</template>
      </el-table-column>
      <el-table-column label="拒绝策略" align="center">
        <template slot-scope="scope">{{ scope.row.rejectedType | rejectedFilter }}</template>
      </el-table-column>
      <el-table-column label="线程存活" align="center">
        <template slot-scope="scope">{{ scope.row.keepAliveTime }}</template>
      </el-table-column>
      <!--<el-table-column label="是否报警" align="center" width="200">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.isAlarm" active-color="#00A854" active-text="报警" :active-value="0"
                     inactive-color="#F04134" inactive-text="忽略" :inactive-value="1" @change="changeSwitch(scope.row)"/>
        </template>
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
              <el-dropdown-item @click.native="handleInfo(row)">查看</el-dropdown-item>
              <el-dropdown-item @click.native="handleShowStack(row)">堆栈</el-dropdown-item>
              <el-dropdown-item divided @click.native="handleUpdate(row)">编辑</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.current"
      :limit.sync="listQuery.size"
      @pagination="fetchData"
    />
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
        <h3>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;线程池负载高时, 禁止频繁刷新此页面!!!
        </h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label=""></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线程池ID">
              <el-input v-model="runTimeTemp.tpId" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="环境标识">
              <el-input v-model="runTimeTemp.active" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实例Host">
              <el-input v-model="runTimeTemp.host" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实例标识">
              <el-input v-model="runTimeTemp.identify" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="运行状态">
              <el-input v-model="runTimeTemp.state" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

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
            <el-form-item label="任务总量" prop="completedTaskCount">
              <el-input v-model="runTimeTemp.completedTaskCount" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="拒绝次数" prop="rejectCount">
              <el-input v-model="runTimeTemp.rejectCount" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最后更新时间" prop="clientLastRefreshTime">
              <el-input v-model="runTimeTemp.clientLastRefreshTime" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="拒绝策略" prop="RejectedExecutionHandler">
              <el-input v-model="runTimeTemp.rejectedName" :disabled="true"/>
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
            <el-form-item label="基本信息"></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="租户ID" prop="tenantId">
              <el-select
                v-model="temp.tenantId"
                placeholder="请选择租户"
                style="display:block;"
                :disabled="dialogStatus === 'create' ? false : true"
              >
                <el-option
                  v-for="item in tenantOptions"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="核心线程" prop="coreSize">
              <el-input-number v-model="temp.coreSize" placeholder="核心线程" :min="1" :max="999"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目ID" prop="itemId">
              <el-select
                v-model="temp.itemId"
                placeholder="请选择项目"
                style="display:block;"
                :disabled="dialogStatus === 'create' ? false : true"
              >
                <el-option
                  v-for="item in itemOptions"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大线程" prop="maxSize">
              <el-input-number v-model="temp.maxSize" placeholder="最大线程" :min="1" :max="999"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线程池ID" prop="tpId">
              <el-input
                v-model="temp.tpId"
                size="medium"
                placeholder="请输入线程池ID"
                :disabled="dialogStatus === 'create' ? false : true"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="扩展信息"></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="队列类型" prop="queueType">
              <el-select
                v-model="temp.queueType"
                placeholder="队列类型"
                :disabled="true"
                style="display:block;"
                @change="selectQueueType"
              >
                <el-option
                  v-for="item in queueTypeOptions"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="队列容量" prop="capacity">
              <el-input-number
                v-model="temp.capacity"
                placeholder="队列容量"
                :min="0"
                :max="2147483647"
                :disabled="temp.queueType != 9 ? true : false"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="核心线程超时" prop="isAlarm">
              <el-select
                v-model="temp.allowCoreThreadTimeOut"
                placeholder="核心线程超时"
                style="display:block;"
              >
                <el-option
                  v-for="item in allowCoreThreadTimeOutTypes"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="KATime/S" prop="keepAliveTime">
              <el-input-number
                v-model="temp.keepAliveTime"
                placeholder="Time/S"
                :min="1"
                :max="99999"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="拒绝策略" prop="rejectedType">
              <el-select
                v-model="temp.rejectedType"
                style="display:block;"
                placeholder="拒绝策略"
                @change="selectRejectedType"
              >
                <el-option
                  v-for="item in rejectedOptions"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="isRejectShow" :gutter="20">
          <el-col :span="12">
            <el-form-item label="SPI 拒绝策略" prop="customRejectedType">
              <el-input
                v-model="temp.customRejectedType"
                placeholder="请输入自定义 SPI 拒绝策略标识"
                @input="onInput()"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
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
        <el-button type="primary" @click="dialogPvVisible = false">
          Confirm
        </el-button>
      </span>
    </el-dialog>
    <el-dialog title="Stack Info" :visible.sync="isStackShow" width="60%">
      <ul class="stack-info">
        <li v-for="item in stackInfo" :key="item.threadId">
          <p>
            "{{ item.threadName }}" #{{ item.threadId }} java.lang.Thread.State:
            {{ item.threadStatus }}
          </p>
          <ul>
            <li v-for="(tip, index) in item.threadStack" :key="index">at {{ tip }}</li>
          </ul>
        </li>
      </ul>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isStackShow = false">关 闭</el-button>
        <el-button type="primary" @click="handleStackInfo">
          刷 新
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as tenantApi from '@/api/hippo4j-tenant'
  import * as itemApi from '@/api/hippo4j-item'
  import * as threadPoolApi from '@/api/hippo4j-threadPool'
  import * as instanceApi from '@/api/hippo4j-instance'
  import waves from '@/directive/waves'
  import Pagination from '@/components/Pagination'
  import axios from 'axios'

  export default {
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
      },
      queueFilter(type) {
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

      rejectedFilter(type) {
        if ('1' == type) {
          return 'CallerRunsPolicy'
        } else if ('2' == type) {
          return 'AbortPolicy'
        } else if ('3' == type) {
          return 'DiscardPolicy'
        } else if ('4' == type) {
          return 'DiscardOldestPolicy'
        } else if ('5' == type) {
          return 'RunsOldestTaskPolicy'
        } else if ('6' == type) {
          return 'SyncPutQueuePolicy'
        } else {
          return 'CustomRejectedPolicy' + ' - ' + type
        }
      }
    },
    data() {
      return {
        list: null,
        listLoading: false,
        total: 0,
        listQuery: {
          current: 1,
          size: 10,
          itemId: '',
          tpId: ''
        },
        isStackShow: false, // 堆栈信息是否显示
        stackInfo: [], // 堆栈信息
        rowInfo: {}, // 行信息
        size: 500,
        pluginTypeOptions: ['reader', 'writer'],
        dialogPluginVisible: false,
        pluginData: [],
        dialogFormVisible: false,
        isRejectShow: false, // 是否显示spi拒绝策略
        instanceDialogFormVisible: false,
        tenantOptions: [],
        threadPoolOptions: [],
        itemOptions: [],
        queueTypeOptions: [
          { key: 1, display_name: 'ArrayBlockingQueue' },
          { key: 2, display_name: 'LinkedBlockingQueue' },
          { key: 3, display_name: 'LinkedBlockingDeque' },
          { key: 4, display_name: 'SynchronousQueue' },
          { key: 5, display_name: 'LinkedTransferQueue' },
          { key: 6, display_name: 'PriorityBlockingQueue' },
          {
            key: 9,
            display_name: 'ResizableLinkedBlockingQueue (支持动态修改队列大小)'
          }
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
        rules: {
          tenantId: [{ required: true, message: 'this is required', trigger: 'blur' }],
          itemId: [{ required: true, message: 'this is required', trigger: 'blur' }],
          tpId: [{ required: true, message: 'this is required', trigger: 'blur' }],
          coreSize: [{ required: true, message: 'this is required', trigger: 'blur' }],
          maxSize: [{ required: true, message: 'this is required', trigger: 'blur' }],
          queueType: [{ required: true, message: 'this is required', trigger: 'blur' }],
          keepAliveTime: [{ required: true, message: 'this is required', trigger: 'blur' }],
          isAlarm: [{ required: true, message: 'this is required', trigger: 'blur' }],
          capacityAlarm: [{ required: true, message: 'this is required', trigger: 'blur' }],
          livenessAlarm: [{ required: true, message: 'this is required', trigger: 'blur' }],
          rejectedType: [{ required: true, message: 'this is required', trigger: 'blur' }]
        },
        dialogStatus: '',
        textMap: {
          update: 'Edit',
          create: 'Create',
          info: 'Info'
        },
        temp: {
          id: undefined,
          tenantId: '',
          itemId: '',
          rejectedType: null,
          customRejectedType: null
        },
        runTimeTemp: {},
        tempRow: {},
        visible: true
      }
    },
    created() {
      // this.fetchData()
      // 初始化项目
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
        if (this.listQuery.tpId == null || Object.keys(this.listQuery.tpId).length == 0) {
          alert('线程池 ID 不允许为空!')
          return
        }
        this.listLoading = true
        const listArray = [this.listQuery.itemId, this.listQuery.tpId]
        instanceApi.list(listArray).then(response => {
          const { records } = response
          this.list = response
          this.listLoading = false
        })
      },
      refreshData() {
        this.listQuery.tenantId = null
        this.listQuery.itemId = null
        this.listQuery.tpId = null
        this.itemOptions = []
        this.threadPoolOptions = []
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
      // 打开弹框
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
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
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleInfo(row) {
        this.dialogStatus = 'info'

        if (typeof row == 'undefined' || row == null) {
          row = this.tempRow
        } else {
          this.tempRow = {
            identify: row.identify,
            clientAddress: row.clientAddress,
            clientBasePath: row.clientBasePath,
            tpId: row.tpId
          }
        }
        this.refresh(row)
      },

      selectRejectedType(value) {
        if (value == 99) {
          this.isRejectShow = true
        } else {
          this.isRejectShow = false
        }
      },

      refresh(row) {
        let httpStr = ''
        const clientAddress = row.clientAddress
        let clientBasePath = row.clientBasePath
        if (clientBasePath != null) {
          httpStr = 'http://' + clientAddress + clientBasePath + '/run/state/' + row.tpId
        } else {
          httpStr = 'http://' + clientAddress + '/run/state/' + row.tpId
        }

        axios({
          method: 'get',
          changeOrigin: true,
          url: httpStr,
          headers: { 'Access-Control-Allow-Credentials': true },
          params: {}
        }).then(response => {
          this.instanceDialogFormVisible = true

          this.runTimeTemp = response.data.data
        }).catch(error => {
          console.log(error)
          this.$message.error('查询失败，请尝试刷新页面')
        })
      },
      handleShowStack(row) {
        this.rowInfo = row
        this.handleStackInfo()
      },
      handleStackInfo() {
        const { clientAddress, tpId } = this.rowInfo
        const clientBasePath = this.rowInfo.clientBasePath || ''
        const url = `http://${clientAddress}${clientBasePath}/run/thread/state/${tpId}`
        axios
          .get(url)
          .then(res => {
            const { data } = res.data
            if (data && data.length != 0) {
              this.stackInfo = data
              this.isStackShow = true
            } else {
              this.$message.warning('当前线程池暂无堆栈信息')
            }
          })
          .catch(error => {
            console.log(error)
            this.$message.error('查询失败，请尝试刷新页面')
          })
      },
      // 修改操作
      updateData() {
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            let rejectedType = this.temp.rejectedType
            if (
              rejectedType != 1 &&
              rejectedType != 2 &&
              rejectedType != 3 &&
              rejectedType != 4 &&
              rejectedType != 5 &&
              rejectedType != 6
            ) {
              if (this.temp.customRejectedType != null) {
                this.temp.rejectedType = this.temp.customRejectedType
              }
            }
            const tempData = Object.assign({}, this.temp)
            instanceApi.updated(tempData).then(() => {
              this.fetchData()
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Update Successfully',
                type: 'success',
                duration: 2000
              })
            })
          }
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

        this.itemOptions = []
        this.threadPoolOptions = []
        const tenantId = { tenantId: this.listQuery.tenantId, size: this.size }
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
        const itemId = { itemId: this.listQuery.itemId, size: this.size }
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
  .stack-info {
    & > li {
      margin-bottom: 24px;

      p:first-child {
        color: #0066ff;
        font-weight: 600;
        margin-top: 10px;
      }

      ul {
        margin-left: 30px;

        li {
          color: #fc5531;
          text-align: justify;
          margin: 10px auto;
        }
      }
    }
  }
</style>
