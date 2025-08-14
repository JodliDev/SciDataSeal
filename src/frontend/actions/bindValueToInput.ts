interface EventOptions {
	change?: (e: Event) => void;
	keyup?: (e: Event) => void;
}

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
 * @param eventOptions - optional callback functions for specific input events.
 */
export default function bindValueToInput<T>(attrValue: T, set: (value: T) => void, eventOptions?: EventOptions) {
	const toValue = typeof attrValue == "number"
		? (value: string) => parseInt(value)
		: (value: string) => value;
	
	const attr = typeof attrValue == "boolean" ? "checked" : "value";
	
	const onChange = (e: InputEvent) => {
		eventOptions?.[e.type as keyof EventOptions]?.(e);
		
		const element = e.target as HTMLInputElement;
		set(toValue(element[attr!] as string) as T);
		
		if(element.tagName == "SELECT") {
			// In Firefox the selected value of a select element will default to the last option when the value changes while it still has focus.
			// So we make sure to remove the focus after we changed the value:
			element.blur();
		}
	}
	
	return {
		[attr]: attrValue,
		onkeyup: onChange,
		onchange: onChange
	};
}

/**
 * Binds an object's property to an input, allowing updates to the input to reflect in the property.
 * @see bindValueToInput
 */
export function bindPropertyToInput<T extends Record<string, unknown>>(obj: T, key: keyof T, eventOptions?: EventOptions) {
	return bindValueToInput(obj[key], (value) => obj[key] = value, eventOptions);
}