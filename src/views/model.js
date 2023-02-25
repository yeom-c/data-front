export const filterOperator = {
	above: {
		label: '이상',
		op: '>='
	},
	below: {
		label: '이하',
		op: '<='
	},
	equal: {
		label: '같음',
		op: '='
	},
	not: {
		label: '다름',
		op: '<>'
	},
	like: {
		label: '포함',
		op: 'like'
	},
	in: {
		label: '모두',
		op: 'in'
	}
}

export const dataTableTypeEnum = {
	data: 0,
	enum: 1,
	map: 2
}

export const dataTableTypeObj = {}
dataTableTypeObj[dataTableTypeEnum.data] = { name: 'Data' }
dataTableTypeObj[dataTableTypeEnum.enum] = { name: 'Enum' }
dataTableTypeObj[dataTableTypeEnum.map] = { name: 'Map' }

export const dataVersionStatusEnum = {
	none: 0,
	processing: 1,
	complete: 2,
	error: 3
}

export const dataVersionStatusObj = {}
dataVersionStatusObj[dataVersionStatusEnum.none] = { name: '대기', type: 'warning' }
dataVersionStatusObj[dataVersionStatusEnum.processing] = { name: '진행중', type: 'primary' }
dataVersionStatusObj[dataVersionStatusEnum.complete] = { name: '완료', type: 'success' }
dataVersionStatusObj[dataVersionStatusEnum.error] = { name: '에러', type: 'error' }

export const trueFalseEnum = {
	false: 0,
	true: 1
}
