<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-button type="primary" @click="addRole">添加角色</el-button>
      </el-row>

      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
        <pre></pre>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="" width="300px">
          <template slot-scope="">
            <el-button size="mini" icon="el-icon-edit" type="primary" @click="a">编辑</el-button>
            <el-button size="mini" icon="el-icon-delete" type="danger" @click="a">删除</el-button>
            <el-button size="mini" icon="el-icon-setting" type="warning" @click="a">分配权限</el-button>

          </template>
        </el-table-column>

      </el-table>

    </el-card>

  </div>
</template>
<script>
  export default {
    data() {
      return {
        // 角色列表
        rolesList: []
      }
    },

    created() {
      // 获取所有角色
      this.getRolesList()
    },
    methods: {
      // 获取所有角色
      async getRolesList() {
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败！')
        }
        this.rolesList = res.data
        console.log(this.rightsList)
      }
    }
  }
</script>
<style lang="less" scoped>

</style>