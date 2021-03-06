import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from "axios";
import './assets/fonts/iconfont.css'
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
import moment from 'moment'
//导入quill
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
//导入NProgress
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"
axios.interceptors.request.use(config => {
  console.log(config);
  NProgress.start()
  //为请求头对象，添加Token验证的Authorization
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)
Vue.use(VueQuillEditor)

Vue.use(ElementUI)

//全局过滤器(格式化时间) 一：手写
// Vue.filter('dateFormat', function (originVal) {
//   const dt = new Date(originVal)
//
//   const y = dt.getFullYear()
//   const m = (dt.getMonth() + 1 + '').padStart(2, '0')
//   const d = (dt.getDate() + '').padStart(2, '0')
//
//   const hh = (dt.getHours() + '').padStart(2, '0')
//   const mm = (dt.getMinutes() + '').padStart(2, '0')
//   const ss = (dt.getSeconds() + '').padStart(2, '0')
//
//   return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
// })

//npm install moment --save 二：插件
Vue.filter('dateFormat', v => {
  return moment(v).format('YYYY-MM-DD HH:mm:ss')
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
