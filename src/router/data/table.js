export default {
	component: () => import('@/components/RouterView.vue'),
	path: '/data/table',
	redirect: { name: 'DataTableIndex' },
	name: 'DataTable',
	meta: {
		title: '테이블'
	},
	children: [
		{
			component: () => import('@/views/data/table/Index.vue'),
			path: '',
			name: 'DataTableIndex',
			meta: {
				title: '테이블 목록',
				hidden: true,
				selectedKey: '/data/table'
			}
		},
		{
			component: () => import('@/views/data/version/DataList.vue'),
			path: '/data/table/:id',
			name: 'DataTableVersionIndex',
			props: true,
			meta: {
				title: '버전 목록',
				hidden: true,
				selectedKey: '/data/table'
			}
		}
	]
}
