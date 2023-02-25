import { h } from 'vue'
import { NIcon } from 'naive-ui'
import * as CarbonIcon from '@vicons/carbon'

const renderIcon = (icon) => {
	return () =>
		h(NIcon, null, {
			default: () => h(CarbonIcon[icon])
		})
}

export { renderIcon }
