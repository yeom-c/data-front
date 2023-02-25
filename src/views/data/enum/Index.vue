<script setup>
import { h, onMounted, onUnmounted, ref } from 'vue'
import { router } from '@/router/index'
import { useAppStore } from '@/stores/app'
import { getDataTableList } from '@/requests/data-table'
import { refreshDataEnum, storeDataEnum } from '@/requests/data-enum'
import { dataTableTypeEnum, filterOperator } from '@/views/model.js'
import Filter from '@/components/Filter.vue'
import { NSpace, NButton, NIcon, NDataTable, NPagination, NUpload } from 'naive-ui'
import { Upload as UploadIcon, Renew as RenewIcon } from '@vicons/carbon'

const appStore = useAppStore()
const columns = [
	{ title: '테이블명', key: 'data_table.name' },
	{ title: '시트명', key: 'data_table.sheet_name' },
	{ title: '최신버전', key: 'data_table.latest_version', align: 'center', width: 80 },
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
					onClick: () => router.push(`/data/enum/${row.data_table.id}`)
				},
				{ default: () => '상세보기' }
			)
		}
	}
]
const data = ref([])
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
const uploadRef = ref(null)
const loading = ref(false)

let timerId
const toggleType = ref('default')
const autoToggleType = (type, type2) => {
	timerId = setInterval(() => {
		toggleType.value = toggleType.value == type ? type2 : type
	}, 1500)
}

const handlePage = () => {
	fetchData()
}

const handlePageSize = () => {
	appStore.getPagination().page = 1
	fetchData()
}

const onRefreshEnum = async () => {
	loading.value = true
	const res = await refreshDataEnum()
		.then((r) => r.data)
		.catch(() => {
			loading.value = false
		})
	loading.value = false
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

	const res = await storeDataEnum(formData)
		.then((r) => r.data)
		.catch(() => {
			loading.value = false
		})

	if (res?.result === 'ok') {
		fetchData()
	}
	loading.value = false
}

const fetchData = async () => {
	appStore.dataLoading = true
	let filter = {
		type: {
			qry: dataTableTypeEnum.enum,
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
			<n-button :type="toggleType" :loading="loading" @click="onRefreshEnum">
				<template #icon>
					<n-icon>
						<renew-icon />
					</n-icon>
				</template>
				이넘 캐시
			</n-button>
			<n-upload
				ref="uploadRef"
				:show-file-list="false"
				:custom-request="onUploadFile"
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
