export default function isValidBackendString(text: string): boolean {
	return /^[\w\s]+$/.test(text);
}