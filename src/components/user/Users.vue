<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>

          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>

      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>

          </template>

        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size='mini' @click=showEditDialog(scope.row.id)></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top">
              <el-button type="danger" icon="el-icon-delete" size='mini' @click=removeUserById(scope.row.id)>
              </el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size='mini' @click="setRole(scope.row)"></el-button>
            </el-tooltip>

          </template>
        </el-table-column>

      </el-table>

      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>

      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model=" editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>

        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    data() {
      // 验证邮箱的校验规则
      var checkEmail = (rule, value, cb) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          // 合法邮箱
          return cb()
        }
        cb(new Error('请输入合法的邮箱!'))

        // 验证手机号的规则
      }
      // master 修改

      var checkMobile = (rule, value, cb) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]17[678]18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return cb()
        }
        // 返回一个错误提示
        cb(new Error('请输入合法的手机号码'))
      }

      return {

        // 获取用户列表的参数对象
        queryInfo: {
          query: '', pagenum: 1, pagesize: 2
        },
        userList: [],
        total: 0,
        // 控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        // 添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        addFormRules: {
          username: [{ required: true, message: '请输入用户名称', trigger: 'blur' }, { min: 3, max: 10, message: '用户名长度在3~10个字符之间', trigger: 'blur' }],
          password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, max: 15, message: '密码长度在6~15个字符之间', trigger: 'blur' }],
          // email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
          email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }],
          // mobile: [{ required: true, message: '请输入手机', trigger: 'blur' }]
          mobile: [{ required: true, message: '请输入手机', trigger: 'blur' }, { validator: checkMobile, trigger: 'blur' }]
        },
        // 控制修改用户对话框的显示与隐藏
        editDialogVisible: false,
        editForm: {
          username: '',
          email: '',
          mobile: ''
        },
        // 修改表单校验
        editFormRules: {

          // email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
          email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }],
          // mobile: [{ required: true, message: '请输入手机', trigger: 'blur' }]
          mobile: [{ required: true, message: '请输入手机', trigger: 'blur' }, { validator: checkMobile, trigger: 'blur' }]
        },
        // 控制分配角色对话框的显示与隐藏
        setRoleDialogVisible: false,
        // 需要被分配角色的用户信息
        userInfo: {},
        rolesList: [],
        // 已选中的角色id 值
        selectedRoleId: ''
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const { data: res } = await this.$http.get('users', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) { return this.$.message.error('获取用户列表失败！') }
        this.userList = res.data.users
        this.total = res.data.total
        console.log(res)
      },
      // 监听pagesize 改变的事件
      handleSizeChange(newSize) {
        console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      // 监听页码值改变的事件
      handleCurrentChange(newPage) {
        console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      async userStateChanged(userInfo) {
        console.log(userInfo)
        const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态失败！')
        }
        this.$message.success('更新用户状态成功！')
      },
      // 关闭对话框关闭事件操作
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮，添加用户
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          // console.log(valid)
          if (!valid) return null
          // 可以发起添加用户的网络请求
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            this.$message.err('添加用户失败！')
          }
          this.$message.success('添加用户成功！')
          this.addDialogVisible = false
          this.getUserList()
        })
      },
      // 展示编辑用户的对话框
      async showEditDialog(id) {
        console.log(id)
        const { data: res } = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询用户信息失败！')
        }
        this.editForm = res.data
        this.editDialogVisible = true
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 修改用户信息并提交
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return null
          // 发起修改用户的信息的数据请求
          const { data: res } = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email, mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) {
            this.$message.err('更新用户失败！')
          }
          this.editDialogVisible = false

          this.getUserList()
          this.$message.success('更新用户信息成功！')
        })
      },
      async removeUserById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .catch(err => err)
        // 如果用户点击确认，则confirmResult 为'confirm'
        // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
        if (confirmResult !== 'confirm') {
          return this.$message.info('已经取消删除')
        }
        // 发送请求根据id完成删除操作
        const { data: res } = await this.$http.delete('users/' + id)
        // 判断如果删除失败，就做提示
        if (res.meta.status !== 200) return this.$message.error('删除用户失败')
        // 修改成功的提示
        this.$message.success('删除用户成功')
        // 重新请求最新的数据
        this.getUserList()
      },
      // 展示分配角色的对话框
      async setRole(userInfo) {
        this.userInfo = userInfo

        // 在展示对话框之前，获取所有的角色列表
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')

        this.rolesList = res.data

        this.setRoleDialogVisible = true

        // console.log(userInfo)
      },
      // 保存要分配的角色
      async saveRoleInfo() {
        if (!this.selectedRoleId) {
          return this.$message.error('请选择要分配的角色')
        }
        const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
        if (res.meta.status !== 200) return this.$message.error('更新角色失败！')
        this.$message.success('更新角色成功！')
        this.getUserList()
        this.setRoleDialogVisible = false
      },
      // 监听分配角色对话框的关闭事件
      setRoleDialogClosed() {
        this.selectedRoleId = ''
        this.userInfo = {}
      }
    }

  }
</script>
<style lang="less" scoped>

</style>