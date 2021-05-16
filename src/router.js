import Vue from 'vue'
import Router from 'vue-router'

const Login = () => import('./components/Login')
const Home = () => import('./components/Home')
const Welcome = () => import('./components/Welcome')
const Users = () => import('./components/user/Users')
const Rights = () => import('./components/power/Rights')
const Roles = () => import('./components/power/Roles')
const Cate = () => import('./components/goods/Cate')
const Params = () => import('./components/goods/Params')


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
      children:[
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