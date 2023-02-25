<script setup>
import { h, onMounted, ref } from 'vue'
import { router } from '@/router/index'
import { useAppStore } from '@/stores/app'
import { getDataTableList, deleteDataTable } from '@/requests/data-table'
import { getServerList } from '@/requests/server'
import { getDataSchemaList } from '@/requests/data-schema'
import { storeDataMap } from '@/requests/data-map'
import { unapplyMapVersion } from '@/requests/map-version'
import { dataTableTypeEnum, filterOperator } from '@/views/model.js'
import Filter from '@/components/Filter.vue'
import {
	NSpace,
	NButton,
	NIcon,
	NDataTable,
	NPagination,
	NUpload,
	NTag,
	NPopconfirm
} from 'naive-ui'
import { Upload as UploadIcon } from '@vicons/carbon'

const appStore = useAppStore()
const columns = [
	{ type: 'selection', multiple: false },
	{ title: '파일명', key: 'data_table.name' },
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
				NButton,
				{
					type: 'info',
					text: true,
					onClick: () => router.push(`/data/map/${row.data_table.id}`)
				},
				{ default: () => '상세보기' }
			)
		}
	}
]
appStore.filter = {
	name: {
		label: '파일명',
		type: 'input',
		qry: '',
		op: filterOperator.like.op,
		opOptions: [filterOperator.equal, filterOperator.like]
	}
}
const uploadRef = ref(null)
const loading = ref(false)
const selectedRowKey = ref([])
const data = ref([])
const serverList = ref([])
const serverObj = ref({})
const dataSchemaList = ref([])
const dataSchemaObj = ref({})

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

const onUploadFile = async (p) => {
	loading.value = true
	const formData = new FormData()
	if (p.data) {
		Object.keys(p.data).forEach((key) => {
			formData.append(key, p.data[key])
		})
	}
	formData.append('file', p.file.file)
	uploadRef.value.clear()

	const res = await storeDataMap(formData)
		.then((r) => r.data)
		.catch(() => {
			loading.value = false
		})

	if (res?.result === 'ok') {
		fetchData()
	}
	loading.value = false
}

const onUnapplyVersion = async (serverId, tableName) => {
	loading.value = true
	const res = await unapplyMapVersion(serverId, tableName)
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
			qry: dataTableTypeEnum.map,
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
		<n-space :size="5" justify="end" style="margin-bottom: 1rem">
			<n-popconfirm @positive-click="handleDeleteDataTable" width="300">
				<template #trigger>
					<n-button :loading="loading" :disabled="selectedRowKey.length === 0"> 삭제 </n-button>
				</template>
				정말 삭제하시겠습니까?
			</n-popconfirm>
			<n-upload
				ref="uploadRef"
				:show-file-list="false"
				:custom-request="onUploadFile"
				accept="application/json"
				:disabled="loading"
			>
				<n-button type="primary" :loading="loading">
					<template #icon>
						<n-icon>
							<upload-icon />
						</n-icon>
					</template>
					JSON 업로드
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
</template>

<style lang="scss" scoped></style>
