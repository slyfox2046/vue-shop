<template>
  <!-- 头部区 -->
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets//heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class='toggle-button' @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#ffd04b" unique-opened
          :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id" >
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>

            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
              <!-- <el-menu-item index="1-4-1">选项1</el-menu-item> -->
            </el-menu-item>
          </el-submenu>

        </el-menu>

      </el-aside>
      <!-- 主体 -->
      <el-main>
        <router-view></router-view>

      </el-main>
    </el-container>
  </el-container>
</template>
<script>
  export default {
    data() {
      return {
        // 左侧菜单数据
        menuList: [],
        iconsObj: {
          103: 'iconfont icon-user',
          125: 'iconfont icon-tijikongjian',
          101: 'iconfont icon-shangpin',
          102: 'iconfont icon-danju',
          145: 'iconfont icon-baobiao'

        },
        isCollapse: false,
        // 被激活的地址
        activePath: ''
      }
    },
    created() {
      this.getMenuList()
    },
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      // 获取左侧菜单
      async getMenuList() {
        const { data: res } = await this.$http.get('menus')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menuList = res.data
        this.activePath = window.sessionStorage.getItem('activePath')
      },
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      saveNavState(path) {
        // 点击二级菜单的时候保存被点击的二级菜单信息
        window.sessionStorage.setItem('activePath', path)
        this.activePath = path
      }
    }
  }
</script>
<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    ;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: white;
    font-size: 20px;

    >div {
      display: flex;
      align-items: center;

      span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #f1f1f1;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: white;
    text-align: center;
    letter-spacing: 0.2em;
    ;
  }
</style>