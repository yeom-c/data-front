<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { getDashboard } from '@/requests/dashboard'
import { NCard, NSpace } from 'naive-ui'

const appStore = useAppStore()

const fetchData = async () => {
	appStore.dataLoading = true
	const res = await getDashboard().then((r) => r.data)
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
</template>

<style lang="scss" scoped></style>
