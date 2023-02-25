import request from './index'

export const getDataSchemaList = (data = { filter: {}, page: 1, limit: 15 }) => {
	return request({ url: '/data-schema/list', method: 'post', data })
}

export const getDataSchema = (type, server_id) => {
	return request({ url: '/data-schema', method: 'get', params: { type, server_id } })
}

export const storeDataSchema = (data) => {
	return request({ url: '/data-schema', method: 'post', data })
}

export const deleteDataSchema = (server_id) => {
	return request({ url: `/data-schema`, method: 'delete', data: { server_id } })
}

export const updateDataSchema = (data) => {
	return request({ url: `/data-schema`, method: 'patch', data })
}

export const applyDataVersion = (server_id, version_id) => {
	return request({
		url: `/data-schema/apply`,
		method: 'post',
		data: {
			server_id,
			version_id
		}
	})
}

export const unapplyDataVersion = (server_id, table_name) => {
	return request({
		url: `/data-schema/unapply`,
		method: 'post',
		data: {
			server_id,
			table_name
		}
	})
}

export const refreshDataSchema = () => {
	return request({
		timeout: 60000,
		url: `/data-schema/refresh`,
		method: 'post'
	})
}
