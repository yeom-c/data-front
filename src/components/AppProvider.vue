<script setup>
import {
	NConfigProvider,
	NDialogProvider,
	NMessageProvider,
	NNotificationProvider,
	koKR,
	dateKoKR
} from 'naive-ui'
import themeConfig from '/naive-ui.config.js'
</script>

<template>
	<n-config-provider :locale="koKR" :date-locale="dateKoKR" :theme-overrides="themeConfig">
		<n-dialog-provider>
			<n-message-provider>
				<n-notification-provider>
					<slot />
				</n-notification-provider>
			</n-message-provider>
		</n-dialog-provider>
	</n-config-provider>
</template>
