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
        <el-button type="primary">添加角色</el-button>
      </el-row>

      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbtoom',i1===0 ?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children"
              :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">

                <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-row :class="[i3===0?'':'bdtop']" v-for="(item3,i3) in item2.children" :key="item3.id">
                      <el-col>
                        <el-tag type="warning" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}
                        </el-tag>
                      </el-col>

                    </el-row>
                  </el-col>
                </el-row>

              </el-col>
            </el-row>

          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-edit" type="primary" @click=";">编辑</el-button>
            <el-button size="mini" icon="el-icon-delete" type="danger" @click=";">删除</el-button>
            <el-button size="mini" icon="el-icon-setting" type="warning" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>

          </template>
        </el-table-column>

      </el-table>

    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" ref="treeRef" show-checkbox node-key="id" default-expand-all
        :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
  export default {
    data() {
      return {
        // 角色列表
        rolesList: [],
        setRightDialogVisible: false,
        // 所有权限的数据
        rightsList: [],
        // 树形控件的属性绑定对象
        treeProps: {
          children: 'children',
          label: 'authName'
        },
        // 默认选中的节点Id值
        defKeys: [],
        // 当前即将分配权限的角色ID
        roleId: ''
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
      },
      // 根据ID删除用户是否删除
      async removeRightById(role, rightId) {
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') return this.$message.info('取消了删除！')
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error('删除权限失败！')

        // this.getRolesList() 不调用，会刷新页面
        role.children = res.data
      },
      // 展开分配权限对话框
      async showSetRightDialog(role) {
        this.roleId = role.id
        // 获取所有权限的数据
        const { data: res } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) return this.$message.error('获取权限数据失败！')
        this.rightsList = res.data
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      },
      // 通过递归的形式获取角色下三级权限的ID,并保存到defKeys 数组中
      getLeafKeys(node, arr) {
        // 如果当前node节点不包含children属性，则是三级节点
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => this.getLeafKeys(item, arr))
      },
      // 监听分配权限对话的关闭事件
      setRightDialogClosed() {
        this.defKeys = []
      },
      // 点击为角色分配权限
      async allotRights() {
        const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
        // console.log(keys)
        const idStr = keys.join(',')
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
        if (res.meta.status !== 200) return this.$message.error('角色分配权限失败！')
        // res.data
        this.$message.success('分配权限成功！')
        this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }
</script>
<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbtoom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>