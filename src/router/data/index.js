import dataSchemaRoute from './schema'
import dataTableRoute from './table'
import dataEnumRoute from './enum'
import AbyssRoute from './map'

export default {
	path: '/data',
	component: () => import('@/components/RouterView.vue'),
	redirect: '/data/schema',
	name: 'Data',
	meta: {
		title: '데이터 관리',
		icon: 'DataTable'
	},
	children: [dataSchemaRoute, dataTableRoute, dataEnumRoute, AbyssRoute]
}
