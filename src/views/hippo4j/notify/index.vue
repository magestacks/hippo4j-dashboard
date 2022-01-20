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
        icon="el-icon-search"
        @click="fetchData"
      >
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        添加
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
      <el-table-column label="租户ID" align="center">
        <template slot-scope="scope">{{ scope.row.tenantId }}</template>
      </el-table-column>
      <el-table-column label="项目ID" align="center">
        <template slot-scope="scope">{{ scope.row.itemId }}</template>
      </el-table-column>
      <el-table-column label="线程池ID" align="center">
        <template slot-scope="scope">{{ scope.row.tpId }}</template>
      </el-table-column>
      <el-table-column label="通知平台" align="center">
        <template slot-scope="scope">{{ scope.row.platform }}</template>
      </el-table-column>
      <el-table-column label="通知类型" align="center">
        <template slot-scope="scope">{{ scope.row.type }}</template>
      </el-table-column>
      <el-table-column label="报警间隔" align="center">
        <template slot-scope="scope">{{ scope.row.interval | intervals }}</template>
      </el-table-column>
      <el-table-column label="接收者" align="center">
        <template slot-scope="scope">{{ scope.row.receives | ellipsis }}</template>
      </el-table-column>
      <el-table-column label="是否启用" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.enable"
            active-color="#00A854"
            active-text="启用"
            :active-value="1"
            inactive-color="#F04134"
            inactive-text="停用"
            :inactive-value="0"
            @change="changeEnable(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="180"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button
            v-if="row.status !== 'deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
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
                @change="tenantTempSelectList()"
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
            <el-form-item label="通知平台" prop="platform">
              <el-select v-model="temp.platform" placeholder="通知平台" style="display:block;">
                <el-option
                  v-for="item in platformTypes"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select>
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
                @change="itemTempSelectList()"
              >
                <el-option
                  v-for="item in itemTempOptions"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通知类型" prop="type">
              <el-select
                v-model="temp.type"
                placeholder="通知类型"
                style="display:block;"
                @change="selectType"
              >
                <el-option
                  v-for="item in typeTypes"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线程池ID" prop="tpId">
              <el-select
                v-model="temp.tpId"
                placeholder="线程池ID"
                style="display:block;"
                :disabled="dialogStatus === 'create' ? false : true"
              >
                <el-option
                  v-for="item in threadPoolTempOptions"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用" prop="enable">
              <el-select v-model="temp.enable" placeholder="是否启用" style="display:block;">
                <el-option
                  v-for="item in enableTypes"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select>
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
            <el-form-item label="Token" prop="secretKey">
              <el-input v-model="temp.secretKey" size="medium" placeholder="请输入Token"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报警间隔" prop="interval">
              <el-input-number
                v-model="temp.interval"
                placeholder="报警间隔/Min"
                :min="0"
                :disabled="temp.type === 'CONFIG' ? true : false"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="24">
            <el-form-item label="接收者" prop="receives">
              <el-input
                v-model="temp.receives"
                :autosize="{ minRows: 6, maxRows: 10 }"
                type="textarea"
                placeholder="多个接收者使用英文逗号 , 分割 (注意不要有空格)
钉钉：填写手机号
企微：填写user_id会以@的消息发给用户，否则填写姓名，如：龙台
飞书：填写ou_开头用户唯一标识会以@的消息发给用户，填写手机号则是普通的@"
                style="width: 83%"
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
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import * as itemApi from '@/api/hippo4j-item'
  import * as tenantApi from '@/api/hippo4j-tenant'
  import * as notifyApi from '@/api/hippo4j-notify'
  import * as threadPoolApi from '@/api/hippo4j-threadPool'
  import waves from '@/directive/waves'
  import Pagination from '@/components/Pagination'

  export default {
    name: 'JobProject',
    components: { Pagination },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'gray',
          deleted: 'danger'
        }
        return statusMap[status]
      },

      ellipsis(value) {
        if (!value) return ''
        if (value.length > 22) {
          return value.slice(0, 22) + '...'
        }
        return value
      },

      intervals(value) {
        if (value == null || value == '') {
          return '-'
        }

        return value
      }
    },
    data() {
      return {
        list: null,
        listLoading: true,
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
        tenantOptions: [],
        itemOptions: [],
        itemTempOptions: [],

        identifyOptions: [],

        tenantOptions: [],
        threadPoolTempOptions: [],
        threadPoolOptions: [],
        platformTypes: [
          { key: 'DING', display_name: 'DING' },
          { key: 'LARK', display_name: 'LARK' },
          { key: 'WECHAT', display_name: 'WECHAT' }
        ],

        typeTypes: [
          { key: 'CONFIG', display_name: 'CONFIG' },
          { key: 'ALARM', display_name: 'ALARM' }
        ],

        enableTypes: [{ key: 1, display_name: '启用' }, { key: 0, display_name: '停用' }],
        dialogStatus: '',
        textMap: {
          update: 'Edit',
          create: 'Create'
        },
        rules: {
          tenantId: [{ required: true, message: 'this is required', trigger: 'blur' }],
          itemId: [{ required: true, message: 'this is required', trigger: 'blur' }],
          tpId: [{ required: true, message: 'this is required', trigger: 'blur' }],
          receives: [{ required: true, message: 'this is required', trigger: 'blur' }],
          secretKey: [{ required: true, message: 'this is required', trigger: 'blur' }],
          platform: [{ required: true, message: 'this is required', trigger: 'blur' }],
          type: [{ required: true, message: 'this is required', trigger: 'blur' }],
          enable: [{ required: true, message: 'this is required', trigger: 'blur' }]
        },
        temp: {
          id: undefined,
          tenantId: '',
          interval: undefined
        },
        visible: true
      }
    },
    created() {
      this.fetchData()
      // 初始化租户、项目
      this.initSelect()
    },
    methods: {
      fetchData() {
        this.listLoading = true
        notifyApi.list(this.listQuery).then(response => {
          const { records } = response
          const { total } = response
          this.total = total
          this.list = records
          this.listLoading = false
        })
      },
      initSelect() {
        tenantApi.list({}).then(response => {
          const { records } = response
          for (var i = 0; i < records.length; i++) {
            this.tenantOptions.push({
              key: records[i].tenantId,
              display_name: records[i].tenantId + ' ' + records[i].tenantName
            })
          }
        })

        itemApi.list({}).then(response => {
          const { records } = response
          for (var i = 0; i < records.length; i++) {
            this.itemOptions.push({
              key: records[i].itemId,
              display_name: records[i].itemId + ' ' + records[i].itemName
            })
          }
        })

        threadPoolApi.list({}).then(response => {
          const { records } = response
          for (var i = 0; i < records.length; i++) {
            this.threadPoolOptions.push({
              key: records[i].tpId,
              display_name: records[i].tpId
            })
          }
        })
      },
      resetTemp() {
        this.temp = {
          id: undefined,
          tenantName: '',
          tenantDesc: ''
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            notifyApi.created(this.temp).then(() => {
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
        if (this.temp.interval == null) {
          this.temp.interval = undefined
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
            const tempData = Object.assign({}, this.temp)
            notifyApi.updated(tempData).then(() => {
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
      openDelConfirm(name) {
        return this.$confirm(`此操作将删除 ${name}, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      },
      handleDelete(row) {
        const name = '[' + row.tpId + ']-[' + row.platform + ']-[' + row.type + ']'
        this.openDelConfirm(name).then(() => {
          notifyApi.deleted(row).then(response => {
            this.fetchData()
            this.$notify({
              title: 'Success',
              message: 'Delete Successfully',
              type: 'success',
              duration: 2000
            })
          })
        })
      },
      changeEnable(row) {
        notifyApi.enable(row).then(response => {
          this.fetchData()
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
        })
      },

      selectType(value) {
        if (value === 'CONFIG') {
          this.temp.interval = undefined
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

      tenantTempSelectList() {
        this.itemTempOptions = []
        this.threadPoolTempOptions = []
        if (this.temp.itemId != null && Object.keys(this.temp.itemId).length != 0) {
          this.temp.itemId = null
          if (this.temp.tpId != null && Object.keys(this.temp.tpId).length != 0) {
            this.temp.tpId = null
          }
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

      itemTempSelectList() {
        this.threadPoolTempOptions = []
        if (this.temp.tpId != null && Object.keys(this.temp.tpId).length != 0) {
          this.temp.tpId = null
        }
        const query = { tenantId: this.temp.tenantId, itemId: this.temp.itemId, size: this.size }
        threadPoolApi.list(query).then(response => {
          const { records } = response
          for (let i = 0; i < records.length; i++) {
            this.threadPoolTempOptions.push({
              key: records[i].tpId,
              display_name: records[i].tpId
            })
          }
        })
      }
    }
  }
</script>
