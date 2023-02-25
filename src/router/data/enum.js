export default {
	component: () => import('@/components/RouterView.vue'),
	path: '/data/enum',
	redirect: { name: 'DataEnumIndex' },
	name: 'DataEnum',
	meta: {
		title: '이넘'
	},
	children: [
		{
			component: () => import('@/views/data/enum/Index.vue'),
			path: '',
			name: 'DataEnumIndex',
			meta: {
				title: '이넘 목록',
				hidden: true,
				selectedKey: '/data/enum'
			}
		},
		{
			component: () => import('@/views/data/version/DataList.vue'),
			path: '/data/enum/:id',
			name: 'DataEnumVersionIndex',
			props: true,
			meta: {
				title: '버전 목록',
				hidden: true,
				selectedKey: '/data/enum'
			}
		}
	]
}
