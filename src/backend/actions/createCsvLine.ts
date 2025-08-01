export default function createCsvLine(dataArray: string[]): string {
	const filteredArray = dataArray.map(line => line.replaceAll("\"", "'"));
	return `"${filteredArray.join("\",\"")}"`
}