import axios from 'axios'
import 'quill/dist/quill.bubble.css' // for bubble theme
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import Vue from 'vue'
import VueQuillEditor from 'vue-quill-editor'
import TreeTable from 'vue-table-with-tree-grid'
import App from './App.vue'
// 导入全局样式表
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import './plugins/element.js'
import router from './router'

Vue.prototype.$http = axios
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor /* { default global options } */)

Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getMinutes() + '').padStart(2, '0')
  console.log(`${y}-${m}-${d} ${hh}:${mm}:${ss}`)
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
