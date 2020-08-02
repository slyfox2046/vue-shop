<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/avatar2.png" alt="">
      </div>
      <!-- 登陆表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-username" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-tuceng" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        loginForm: {},
        loginFormRules: {}
      }
    },
    methods: {
      resetLoginForm() { },
      login() { }
    }
  }
</script>
<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;

    }

  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }
</style>