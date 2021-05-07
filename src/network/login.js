import {request} from "./request";

export function getLoginData() {
  return request({
    url: '/login'
  })
}