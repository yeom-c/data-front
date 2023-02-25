<script setup>
import { h, onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { router } from '@/router/index'
import { getDataTable } from '@/requests/data-table'
import { getMapVersionList, updateMapVersion, applyMapVersion } from '@/requests/map-version'
import { getDataSchemaList } from '@/requests/data-schema'
import { getServerList } from '@/requests/server'
import {
	dataTableTypeEnum,
	dataVersionStatusEnum,
	dataVersionStatusObj,
	filterOperator
} from '@/views/model'
import {
	NDataTable,
	NPagination,
	NDropdown,
	NButton,
	NTag,
	NModal,
	NIcon,
	NForm,
	NFormItem,
	NInput,
	NSpace
} from 'naive-ui'
import { Chat as ChatIcon } from '@vicons/carbon'
import Filter from '@/components/Filter.vue'
import dayjs from 'dayjs'

const appStore = useAppStore()
const props = defineProps({
	id: {
		type: String,
		default: null
	}
})

const columns = [
	{ title: '버전', key: 'map_version.version', align: 'center', width: 80 },
	{
		title: '상태',
		key: 'map_version.status',
		align: 'center',
		width: 80,
		render(row) {
			return h(
				NTag,
				{ type: dataVersionStatusObj[row.map_version.status]?.type, size: 'small' },
				{ default: () => dataVersionStatusObj[row.map_version.status]?.name }
			)
		}
	},
	{
		title: '데이터',
		key: 'map_version.data',
		align: 'center',
		width: 80,
		render(row) {
			return row.map_version.status === dataVersionStatusEnum.error ? null : dataButton(row)
		}
	},
	{
		title: '메모',
		key: 'map_version.memo',
		render(row) {
			return h(
				NButton,
				{
					type: 'warning',
					text: true,
					onClick: () => onOpenMemoFormModal(row.map_version),
					style: row.map_version.memo_title ? '' : 'font-size: 20px'
				},
				{
					default: () =>
						row.map_version.memo_title
							? row.map_version.memo_title
							: h(NIcon, {}, { default: () => h(ChatIcon) })
				}
			)
		}
	},
	{
		title: '적용서버',
		key: 'map_version.servers',
		width: 200,
		render(row) {
			if (row.map_version.status === dataVersionStatusEnum.complete)
				return h(NSpace, { size: 5 }, { default: () => applyServersTag(row) })
		}
	},
	{ title: '관리자', key: 'user.name', align: 'center', width: 100 },
	{
		title: '생성일',
		key: 'map_version.created_at',
		align: 'center',
		width: 160,
		render(row) {
			return row.map_version.created_at
				? dayjs(row.map_version.created_at).tz().format('YYYY-MM-DD HH:mm:ss')
				: ''
		}
	},
	{
		key: 'action',
		fixed: 'right',
		width: 120,
		render(row) {
			return [
				row.map_version.status === dataVersionStatusEnum.error
					? errorButton(row)
					: dataTable.value.type === dataTableTypeEnum.map
					? applyButton(row)
					: null,
				row.upload_list.length > 0 ? downloadButton(row.upload_list) : null
			]
		}
	}
]
appStore.filter = {
	memo: {
		label: '메모',
		type: 'input',
		qry: '',
		op: filterOperator.like.op,
		opOptions: [filterOperator.like]
	},
	'user.name': {
		label: '관리자',
		type: 'input',
		qry: '',
		op: filterOperator.equal.op,
		opOptions: [filterOperator.equal, filterOperator.like]
	}
}

const loading = ref(false)
const data = ref([])
const dataTable = ref({})
const serverList = ref([])
const serverObj = ref({})
const dataSchemaList = ref([])
const dataSchemaObj = ref({})
const jsonViewerModalData = ref({ visible: false, title: '', message: '' })
const memoFormModal = ref({ visible: false, form: { id: 0, memo_title: '', memo: '' } })

const dataButton = (row) => {
	return h(
		NButton,
		{
			size: 'small',
			onClick: () =>
				onOpenJsonViewerModal(
					`${dataTable.value.sheet_name} v.${row.map_version.version} by ${row.user.name}`,
					row.map_version.data
				)
		},
		{
			default: () => '보기'
		}
	)
}

const applyServersTag = (row) => {
	return row.map_version.servers?.map((server) => {
		return h(NTag, { size: 'small' }, { default: () => server.name })
	})
}

const applyButton = (row) => {
	return h(
		NDropdown,
		{
			width: 200,
			trigger: 'click',
			options:
				serverList.value.length > 0
					? serverList.value.map((server) => {
							return { label: server.name, key: server.id }
					  })
					: [{ label: '스키마 생성 필요', key: -1 }],
			onSelect: (serverId) =>
				serverId === -1 ? router.push('/data/schema') : onApplyVersion(serverId, row.map_version.id)
		},
		{
			default: () =>
				h(
					NButton,
					{ type: 'primary', size: 'small', style: 'width: 100%', loading: loading.value },
					{ default: () => '적용' }
				)
		}
	)
}

const errorButton = (row) => {
	return h(
		NButton,
		{
			size: 'small',
			type: 'error',
			style: 'width: 100%',
			onClick: () =>
				onOpenJsonViewerModal(
					`${dataTable.value.sheet_name} v.${row.map_version.version} by ${row.user.name}`,
					row.map_version.error
				)
		},
		{
			default: () => '에러'
		}
	)
}

const downloadButton = (upload_list) => {
	return h(
		NDropdown,
		{
			width: 200,
			trigger: 'click',
			options: upload_list.map((upload) => {
				return { label: upload.file_name, key: upload.id, url: upload.url }
			}),
			renderLabel: (option) => {
				return h(
					'a',
					{
						href: option.url,
						style: 'display: block; width: 150px; overflow: auto'
					},
					{
						default: () => option.label
					}
				)
			}
		},
		{
			default: () =>
				h(NButton, { size: 'small', style: 'width: 100%' }, { default: () => '다운로드' })
		}
	)
}

const onOpenJsonViewerModal = (title, message) => {
	jsonViewerModalData.value = {
		visible: true,
		title,
		message: message ? JSON.parse(message) : null
	}
}

const onCloseJsonViewerModal = () => {
	jsonViewerModalData.value = { visible: false, title: '', message: '' }
}

const onOpenMemoFormModal = (dataVersion) => {
	memoFormModal.value = {
		visible: true,
		form: {
			id: dataVersion.id,
			memo_title: dataVersion.memo_title,
			memo: dataVersion.memo
		}
	}
}

const onCloseMemoFormModal = () => {
	memoFormModal.value = { visible: false, form: { memo_title: '', memo: '' } }
}

const onSubmitMemoForm = async (e) => {
	e.preventDefault()
	loading.value = true
	const res = await updateMapVersion(memoFormModal.value.form)
		.then((r) => r.data)
		.catch(() => {
			loading.value = false
		})

	if (res?.result === 'ok') {
		fetchData()
		onCloseMemoFormModal()
	}
	loading.value = false
}

const onApplyVersion = async (serverId, versionId) => {
	loading.value = true
	const res = await applyMapVersion(serverId, versionId)
		.then((r) => r.data)
		.catch(() => {
			loading.value = false
		})

	if (res?.result === 'ok') {
		fetchData()
	}
	loading.value = false
}

const setAppliedServer = () => {
	data.value.forEach(({ map_version }) => {
		map_version.servers = []
		dataSchemaList.value.forEach((dataSchema) => {
			if (dataSchema.version) {
				const versionObj = JSON.parse(dataSchema.version)
				if (versionObj[dataTable.value.name] == map_version.version) {
					map_version.servers.push(dataSchema.server)
				}
			}
		})
	})
}

const handlePage = () => {
	fetchData()
}

const handlePageSize = () => {
	appStore.getPagination().page = 1
	fetchData()
}

const fetchData = async () => {
	appStore.dataLoading = true
	if (props.id) {
		const res = await getDataTable(props.id).then((r) => r.data)
		dataTable.value = res.data_table
		appStore.pageTitle = res.data_table.sheet_name
	}

	let filter = {
		'map_version.data_table_id': {
			qry: props.id,
			op: filterOperator.equal.op
		}
	}
	for (const key in appStore.filter) {
		const item = appStore.filter[key]
		filter[key] = {
			qry: item.qry,
			op: item.op
		}
	}
	const res = await getMapVersionList({
		filter: filter,
		page: appStore.getPagination().page,
		limit: appStore.getPagination().pageSize
	}).then((r) => r.data)
	data.value = res.map_version_list

	const serverListRes = await getServerList().then((r) => r.data)
	serverList.value = serverListRes.server_list
	for (const server of serverList.value) {
		serverObj.value[server.id] = server
	}
	const dataSchemaListRes = await getDataSchemaList({
		filter: { type: { qry: dataTableTypeEnum.map, op: filterOperator.equal.op } },
		page: 0,
		limit: 0
	}).then((r) => r.data)
	dataSchemaList.value = dataSchemaListRes.data_schema_list
	for (const dataSchema of dataSchemaList.value) {
		dataSchema.server = serverObj.value[dataSchema.server_id]
		dataSchemaObj.value[dataSchema.id] = dataSchema
	}
	setAppliedServer()
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
	<Filter @applyFilter="fetchData" />
	<div class="rounded-box box-shadow" style="margin: 1.5rem 2rem; padding: 1rem">
		<n-data-table
			:columns="columns"
			:data="data"
			:bordered="false"
			:max-height="530"
			scroll-x="630"
		/>
		<n-pagination
			v-model:page="appStore.getPagination().page"
			v-model:pageSize="appStore.getPagination().pageSize"
			:page-count="appStore.pageCount"
			:page-slot="5"
			:page-sizes="[15, 50, 100]"
			show-size-picker
			@update:page="handlePage"
			@update:pageSize="handlePageSize"
			style="margin-top: 1rem; justify-content: end"
		/>
	</div>
	<n-modal
		v-model:show="jsonViewerModalData.visible"
		:title="jsonViewerModalData.title"
		:mask-closable="false"
		:show-icon="false"
		preset="card"
		@close="onCloseJsonViewerModal"
		@esc="onCloseJsonViewerModal"
		style="width: 100%; height: 100vh"
	>
		<JsonViewer
			:value="jsonViewerModalData.message"
			:expanded="true"
			:expand-depth="3"
			copyable
			boxed
			sort
			theme="jv-light"
			class="json-viewer"
		/>
	</n-modal>
	<n-modal
		v-model:show="memoFormModal.visible"
		:mask-closable="false"
		:show-icon="false"
		preset="dialog"
		@close="onCloseMemoFormModal"
		@esc="onCloseMemoFormModal"
		style="width: 600px"
	>
		<n-form ref="formRef" :model="memoFormModal.form">
			<n-form-item path="memo_title" label="제목">
				<n-input
					v-model:value="memoFormModal.form.memo_title"
					placeholder="제목"
					@keydown.enter.prevent
				/>
			</n-form-item>
			<n-form-item path="memo" label="내용">
				<n-input
					v-model:value="memoFormModal.form.memo"
					type="textarea"
					rows="10"
					placeholder="내용"
				/>
			</n-form-item>
		</n-form>
		<template #action>
			<n-button @click="onCloseMemoFormModal">취소</n-button>
			<n-button @click="onSubmitMemoForm" type="primary" :loading="loading"> 확인 </n-button>
		</template>
	</n-modal>
</template>

<style lang="scss">
.jv-container .jv-code.open {
	max-height: calc(100vh - 170px) !important;
}
</style>
