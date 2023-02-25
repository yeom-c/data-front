import request from './index'

export const storeDataMap = (data) => {
	return request({ timeout: 60000, url: '/data-map', method: 'post', data })
}
