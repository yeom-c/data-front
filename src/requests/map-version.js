import request from './index'

export const getMapVersionList = (data = { filter: {}, page: 1, limit: 15 }) => {
	return request({ url: '/map-version/list', method: 'post', data })
}

export const updateMapVersion = (data) => {
	return request({ url: '/map-version', method: 'patch', data })
}

export const applyMapVersion = (server_id, version_id) => {
	return request({
		url: `/map-version/apply`,
		method: 'post',
		data: {
			server_id,
			version_id
		}
	})
}

export const unapplyMapVersion = (server_id, table_name) => {
	return request({
		url: `/map-version/unapply`,
		method: 'post',
		data: {
			server_id,
			table_name
		}
	})
}
