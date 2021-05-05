import axios from 'axios'

export function request(config) {
  //1.创建axios实例
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:8888/api/private/v1/',
    timeout: 5000
  })

  //2.axios的拦截器
  //2.1-----请求拦截的作用
  instance.interceptors.request.use(config => {
    // console.log(config);
    // 比如config中一些信息不符合服务器的要求
    // 比如每次发送网络请求时,需要界面中显示一些图标
    // 某些网络请求（比如登录（token）），必须携带一些特殊的信息

    return config
  }),err => {
    // console.log(err);
  }

  //2.2------响应拦截的作用
  instance.interceptors.response.use(res => {
    return res.data
  },err =>{
    console.log(err);
  })

  //3.发送真正的网络请求
  return instance(config)
}