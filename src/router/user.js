export default {
	component: () => import('@/views/user/Profile.vue'),
	path: '/profile',
	name: 'Profile',
	meta: {
		title: '프로필',
		hidden: true
	}
}
