import Vue from 'vue'
import VueRouter from 'vue-router'
// import Add from '../components/goods/Add'
// import Cate from '../components/goods/Cate'
// import GoodsList from '../components/goods/List'
// import Params from '../components/goods/Params'
// import Home from '../components/Home'
// import Login from '../components/Login'
// import Order from '../components/Order/Order'
// import Rights from '../components/power/Rights'
// import Roles from '../components/power/Roles'
// import Report from '../components/report/Report'
// import Users from '../components/user/Users'
// import Welcome from '../components/Welcome'

const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home')

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles')

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params')

const GoodsList = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/List')
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/Add')

const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/Order/Order')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report')

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
        path: '/goods',
        component: GoodsList
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/reports',
        component: Report
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
