import request from '@/utils/request'

export function list(data) {
  return request({
    url: '/v1/cs/log/query/page',
    method: 'post',
    data
  })
}
