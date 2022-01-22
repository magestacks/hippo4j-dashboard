import request from '@/utils/request'

export function list(data) {
  return request({
    url: '/hippo4j/v1/cs/thread/pool/query/page',
    method: 'post',
    data
  })
}

export function listClient(data) {
  return request({
    url: '/hippo4j/v1/cs/thread/pool/list/client/instance/' + data.itemId,
    method: 'get',
    data
  })
}

export function info(data) {
  return request({
    url: '/hippo4j/v1/cs/configs?tpId=' + data.tpId + '&itemId=' + data.itemId + '&namespace=' + data.tenantId + '&instanceId=' + data.identify,
    method: 'get'
  })
}

export function tenantList(data) {
  return request({
    url: '/hippo4j/v1/cs/item/query/page',
    method: 'post',
    data
  })
}

export function updated(data) {
  return request({
    url: '/hippo4j/v1/cs/thread/pool/save_or_update',
    method: 'post',
    data
  })
}

export function created(data) {
  return request({
    url: '/hippo4j/v1/cs/thread/pool/save_or_update',
    method: 'post',
    data
  })
}

export function deleted(data) {
  return request({
    url: '/hippo4j/v1/cs/thread/pool/delete',
    method: 'delete',
    data
  })
}

export function alarmEnable(data) {
  return request({
    url: '/hippo4j/v1/cs/thread/pool/alarm/enable/' + data.id + '/' + data.isAlarm,
    method: 'post'
  })
}

