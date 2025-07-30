import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import ListQuestionnaireDataInterface from "../../../shared/data/ListQuestionnaireDataInterface.ts";
import GetBlockchainInterface from "../../../shared/data/GetBlockchainInterface.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const questionnaire = await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${query.get("id")}`);
	const blockchain = await getData<GetBlockchainInterface>("/getBlockchainAccount", `?accountId=${questionnaire?.blockchainAccountId}`);
	const response = await getData<ListQuestionnaireDataInterface>(
		"/listQuestionnaireData",
		`?dataKey=${questionnaire?.apiPassword}&denotation=${questionnaire?.blockchainDenotation}&blockchainType=${blockchain?.blockchainType}&publicKey=${blockchain?.publicKey}`
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