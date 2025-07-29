import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetStudyInterface from "../../../shared/data/GetStudyInterface.ts";
import ListStudyDataInterface from "../../../shared/data/ListStudyDataInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const study = await getData<GetStudyInterface>("/getStudy", `?studyId=${query.get("id")}`);
	const response = await getData<ListStudyDataInterface>(
		"/listStudyData",
		`?dataKey=${study?.apiPassword}&blockchainType=${study?.blockchainType}&publicKey=${study?.blockchainPublicKey}`
	);
	
	return {
		history: [["Admin"]],
		view: () => <table>
			{response?.data.map(line =>
				<tr>{Array.isArray(line)
					? line.map(column =>
						<td>{column}</td>
					)
					: <td>{line}</td>
				}</tr>
			)}
		</table>
	};
});