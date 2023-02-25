import { defineStore } from 'pinia'
import router from '@/router/index.js'

export const useAppStore = defineStore('app', {
	state: () => {
		const responsiveWidth = {
			sm: 640,
			md: 768,
			lg: 1024,
			xl: 1280,
			'2xl': 1536
		}

		const appName = import.meta.env.VITE_APP_NAME || 'Quasar Game Studio'
		const pageTitle = ''
		const breadcrumb = []
		const isDesktop = window.innerWidth >= responsiveWidth.lg
		const hideSidebar = false
		const showSidebar = false
		const selectedMenu = ''
		const dataLoading = false
		const errorMessages = []
		const filter = {}
		const routePagination = {}

		return {
			responsiveWidth,
			appName,
			pageTitle,
			breadcrumb,
			isDesktop,
			hideSidebar,
			showSidebar,
			selectedMenu,
			errorMessages,
			dataLoading,
			filter,
			routePagination
		}
	},
	actions: {
		initBreadcrumb(route) {
			this.pageTitle = ''
			this.breadcrumb = []
			route.matched.forEach((match) => {
				this.pageTitle = match.meta.title
				this.addBreadcrumb(match.meta.title, match.path)
			})
		},
		addBreadcrumb(title, path = null) {
			this.breadcrumb.push({
				title,
				path
			})
		},
		pushErrorMessage(message) {
			this.errorMessages.push(message)
		},
		getPagination(reset = false) {
			if (reset || !this.routePagination[router.currentRoute.value.path]) {
				this.routePagination[router.currentRoute.value.path] = {
					total: 0,
					page: 1,
					pageSize: 15
				}
			}

			return this.routePagination[router.currentRoute.value.path]
		}
	},
	getters: {
		pageCount(state) {
			let res = 0
			const pagination = state.routePagination[router.currentRoute.value.path]
			if (pagination) {
				if (pagination.total > 0) {
					res =
						Math.floor(pagination.total / pagination.pageSize) +
						(pagination.total % pagination.pageSize > 0 ? 1 : 0)
				}
			}
			return res
		}
	}
})
