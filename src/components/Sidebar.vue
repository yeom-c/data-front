<script setup>
import { useAppStore } from '@/stores/app'
import { router, menuRoutes } from '@/router/index'
import { NSpace, NMenu, NText, NH3 } from 'naive-ui'
import { renderIcon } from '@/utils/common'

const appStore = useAppStore()
const handleRoute = (key, item) => {
	router.push(key)
}

const getMenuOption = (route, isChildren = false) => {
	if (route.meta.hidden) return null

	const childrenMenuOptions = []
	if (route.children && route.children.length > 0) {
		for (const childrenRoute of route.children) {
			const childrenMenuOption = getMenuOption(childrenRoute, true)
			if (childrenMenuOption) {
				childrenMenuOptions.push(childrenMenuOption)
			}
		}
	}

	let menuOption = {
		label: route.meta.title,
		key: route.path,
		icon: isChildren ? null : renderIcon(route.meta.icon ? route.meta.icon : 'DotMark')
	}
	if (childrenMenuOptions.length > 0) menuOption.children = childrenMenuOptions

	return menuOption
}

const menuOptions = []
for (const route of menuRoutes) {
	const menuOption = getMenuOption(route)
	if (menuOption) {
		menuOptions.push(menuOption)
	}
}
</script>

<template>
	<n-space
		v-if="appStore.isDesktop"
		:wrap="false"
		align="center"
		:style="appStore.hideSidebar ? 'padding: 0.5rem' : 'padding: 1rem'"
	>
		<div class="quasar-icon-64-white" style="width: 48px; height: 52px" />
		<n-h3 v-if="!appStore.hideSidebar" style="margin: 0">
			<n-text style="font-weight: bold; color: white">
				{{ appStore.appName }}
			</n-text>
		</n-h3>
	</n-space>
	<n-menu
    inverted
		:collapsed-width="64"
		:collapsed-icon-size="22"
		:options="menuOptions"
		:accordion="true"
		v-model:value="appStore.selectedMenu"
		@update:value="handleRoute"
	/>
</template>

<style lang="scss" scoped></style>
