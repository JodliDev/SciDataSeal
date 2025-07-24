export default function bindValueToInput<T>(attrValue: T, set: (value: T) => void) {
	const toValue = typeof attrValue == "number"
		? (value: string) => parseInt(value)
		: (value: string) => value 
	
	const attr = typeof attrValue == "boolean" ? "checked" : "value"
	
	const onChange = (e: InputEvent) => {
		const element = e.target as HTMLInputElement
		set(toValue(element[attr!] as string) as T)
	}
	
	return {
		[attr]: attrValue,
		onkeyup: onChange,
		onchange: onChange
	}
}
