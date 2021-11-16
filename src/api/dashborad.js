import request from '@/utils/request'

// dashborad

export function chartInfo() {
  return request({
    url: '/v1/cs/dashboard',
    method: 'get'
  })
}
