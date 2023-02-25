import axios from 'axios'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const service = axios.create({
	baseURL: import.meta.env.VITE_API_HOST,
	withCredentials: true,
	timeout: 10000
})

// request 전처리
service.interceptors.request.use(
	(config) => {
		const { user } = useUserStore()
		const token = user.token
		if (token) config.headers.common.Authorization = `${token.type} ${token.accessToken}`
		else delete config.headers.common.Authorization

		return config
	},
	(error) => {
		console.error('request error: ' + error)

		return Promise.reject(error)
	}
)

// response 전처리
service.interceptors.response.use(
	(response) => {
		const content_type = response.headers['content-type']
		if (content_type == undefined || !content_type.includes('application/json')) {
			console.error('response content-type is not application/json')
		} else return response
	},
	(error) => {
		const message = error.response?.data?.error ? error.response.data.error : error.message
		useAppStore().pushErrorMessage(message)

		if (error.response.status === 401) {
			useUserStore().signOut()
		}

		return Promise.reject(error)
	}
)

export default service
