export default function createDataBlob(data: string) {
	return window.URL.createObjectURL(new Blob([data], {type: "text/json"}));
}