<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <!-- 参数参考：https://github.com/MisterTaki/vue-table-with-tree-grid -->
      <tree-table class="tree-table" show-index index-text="#" :data="cateList" :columns="columns"
        :selection-type="false" :expand-type="false" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>

        <!-- 排序 第二种写法 -->
        <template #order="scope">
          <el-tag size="min" type="" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="min" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="min" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template #opt="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="scope.row;">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click=";">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options 指定数据源 -->
          <!-- props 指定配置对象（数据结构） -->
          <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps"
            @change="parentCateChanged" clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>
<script>
  export default {
    data() {
      return {
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        // 商品分类数据列表
        cateList: [],
        // 数据条数
        total: 0,
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name',
            width: '400px'
          }, {
            label: '是否有效',
            // 表示将当前定义为模板列
            type: 'template',
            // 列类型为 'template'(自定义列模板) 时，对应的作用域插槽（它可以获取到 row, rowIndex, column, columnIndex）名称
            template: 'isok'
          }, {
            label: '排序',
            // 表示将当前定义为模板列
            type: 'template',
            // 列类型为 'template'(自定义列模板) 时，对应的作用域插槽（它可以获取到 row, rowIndex, column, columnIndex）名称
            template: 'order'
          }, {
            label: '操作',
            // 表示将当前定义为模板列
            type: 'template',
            // 列类型为 'template'(自定义列模板) 时，对应的作用域插槽（它可以获取到 row, rowIndex, column, columnIndex）名称
            template: 'opt',
            minWidth: '100px'
          }],
        addCateDialogVisible: false,
        // 添加分类的表单数据对象
        addCateForm: {
          // 将要添加的分类的名称
          cat_name: '',
          cat_pid: 0,
          cat_level: 0
        },
        // 添加分类表单的验证规则对象
        addCateFormRules: {
          cat_name: [{ required: true, message: '请输入分类的名称', trigger: 'blur' }]
        },
        // 父级分类的列表
        parentCateList: [],
        // 指定级联选择器的配置对象
        cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          expandTrigger: 'hover',
          checkStrictly: true
        },
        // 选中的父级分类的id数组
        selectedKeys: []
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      // 获取商品分类数据
      async getCateList() {
        const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
        if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
        this.cateList = res.data.result
        this.total = res.data.total
      },
      // 监听pagesize改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      // 监听pagenum 改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      showAddCateDialog() {
        // 获取父级分类的数据
        this.getParentCateList()
        this.addCateDialogVisible = true
      },
      async getParentCateList() {
        const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
        if (res.meta.status !== 200) return this.$message.error('获取父级分类失败！')
        this.parentCateList = res.data
      },
      //
      parentCateChanged() {
        console.log(this.selectedKeys)
        // 如果selectedKeys数组中的length大于0，证明选中的父级分类
        // 反之就说明没有选中任何父级分类
        if (this.selectedKeys.length > 0) {
          // 父级分类id
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          // 当前分类的等级
          this.addCateForm.cat_level = this.selectedKeys.length
        } else {
          // 父级分类id
          this.addCateForm.cat_pid = 0
          // 当前分类的等级
          this.addCateForm.cat_level = 0
        }
      },
      // 点击按钮，添加新的分类
      addCate() {
        // console.log(this.addCateForm)
        this.$refs.addCateFormRef.validate(async valid => {
          console.log(valid)
          if (!valid) return null
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) return this.$message.error('添加分类失败！')
          this.$message.success('添加分类成功！')
          this.getCateList()
          this.addCateDialogVisible = false
        })
      },
      // 监听对话框的关闭事件，重置
      addCateDialogClosed() {
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    }
  }
</script>
<style lang="less" scoped>
  .tree-table {
    margin-top: 15px
  }

  .el-cascader {
    width: 100%
  }
</style>