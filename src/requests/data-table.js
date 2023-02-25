import request from './index'

export const getDataTableList = (data = { filter: {}, page: 1, limit: 15 }) => {
	return request({ url: '/data-table/list', method: 'post', data })
}

export const getDataTable = (id) => {
	return request({ url: `/data-table/${id}`, method: 'get' })
}

export const storeDataTable = (data) => {
	return request({ timeout: 60000, url: '/data-table', method: 'post', data })
}

export const deleteDataTable = (id) => {
	return request({ url: `/data-table/${id}`, method: 'delete' })
}
