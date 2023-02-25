export default {
	component: () => import('@/components/RouterView.vue'),
	path: '/data/map',
	redirect: { name: 'DataMapIndex' },
	name: 'DataMap',
	meta: {
		title: '맵'
	},
	children: [
		{
			component: () => import('@/views/data/map/Index.vue'),
			path: '',
			name: 'DataMapIndex',
			meta: {
				title: '맵 목록',
				hidden: true,
				selectedKey: '/data/map'
			}
		},
		{
			component: () => import('@/views/data/version/MapList.vue'),
			path: '/data/map/:id',
			name: 'DataMapVersionIndex',
			props: true,
			meta: {
				title: '버전 목록',
				hidden: true,
				selectedKey: '/data/map'
			}
		}
	]
}
