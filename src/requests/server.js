import request from './index'

export const getServerList = (data = { filter: {}, page: 1, limit: 15 }) => {
	return request({ url: '/server/list', method: 'post', data })
}
