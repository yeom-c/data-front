import request from './index'

export const getProfile = () => {
	return request({ url: '/profile', method: 'get' })
}

export const storeProfile = (data) => {
	return request({ url: '/profile', method: 'post', data })
}
