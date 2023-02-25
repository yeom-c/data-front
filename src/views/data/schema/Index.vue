<script setup>
import { onMounted, nextTick, ref, h, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { getServerList } from '@/requests/server'
import {
	getDataSchema,
	storeDataSchema,
	deleteDataSchema,
	updateDataSchema,
	unapplyDataVersion
} from '@/requests/data-schema'
import {
	NTabs,
	NTabPane,
	NDataTable,
	NSpace,
	NButton,
	NIcon,
	NModal,
	NForm,
	NFormItem,
	NInput,
	NSwitch
} from 'naive-ui'
import { Add as AddIcon, Subtract as SubtractIcon } from '@vicons/carbon'
import { dataTableTypeEnum, trueFalseEnum } from '@/views/model'

const appStore = useAppStore()
const loading = ref(false)
const serverList = ref([])
const serverObj = ref({})
const tabsRef = ref(null)
const selectedTab = ref('')
const dataSchema = ref({})
const versionColumns = [
	{ title: '테이블명', key: 'name' },
	{ title: '버전', key: 'version', width: 120 },
	{
		fixed: 'right',
		width: 120,
		render(row) {
			return h(
				NButton,
				{
					size: 'small',
					type: 'error',
					loading: loading.value,
					onClick: () => onUnapplyVersion(row.name)
				},
				{ default: () => '미적용' }
			)
		}
	}
]
const showModal = ref(false)
const formRef = ref(null)
const formData = ref({
	env: '',
	name: '',
	description: ''
})
const formRules = {
	env: [
		{
			required: true,
			message: '서버 환경 코드를 입력해주세요.',
			trigger: ['blur', 'input']
		}
	],
	name: [
		{
			required: true,
			message: '서버 환경명을 입력해주세요.',
			trigger: ['blur', 'input']
		}
	]
}

const onAddTab = async (e) => {
	e.preventDefault()
	showModal.value = true
}

const onDeleteTab = async (e) => {
	e.preventDefault()
	loading.value = true
	const res = await deleteDataSchema(serverObj.value[selectedTab.value].id)
		.then((r) => r.data)
		.catch(() => {
			loading.value = false
		})

	if (res?.result === 'ok') {
		fetchData()
	}
	loading.value = false
}

const onUpdateTab = async (v) => {
	selectedTab.value = v
	await nextTick(() => tabsRef.value?.syncBarPosition())

	appStore.dataLoading = true
	const res = await getDataSchema(dataTableTypeEnum.data, serverObj.value[v].id).then((r) => r.data)
	dataSchema.value = res.data_schema
	appStore.dataLoading = false
}

const handleUpdateLock = async (value) => {
	loading.value = true
	const res = await updateDataSchema(dataSchema.value)
		.then((r) => r.data)
		.catch(() => {
			loading.value = false
		})

	if (res?.result === 'ok') {
		onUpdateTab(selectedTab.value)
	}
	loading.value = false
}

const onUnapplyVersion = async (tableName) => {
	loading.value = true
	const serverId = serverObj.value[selectedTab.value].id
	const res = await unapplyDataVersion(serverId, tableName)
		.then((r) => r.data)
		.catch(() => {
			loading.value = false
		})

	if (res?.result === 'ok') {
		onUpdateTab(selectedTab.value)
	}
	loading.value = false
}

const onCloseModal = () => {
	formData.value = {
		env: '',
		name: '',
		description: ''
	}
	showModal.value = false
}

const onSubmitForm = async () => {
	formRef.value?.validate(async (errors) => {
		if (!errors) {
			loading.value = true
			const res = await storeDataSchema(formData.value)
				.then((r) => r.data)
				.catch(() => {
					loading.value = false
				})

			if (res?.result === 'ok') {
				fetchData()
				onCloseModal()
			}
			loading.value = false
		}
	})
}

const fetchData = async () => {
	appStore.dataLoading = true
	const res = await getServerList().then((r) => r.data)
	serverList.value = res.server_list
	for (const server of res.server_list) {
		serverObj.value[server.env] = server
	}
	appStore.dataLoading = false

	selectedTab.value = null
	if (serverList.value[0]) {
		onUpdateTab(serverList.value[0].env)
	}
}

const versionData = computed(() => {
	let list = []
	if (dataSchema.value?.version) {
		for (const [tableName, version] of Object.entries(JSON.parse(dataSchema.value.version))) {
			list.push({
				name: tableName,
				version: version
			})
		}
	}

	return list
})

onMounted(async () => {
	try {
		await fetchData()
	} catch (e) {
		console.error(e)
	}
})
</script>

<template>
	<div class="rounded-box box-shadow" style="margin: 1.5rem 2rem; padding: 1rem">
		<n-tabs ref="tabsRef" v-model:value="selectedTab" type="bar" @update:value="onUpdateTab">
			<n-tab-pane
				v-for="server in serverList"
				:key="server.env"
				:name="server.env"
				:tab="server.name"
			>
				<n-space :size="5" justify="end" style="margin-bottom: 1rem">
					<n-switch
						v-model:value="dataSchema.update_lock"
						:checked-value="trueFalseEnum.true"
						:unchecked-value="trueFalseEnum.false"
						:rail-style="
							({ focused, checked }) => {
								const style = {}
								if (checked) {
									style.background = '#a72939'
									if (focused) {
										style.boxShadow = '0 0 0 2px #d0305040'
									}
								} else {
									style.background = '#13406f'
									if (focused) {
										style.boxShadow = '0 0 0 2px #2080f040'
									}
								}
								return style
							}
						"
						@update:value="handleUpdateLock"
					>
						<template #checked> 변경 불가 </template>
						<template #unchecked> 변경 가능 </template>
					</n-switch>
				</n-space>
				<n-data-table
					:columns="versionColumns"
					:data="versionData"
					:bordered="false"
					:max-height="530"
					scroll-x="500"
				/>
			</n-tab-pane>
			<template #suffix>
				<n-space :size="5">
					<n-button
						v-if="selectedTab"
						size="small"
						ghost
						circle
						:loading="loading"
						@click="onDeleteTab"
					>
						<template #icon>
							<n-icon><subtract-icon /></n-icon>
						</template>
					</n-button>
					<n-button size="small" type="primary" ghost circle :loading="loading" @click="onAddTab">
						<template #icon>
							<n-icon><add-icon /></n-icon>
						</template>
					</n-button>
				</n-space>
			</template>
		</n-tabs>
	</div>

	<n-modal
		v-model:show="showModal"
		title="스키마 생성"
		:mask-closable="false"
		preset="dialog"
		:show-icon="false"
		@close="onCloseModal"
		@esc="onCloseModal"
		style="width: 600px"
	>
		<n-form ref="formRef" :model="formData" :rules="formRules">
			<n-form-item path="env" label="서버 환경 코드">
				<n-input v-model:value="formData.env" placeholder="develop" @keydown.enter.prevent />
			</n-form-item>
			<n-form-item path="name" label="서버 환경명">
				<n-input v-model:value="formData.name" placeholder="개발 환경" @keydown.enter.prevent />
			</n-form-item>
			<n-form-item path="description" label="서버 환경 설명">
				<n-input
					v-model:value="formData.description"
					placeholder="개발을 위한 서버 환경"
					@keydown.enter.prevent
				/>
			</n-form-item>
		</n-form>
		<template #action>
			<n-button @click="onCloseModal">취소</n-button>
			<n-button @click="onSubmitForm" type="primary" :loading="loading"> 확인 </n-button>
		</template>
	</n-modal>
</template>

<style lang="scss" scoped></style>
