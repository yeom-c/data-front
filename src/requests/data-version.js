import request from './index'

export const getDataVersionList = (data = { filter: {}, page: 1, limit: 15 }) => {
	return request({ url: '/data-version/list', method: 'post', data })
}

export const updateDataVersion = (data) => {
	return request({ url: '/data-version', method: 'patch', data })
}
