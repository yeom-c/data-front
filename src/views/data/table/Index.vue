<script setup>
import { h, onMounted, onUnmounted, ref } from 'vue'
import { router } from '@/router/index'
import { useAppStore } from '@/stores/app'
import { getDataTableList, storeDataTable, deleteDataTable } from '@/requests/data-table'
import { getServerList } from '@/requests/server'
import { getDataSchemaList, unapplyDataVersion, refreshDataSchema } from '@/requests/data-schema'
import { dataTableTypeEnum, filterOperator } from '@/views/model.js'
import Filter from '@/components/Filter.vue'
import {
	NSpace,
	NButton,
	NIcon,
	NDataTable,
	NPagination,
	NUpload,
	NModal,
	useNotification,
	NTag,
	NBadge,
	NPopconfirm
} from 'naive-ui'
import { Upload as UploadIcon, Renew as RenewIcon } from '@vicons/carbon'
import * as XLSX from 'xlsx/xlsx.mjs'

const notification = useNotification()
const appStore = useAppStore()
const columns = [
	{ type: 'selection', multiple: false },
	{ title: '테이블명', key: 'data_table.name' },
	{ title: '시트명', key: 'data_table.sheet_name' },
	{ title: '최신버전', key: 'data_table.latest_version', align: 'center', width: 80 },
	{
		title: '적용서버',
		key: 'data_version.servers',
		width: 250,
		render(row) {
			return h(NSpace, { size: 5 }, { default: () => applyServersTag(row) })
		}
	},
	{
		key: 'action',
		fixed: 'right',
		width: 100,
		render(row) {
			return h(
				NBadge,
				{ show: row.uploader_list.length > 0, dot: true },
				{
					default: () =>
						h(
							NButton,
							{
								type: 'info',
								text: true,
								onClick: () => router.push(`/data/table/${row.data_table.id}`)
							},
							{ default: () => '상세보기' }
						)
				}
			)
		}
	}
]
appStore.filter = {
	name: {
		label: '테이블명',
		type: 'input',
		qry: '',
		op: filterOperator.like.op,
		opOptions: [filterOperator.equal, filterOperator.like]
	},
	sheet_name: {
		label: '시트명',
		type: 'input',
		qry: '',
		op: filterOperator.like.op,
		opOptions: [filterOperator.equal, filterOperator.like]
	}
}

const loading = ref(false)
const selectedRowKey = ref([])
const data = ref([])
const serverList = ref([])
const serverObj = ref({})
const dataSchemaList = ref([])
const dataSchemaObj = ref({})
const uploadRef = ref(null)
const uploadSchemaColumns = [
	{ type: 'selection' },
	{ title: '테이블명', key: 'table_name' },
	{ title: '시트명', key: 'sheet_name' }
]
const uploadSchemaData = ref([])
const uploadModal = ref({
	visible: false,
	formData: null
})
const uploadSchemaRowKey = (row) => row.sheet_name
const onCheckUploadSchema = (rowKeys) => {
	uploadModal.value.formData.set('sheet', rowKeys)
}

const applyServersTag = (row) => {
	return row.data_table.servers?.map((server) => {
		return h(
			NTag,
			{
				size: 'small',
				closable: true,
				onClose: () => onUnapplyVersion(server.id, row.data_table.name)
			},
			{ default: () => `${server.name} v.${server.version}` }
		)
	})
}

let timerId
const toggleType = ref('default')
const autoToggleType = (type, type2) => {
	timerId = setInterval(() => {
		toggleType.value = toggleType.value == type ? type2 : type
	}, 1500)
}

const handleDeleteDataTable = async () => {
	if (selectedRowKey.value.length > 0) {
		loading.value = true
		const res = await deleteDataTable(selectedRowKey.value[0])
			.then((r) => r.data)
			.catch(() => {
				loading.value = false
			})

		if (res?.result === 'ok') {
			await fetchData()
		}
		selectedRowKey.value = []
		loading.value = false
	}
}

const handlePage = () => {
	fetchData()
}

const handlePageSize = () => {
	appStore.getPagination().page = 1
	fetchData()
}

const onRefreshSchema = async () => {
	loading.value = true
	const res = await refreshDataSchema()
		.then((r) => r.data)
		.catch(() => {
			loading.value = false
		})
	loading.value = false
}

const onOpenUploadModal = async (p) => {
	loading.value = true
	const data = await p.file.file.arrayBuffer()
	const workbook = XLSX.read(data)
	const schemaSheetRows = XLSX.utils.sheet_to_json(workbook.Sheets['Schema'])
	if (schemaSheetRows.length > 0) {
		const tablesName = []
		schemaSheetRows.forEach((row) => {
			if (row.SHEET) {
				const tableName = row.SHEET.replaceAll(' ', '_').toLowerCase()
				if (!tablesName.includes(tableName)) {
					tablesName.push(tableName)
					uploadSchemaData.value.push({
						table_name: tableName,
						sheet_name: row.SHEET
					})
				}
			}
		})

		const formData = new FormData()
		if (p.data) {
			Object.keys(p.data).forEach((key) => {
				formData.append(key, p.data[key])
			})
		}
		formData.append('file', p.file.file)
		uploadModal.value.formData = formData
		uploadModal.value.visible = true
	} else {
		notification['error']({
			content: '업로드 실패',
			meta: 'Schema 시트 없음',
			duration: 3000
		})
	}

	uploadRef.value.clear()
	loading.value = false
}

const onCloseUploadModal = () => {
	uploadSchemaData.value = []
	uploadModal.value = { visible: false, formData: null }
}

const onUploadFile = async () => {
	loading.value = true
	if (uploadModal.value.formData.get('sheet')?.length > 0) {
		const res = await storeDataTable(uploadModal.value.formData)
			.then((r) => r.data)
			.catch(() => {
				loading.value = false
			})

		if (res?.result === 'ok') {
			fetchData()
			onCloseUploadModal()
		}
	}
	loading.value = false
}

const onUnapplyVersion = async (serverId, tableName) => {
	loading.value = true
	const res = await unapplyDataVersion(serverId, tableName)
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
	data.value.forEach(({ data_table }) => {
		data_table.servers = []
		dataSchemaList.value.forEach((dataSchema) => {
			if (dataSchema.version) {
				const versionObj = JSON.parse(dataSchema.version)
				if (versionObj[data_table.name]) {
					dataSchema.server.version = versionObj[data_table.name]
					const server = {
						...dataSchema.server
					}
					data_table.servers.push(server)
				}
			}
		})
	})
}

const fetchData = async () => {
	appStore.dataLoading = true
	let filter = {
		type: {
			qry: dataTableTypeEnum.data,
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

	const res = await getDataTableList({
		filter: filter,
		page: appStore.getPagination().page,
		limit: appStore.getPagination().pageSize
	}).then((r) => r.data)
	data.value = res.data_table_list
	appStore.getPagination().total = res.total
	selectedRowKey.value = []

	const serverListRes = await getServerList().then((r) => r.data)
	serverList.value = serverListRes.server_list
	for (const server of serverList.value) {
		serverObj.value[server.id] = server
	}
	const dataSchemaListRes = await getDataSchemaList({
		filter: { type: { qry: dataTableTypeEnum.data, op: filterOperator.equal.op } },
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
	autoToggleType('default', 'primary')
	try {
		await fetchData()
	} catch (e) {
		console.error(e)
	}
})

onUnmounted(() => {
	clearInterval(timerId)
})
</script>

<template>
	<Filter @applyFilter="fetchData" />
	<div class="rounded-box box-shadow" style="margin: 1.5rem 2rem; padding: 1rem">
		<n-space :size="5" justify="end" style="margin-bottom: 1rem">
			<n-popconfirm @positive-click="handleDeleteDataTable" width="300">
				<template #trigger>
					<n-button :loading="loading" :disabled="selectedRowKey.length === 0"> 삭제 </n-button>
				</template>
				정말 삭제하시겠습니까?
			</n-popconfirm>
			<n-button :type="toggleType" :loading="loading" @click="onRefreshSchema">
				<template #icon>
					<n-icon>
						<renew-icon />
					</n-icon>
				</template>
				데이터 캐시
			</n-button>
			<n-upload
				ref="uploadRef"
				:show-file-list="false"
				:custom-request="onOpenUploadModal"
				accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				:disabled="loading"
			>
				<n-button type="primary" :loading="loading">
					<template #icon>
						<n-icon>
							<upload-icon />
						</n-icon>
					</template>
					엑셀 업로드
				</n-button>
			</n-upload>
		</n-space>
		<n-data-table
			v-model:checked-row-keys="selectedRowKey"
			:row-key="(row) => row.data_table.id"
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
		v-model:show="uploadModal.visible"
		title="업로드 스키마 확인"
		:mask-closable="false"
		:show-icon="false"
		preset="dialog"
		@close="onCloseUploadModal"
		@esc="onCloseUploadModal"
		style="width: 600px"
	>
		<n-data-table
			:columns="uploadSchemaColumns"
			:data="uploadSchemaData"
			:row-key="uploadSchemaRowKey"
			@update:checked-row-keys="onCheckUploadSchema"
			:bordered="false"
			size="small"
			:max-height="400"
			scroll-x="600"
		/>
		<template #action>
			<n-button @click="onCloseUploadModal">취소</n-button>
			<n-button @click="onUploadFile" type="primary" :loading="loading"> 확인 </n-button>
		</template>
	</n-modal>
</template>

<style lang="scss" scoped></style>
