import request from '@/utils/request'

export function list (data) {
  return request({
    url: '/v1/cs/log/query/page',
    method: 'post',
    data
  })
}

export function active (data) {
  return request({
    url: '/v1/cs/monitor/info',
    method: 'post',
    data
  })
}
