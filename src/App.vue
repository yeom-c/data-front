<script setup>
import { watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useAppStore } from '@/stores/app'
import AppProvider from '@/components/AppProvider.vue'

const { width } = useWindowSize()
const appStore = useAppStore()

watch(width, (value) => {
	appStore.isDesktop = value >= appStore.responsiveWidth.lg
})
</script>

<template>
	<AppProvider>
		<router-view />
	</AppProvider>
</template>
