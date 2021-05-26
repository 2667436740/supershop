import Vue from 'vue'
import Router from 'vue-router'

const Login = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Login')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Home')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Welcome')
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ './components/user/Users')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ './components/power/Rights')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ './components/power/Roles')
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ './components/goods/Cate')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ './components/goods/Params')
const GoodsList = () => import(/* webpackChunkName: "GoodsList_Add" */ './components/goods/List')
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ './components/goods/Add')
const Order = () => import(/* webpackChunkName: "Order_Report" */ './components/order/Order')
const Report = () => import(/* webpackChunkName: "Order_Report" */ './components/report/Report')

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path:'',
      redirect: '/login'
    },
    {
      path: '/login',
      component:Login
    },
    {
      path: '/home',
      component:Home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component:Welcome
        },
        {
          path: '/users',
          component:Users,
        },
        {
          path: '/rights',
          component:Rights
        },
        {
          path: '/roles',
          component:Roles
        },
        {
          path: '/categories',
          component:Cate
        },
        {
          path: '/params',
          component:Params
        },
        {
          path: '/goods',
          component:GoodsList,
        },
        {
          path: '/goods/add',
          component:Add,
        },
        {
          path: '/orders',
          component:Order,
        },
        {
          path: '/reports',
          component:Report,
        }
      ]
    }
  ]
})

//挂载路由导航守卫(控制访问权限)
  //to 去哪的路径
  //from 从哪来的路径
  //next 放行
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router