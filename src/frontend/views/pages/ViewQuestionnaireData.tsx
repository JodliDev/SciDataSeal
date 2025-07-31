import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import {ListQuestionnaireDataPostInterface} from "../../../shared/data/ListQuestionnaireDataInterface.ts";
import GetBlockchainInterface from "../../../shared/data/GetBlockchainInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import Form from "../widgets/Form.tsx";
import ListQuestionnairesInterface from "../../../shared/data/ListQuestionnairesInterface.ts";
import FeedbackIcon, {FeedbackCallBack} from "../widgets/FeedbackIcon.tsx";
import css from "./ViewQuestionnaireData.module.css";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async (query: URLSearchParams) => {
	const fromListFeedback = new FeedbackCallBack();
	let data: ListQuestionnaireDataPostInterface["Response"]["data"] | undefined = undefined;
	
	let publicKey = "";
	let dataKey = "";
	let blockchainType = "";
	let denotation = 1;
	
	function onReceive(response: ListQuestionnaireDataPostInterface["Response"]) {
		data = response?.data;
	}
	
	async function fillQuestionnaire(questionnaireId: number) {
		fromListFeedback.setLoading(true);
		const questionnaire = await getData<GetQuestionnaireInterface>("/getQuestionnaire", `?questionnaireId=${questionnaireId}`);
		if(!questionnaire) {
			fromListFeedback.setSuccess(false);
			return;
		}
		const blockchain = await getData<GetBlockchainInterface>("/getBlockchainAccount", `?accountId=${questionnaire.blockchainAccountId}`);
		if(!blockchain) {
			fromListFeedback.setSuccess(false);
			return;
		}
		
		publicKey = blockchain.publicKey;
		dataKey = questionnaire.apiPassword;
		denotation = questionnaire.blockchainDenotation;
		blockchainType = blockchain.blockchainType;
		
		fromListFeedback.setSuccess(true);
	}
	
	const id = query.get("id");
	const questionnaires = (await getData<ListQuestionnairesInterface>("/listQuestionnaires"))?.questionnaires;
	
	return {
		history: [
			{label: Lang.get("admin"), page: "Admin"},
			{label: Lang.get("viewData"), page: "ViewQuestionnaireData", query: `?id=${id}`},
		],
		view: () => <div class="vertical hAlignStretched">
			{data
				? <table>
					{data!.map(line =>
						<tr>{Array.isArray(line)
							? line.map(column =>
								<td>{column}</td>
							)
							: <td>{line}</td>
						}</tr>
					)}
				</table>
				: <Form<ListQuestionnaireDataPostInterface> endpoint="/listQuestionnaireData" onReceive={onReceive} submitLabel={Lang.get("load")}>
					<div class={`labelLike ${css.preselectBox}`}>
						<small>{Lang.get("preselectQuestionnaire")}</small>
						<div class={`inputLike horizontal wrapContent`}>
							{questionnaires?.map(q =>
								<span class={`clickable ${css.entry}`} onclick={() => fillQuestionnaire(q.questionnaireId)}>{q.questionnaireName}</span>
							)}
							<div class="fillSpace"></div>
							<FeedbackIcon callback={fromListFeedback}/>
						</div>
					</div>
					<div class="horizontal">
						<label>
							<small>{Lang.get("publicKey")}</small>
							<textarea name="publicKey">{publicKey}</textarea>
						</label>
						
						<label>
							<small>{Lang.get("dataKey")}</small>
							<textarea name="dataKey">{dataKey}</textarea>
						</label>
					</div>
					
					<div class="horizontal">
						<label>
							<small>{Lang.get("type")}</small>
							<select name="blockchainType" value={blockchainType}>
								<option value="solana">{Lang.get("solana")}</option>
								<option value="solanaTest" selected="selected">{Lang.get("solanaTest")}</option>
							</select>
						</label>
						
						<label>
							<small>{Lang.get("denotation")}</small>
							<input type="text" name="denotation" value={denotation}/>
						</label>
					</div>
				</Form>
			}
			
			
		</div>
	};
});