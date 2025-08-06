/**
 * Constructs a CSV-formatted string from an array of strings.
 * Each string in the array is wrapped with double quotes, and
 * double quotes within the strings are replaced with single quotes.
 *
 * @param dataArray - An array of strings to be formatted into a CSV line.
 * @return A single CSV-formatted string representing the input array.
 */
export default function createCsvLine(dataArray: string[]): string {
	const filteredArray = dataArray.map(line => line.replaceAll("\"", "'"));
	return `"${filteredArray.join("\",\"")}"`
}