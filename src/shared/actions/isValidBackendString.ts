export default function isValidBackendString(text: string): boolean {
	return /^[\w\s\-_]+$/.test(text);
}