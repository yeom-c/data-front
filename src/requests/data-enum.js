import request from './index'

export const storeDataEnum = (data) => {
	return request({ timeout: 60000, url: '/data-enum', method: 'post', data })
}

export const refreshDataEnum = () => {
	return request({
		timeout: 60000,
		url: `/data-enum/refresh`,
		method: 'post'
	})
}
