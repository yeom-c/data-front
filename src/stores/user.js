import { ref } from 'vue'
import { defineStore } from 'pinia'
import { router } from '@/router/index'

export const useUserStore = defineStore(
	'user',
	() => {
		const user = ref({
			isSignIn: false,
			token: null,
			profile: null
		})

		const signIn = (token, profile) => {
			user.value = {
				isSignIn: true,
				token: {
					accessToken: token,
					type: 'bearer'
				},
				profile
			}

			router.push('/')
		}

		const signOut = () => {
			user.value = {
				isSignIn: false,
				token: null,
				profile: null,
			}

			router.push('/auth/sign-in')
		}

		return { user, signIn, signOut }
	},
	{
		persist: true
	}
)
