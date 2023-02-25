import request from './index'

export const getDashboard = () => {
	return request({ url: '/dashboard', method: 'get' })
}
