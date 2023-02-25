<script setup>
import { onMounted, ref } from 'vue'
import {
	NGrid,
	NGridItem,
	NScrollbar,
	NSpace,
	NAvatar,
	NForm,
	NFormItem,
	NInput,
	NColorPicker,
	NCard,
	NButton
} from 'naive-ui'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { getProfile, storeProfile } from '@/requests/user'

const appStore = useAppStore()
const userStore = useUserStore()
const rules = {
	name: [
		{
			required: true,
			message: '이름을 입력해주세요.',
			trigger: ['blur']
		}
	],
	password: [
		{
			min: 6,
			message: '6자리 이상 입력해주세요.',
			trigger: ['blur']
		}
	]
}

const loading = ref(false)
const formRef = ref(null)
const formData = ref({
	name: '',
	password: '',
	position: '',
	color: ''
})
const teamUsers = ref([])

const onSubmitForm = async (e) => {
	e.preventDefault()
	formRef.value?.validate(async (errors) => {
		if (!errors) {
			loading.value = true
			const res = await storeProfile(formData.value)
				.then((r) => r.data)
				.catch(() => {
					loading.value = false
				})

			if (res?.result === 'ok') {
				fetchData()
			}
			loading.value = false
		}
	})
}

const fetchData = async () => {
	appStore.dataLoading = true
	const res = await getProfile().then((r) => r.data)
	userStore.user.profile = res.user
	formData.value.name = res.user.name
	formData.value.position = res.user.position
	formData.value.color = res.user.color
	appStore.dataLoading = false
}

onMounted(async () => {
	try {
		await fetchData()
	} catch (e) {
		console.error(e)
	}
})
</script>

<template>
	<n-space
		class="rounded-box box-shadow"
		align="center"
		:size="25"
		:wrap="false"
		style="margin: 2rem; padding: 1rem"
	>
		<n-avatar :size="60" :color="userStore.user.profile?.color" style="display: flex">
			<span style="font-size: 24px">
				{{ userStore.user.profile?.name[0] }}
			</span>
		</n-avatar>
		<n-space vertical :size="0">
			<span>{{ userStore.user.profile?.position }}</span>
			<span style="font-size: 24px">{{ userStore.user.profile?.name }}</span>
			<span style="word-break: break-all">{{ userStore.user.profile?.email }}</span>
		</n-space>
	</n-space>
	<div style="margin: 1.5rem 2rem; overflow-y: auto">
		<n-grid cols="1 640:2 1024:3" :x-gap="20" :y-gap="20">
			<n-grid-item>
				<n-card class="rounded-box box-shadow" :bordered="false" style="height: 100%">
					<template #header>
						<span class="text-slate-600"> 정보 수정 </span>
					</template>
					<n-scrollbar style="height: 340px">
						<n-form ref="formRef" :model="formData" :rules="rules">
							<n-form-item path="name" label="이름">
								<n-input v-model:value="formData.name" placeholder="이름" @keydown.enter.prevent />
							</n-form-item>
							<n-form-item path="password" label="비밀번호">
								<n-input
									v-model:value="formData.password"
									placeholder="6자리 이상"
									type="password"
									show-password-on="mousedown"
									@keydown.enter.prevent
								/>
							</n-form-item>
							<n-form-item path="position" label="포지션">
								<n-input
									v-model:value="formData.position"
									placeholder="업무 포지션"
									@keydown.enter.prevent
								/>
							</n-form-item>
							<n-form-item path="color" label="개인 색상">
								<n-color-picker
									v-model:value="formData.color"
									:show-alpha="false"
									:modes="['hex']"
								/>
							</n-form-item>
						</n-form>
					</n-scrollbar>
					<template #footer>
						<n-space :size="5" justify="end">
							<n-button type="primary" :loading="loading" @click="onSubmitForm($event)">
								확인
							</n-button>
						</n-space>
					</template>
				</n-card>
			</n-grid-item>
		</n-grid>
	</div>
</template>

<style lang="scss" scoped></style>
