<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRues" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name" placeholder=""></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" placeholder="" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight" placeholder=""></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number" placeholder=""></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="catelist" :props="cateProps" @change="handleChange">
              </el-cascader>
            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="(item, index) in manyTableData" :key="index">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>

              </el-checkbox-group>
            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item) in onlyTableData" :key="item.attr_id">
<el-input v-model="item.attr_vals" placeholder=""></el-input>

            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">商品图片</el-tab-pane>
          <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

  </div>
</template>
<script>
  export default {
    data() {
      return {
        activeIndex: '0',
        // 添加商品的表单数据对象
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          // 商品分类数组
          goods_cat: []
        },
        addFormRues: {
          goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
          goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
          goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
          goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
          goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
        },
        // 商品分类列表
        catelist: [],
        cateProps: { expandTrigger: 'hover', label: 'cat_name', value: 'cat_id', children: 'children' },
        // 动态参数列表
        manyTableData: [],
        // 静态属性列表
        onlyTableData: []
      }
    },
    computed: {
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      // 获取所有商品分类数据
      async getCateList() {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败！')
        this.catelist = res.data
      },
      // 级联选择器选择项变化
      handleChange() {
        console.log(this.addForm.goods_cat)
        if (this.addForm.goods_cat.length !== 3) this.addForm.goods_cat = []
      },
      // 离开tab前
      beforeTabLeave(activeName, oldActiveName) {
        console.log(activeName, oldActiveName)
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类！')
          return false
        }
      },
      async tabClicked() {
        // console.log(this.activeIndex)

        // 访问动态参数面板
        if (this.activeIndex === '1') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
          console.log(res)
          if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败！')
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? []
              : item.attr_vals.split(' ')
          })
          this.manyTableData = res.data
        } else if (this.activeIndex === '2') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
          console.log(res)
          if (res.meta.status !== 200) return this.$message.error('获取静态参数列表失败！')
          // res.data.forEach(item => {
          //   item.attr_vals = item.attr_vals.length === 0 ? []
          //     : item.attr_vals.split(' ')
          // })
          this.onlyTableData = res.data
        }
      }
    }
  }
</script>
<style lang="less" scoped>
  .el-step__title {
    font-size: 13px !important;
  }

  .el-checkbox {
    margin: 0 10px 0 0 !important
  }
</style>