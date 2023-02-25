import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

// routes
import authRoute from './auth'
import dashboardRoute from './dashboard'
import userRoute from './user'
import dataRoute from './data'

export const authRoutes = [authRoute]
export const menuRoutes = [dashboardRoute, userRoute, dataRoute]

export const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			component: () => import('@/layouts/Auth.vue'),
			path: '/auth',
			redirect: '/auth/sign-in',
			name: 'Auth',
			children: authRoutes
		},
		{
			component: () => import('@/layouts/Default.vue'),
			path: '/',
			redirect: '/dashboard',
			name: 'Home',
			meta: {
				title: '홈'
			},
			children: menuRoutes
		}
	]
})

router.beforeEach((to, from, next) => {
	const { user } = useUserStore()
	if (user.isSignIn) {
		if (to.path === '/auth/sign-in') next(from.path)
		else next()
	} else {
		if (to.path === '/auth/sign-in') next()
		else next('/auth/sign-in')
	}
})

router.afterEach((to) => {
	const appStore = useAppStore()

	appStore.showSidebar = false
	appStore.selectedMenu = to.meta && to.meta.selectedKey ? to.meta.selectedKey : to.path
	// route 정보로 page title, breadcrumb 설정
	appStore.initBreadcrumb(to)

	nextTick(() => {
		const { pageTitle } = useAppStore()
		document.title =
			`${import.meta.env.VITE_APP_NAME || 'Quasar Game Studio'}` +
			(pageTitle ? ` | ${pageTitle}` : '')
	})
})

export default router
