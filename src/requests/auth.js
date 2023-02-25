import request from './index'

export const postSignIn = (data) => {
	return request({ url: '/sign-in', method: 'post', data })
}
