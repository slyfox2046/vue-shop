<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon>
      </el-alert>
      <el-row class="cat_opt">
        <el-col><span>选择商品分类：</span>

          <!-- 选择商品分类级联选择框 -->
          <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps" @change="handleChange"
            clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" @click="addDialogVisible=true" size="mini" :disabled="isBtnDisabled">添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"> </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)" icon="el-icon-edit">编辑
                </el-button>
                <el-button type="danger" size="mini" @click="removeParams(scope.row.attr_id)" icon="el-icon-delete">删除
                </el-button>

              </template>
            </el-table-column>
          </el-table>

        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" @click="addDialogVisible=true;" size="mini" :disabled="isBtnDisabled">添加属性
          </el-button>
          <!-- 静态参数表格 -->

          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"> </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)" icon="el-icon-edit">编辑
                </el-button>
                <el-button type="danger" size="mini" @click="removeParams(scope.row.attr_id)" icon="el-icon-delete">删除
                </el-button>

              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
  export default {
    data() {
      return {
        cateList: [],
        // 级联选择框的配置对象
        cateProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          expandTrigger: 'hover'
          // checkStrictly: false
        },
        selectedCateKeys: [],
        // 被激活的页签的名称
        activeName: 'many',
        manyTableData: [],
        onlyTableData: [],
        addDialogVisible: false,
        addForm: {
          attr_name: ''
        },
        // 验证规则
        addFormRules: {
          attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
        },
        editDialogVisible: false,
        editForm: {
          attr_name: ''
        },
        // 验证规则
        editFormRules: {
          attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
        }
      }
    },
    computed: {
      // 如果按钮需要被禁用，则返回true,否则返回false
      isBtnDisabled() {
        if (this.selectedCateKeys.length !== 3) return true
        return false
      },
      // 当前选中的三级分类ID
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
        }
        return null
      },
      // 对话框title
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        } else {
          return '静态属性'
        }
      }

    },
    created() {
      this.getCateList()
    },
    methods: {

      async getCateList() {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
        this.cateList = res.data
      },
      // 级联选择框选中项变化
      handleChange() {
        this.getParamsData()
      },
      handleTabClick() {
        this.getParamsData()
      },

      // 获取参数列表数据
      async getParamsData() {
        // 证明选中的不是三级分类
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          return null
        }
        // 根据所选的分类Id和当前所处的面板，获取对应的参数
        const { data: res } = await this.$http(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')

        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      },
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },

      // 点击按钮，添加参数
      addParams() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return null
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
          if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
          this.$message.success('添加参数成功！')
          this.getParamsData()
          this.addDialogVisible = false
        })
      },
      // 点击按钮修改对话框
      async showEditDialog(attr_id) {
        // 查询当前参数的信息
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
          params: { attr_sel: this.activeName }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数信息失败！')
        } this.editForm = res.data
        this.editDialogVisible = true
      },

      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      editParams() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return null
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
          if (res.meta.status !== 200) return this.$message.error('修改参数失败！')
          this.$message.success('修改参数成功！')
          this.getParamsData()
          this.editDialogVisible = false
        })
      },
      // 根据id删除对应的id项
      async removeParams(attr_id) {
        const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除！')
        }
        // 删除的业务逻辑
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)

        if (res.meta.status !== 200) {
          return this.$message.error('删除参数失败!')
        }

        this.$message.success('删除参数成功！')
        this.getParamsData()
      }
    }

  }
</script>
<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }
</style>