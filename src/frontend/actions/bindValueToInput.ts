/**
 * Binds a value to an input element and calls a provided setter when data changes.
 * Usage example:
 * ```
 * let value = "changeMe";
 * <input type="text" {...bindValueToInput(value, (newValue) => value = newValue)}/>
 * ```
 *
 * @param attrValue - The initial value to bind to the input element.
 * @param set - A callback function that is expected to update the state with the new value.
 */
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

/**
 * Binds an object's property to an input, allowing updates to the input to reflect in the property.
 * @see bindValueToInput
 */
export function bindPropertyToInput<T extends Record<string, unknown>>(obj: T, key: keyof T) {
	return bindValueToInput(obj[key], (value) => obj[key] = value);
}