import Vue from 'vue'
import VueRouter from 'vue-router'
import Cate from '../components/goods/Cate'
import Params from '../components/goods/Params'
import Home from '../components/Home'
import Login from '../components/Login'
import Rights from '../components/power/Rights'
import Roles from '../components/power/Roles'
import Users from '../components/user/Users'
import Welcome from '../components/Welcome'

Vue.use(VueRouter)

// router文件夹-->index.js文件
// cv以下代码解决路由地址重复的报错问题(一劳永逸)
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  // 路由重定向
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/home',
    name: 'home',
    redirect: '/welcome',
    component: Home,
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }

  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')

  if (!tokenStr) {
    return next('/login')
  }

  next()
})

export default router
