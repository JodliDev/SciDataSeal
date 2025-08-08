/**
 * Creates a data blob URL from the provided JSON string.
 *
 * @param data The JSON string to be converted into a Blob URL.
 * @return The generated Blob URL representing the input data.
 */
export default function createDataBlob(data: string): string {
	return window.URL.createObjectURL(new Blob([data], {type: "text/json"}));
}