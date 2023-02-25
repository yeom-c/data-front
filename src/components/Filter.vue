<script setup>
import { NSpace, NButton, NIcon, NInput, NInputNumber, NSelect, NDatePicker } from 'naive-ui'
import { Reset as ResetIcon } from '@vicons/carbon'
import { useAppStore } from '@/stores/app'
const { filter, getPagination } = useAppStore()

const emit = defineEmits(['applyFilter'])

const onClearFilter = () => {
	getPagination(true)
	for (const key in filter) {
		filter[key].qry = null
	}
	emit('applyFilter')
}

const onConfirmFilter = () => {
	getPagination(true)
	emit('applyFilter')
}
</script>

<template>
	<div class="rounded-box box-shadow" style="margin: 1.5rem 2rem; padding: 1rem">
		<n-space align="center" :wrap="false" style="overflow-x: auto" :size="10">
			<n-space v-for="(item, key) in filter" vertical :size="2" style="width: 200px">
				<n-input v-if="item.type === 'input'" v-model:value="item.qry" :placeholder="item.label" />
				<n-input-number
					v-if="item.type === 'input-number'"
					v-model:value="item.qry"
					:placeholder="item.label"
					:show-button="false"
				/>
				<n-select
					v-else-if="item.type === 'select'"
					v-model:value="item.qry"
					:options="item.qryOptions"
					:placeholder="item.label"
				/>
				<n-select
					v-else-if="item.type === 'select-multi'"
					v-model:value="item.qry"
					multiple
					:options="item.qryOptions"
					max-tag-count="responsive"
					clearable
					:placeholder="item.label"
				/>
				<n-date-picker
					v-else-if="item.type === 'date'"
					v-model:formatted-value="item.qry"
					value-format="yyyy-MM-dd"
					type="date"
					clearable
				/>
				<n-select v-model:value="item.op" value-field="op" :options="item.opOptions" />
			</n-space>
		</n-space>
		<n-space justify="end" align="center" :size="10">
			<n-button size="small" secondary @click="onClearFilter">
				<n-icon>
					<reset-icon />
				</n-icon>
			</n-button>
			<n-button size="small" @click="onConfirmFilter">확인</n-button>
		</n-space>
	</div>
</template>
