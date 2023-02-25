<script setup>
import { watch } from 'vue'
import { useAppStore } from '@/stores/app'
import {
	NLayout,
	NLayoutSider,
	NLayoutHeader,
	NLayoutContent,
	NLayoutFooter,
	NDrawer,
	NDrawerContent,
	NSpace,
	NText,
	NH3,
	useNotification
} from 'naive-ui'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

const appStore = useAppStore()
const notification = useNotification()
watch(appStore.errorMessages, (msgs) => {
	msgs.forEach((msg) =>
		notification['error']({
			content: '요청 처리 실패',
			meta: msg,
			duration: 3000
		})
	)

	// clear error messages
	msgs.length = 0
})
</script>

<template>
	<n-layout has-sider style="height: 100vh">
		<n-layout-sider
			v-if="appStore.isDesktop"
			class="box-shadow"
			inverted
			collapse-mode="width"
			:collapsed-width="64"
			:width="260"
			:native-scrollbar="false"
			show-trigger="bar"
			:collapsed="appStore.hideSidebar"
			@collapse="appStore.hideSidebar = true"
			@expand="appStore.hideSidebar = false"
		>
			<Sidebar />
		</n-layout-sider>
		<n-drawer
			v-else
			v-model:show="appStore.showSidebar"
			:width="260"
			placement="left"
			style="background-color: rgb(0, 20, 40)"
		>
			<n-drawer-content closable body-content-style="padding:0">
				<template #header>
					<n-space :wrap="false" align="center">
						<div class="quasar-icon-64-white" style="width: 48px; height: 52px" />
						<n-h3 style="margin: 0">
							<n-text style="font-weight: bold; color: white">
								{{ appStore.appName }}
							</n-text>
						</n-h3>
					</n-space>
				</template>
				<Sidebar />
			</n-drawer-content>
		</n-drawer>
		<n-layout class="bg-slate-100" :native-scrollbar="false">
			<n-layout-header class="bg-slate-100 text-slate-600">
				<Header />
			</n-layout-header>
			<n-layout-content class="layout-content bg-slate-100 text-slate-600">
				<div :class="appStore.dataLoading ? 'blur-screen' : ''">
					<router-view />
				</div>
			</n-layout-content>
			<n-layout-footer class="bg-slate-100"><Footer /></n-layout-footer>
		</n-layout>
	</n-layout>
</template>

<style lang="scss" scoped>
.layout-content {
	margin-top: 105px;
	min-height: calc(100vh - 145px);
}
</style>
