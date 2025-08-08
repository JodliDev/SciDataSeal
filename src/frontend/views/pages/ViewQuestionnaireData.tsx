import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import getData from "../../actions/getData.ts";
import GetQuestionnaireInterface from "../../../shared/data/GetQuestionnaireInterface.ts";
import GetBlockchainInterface from "../../../shared/data/GetBlockchainInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import Form from "../widgets/Form.tsx";
import ListQuestionnairesInterface from "../../../shared/data/ListQuestionnairesInterface.ts";
import FeedbackIcon, {FeedbackCallBack} from "../widgets/FeedbackIcon.tsx";
import css from "./ViewQuestionnaireData.module.css";
import generateHash from "../../actions/generateHash.ts";
import createDataBlob from "../../actions/createDataBlob.ts";
import postData from "../../actions/postData.ts";
import {Change, diffChars} from "diff";
import {GetQuestionnaireDataPostInterface} from "../../../shared/data/GetQuestionnaireDataInterface.ts";
import floatingMenu, {tooltip} from "../../actions/FloatingMenu.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	const fromListFeedback = new FeedbackCallBack();
	const reloadingFeedback = new FeedbackCallBack();
	
	let blobUrl: string | undefined = undefined;
	let dataCharacterCount = 0;
	let publicKey = "";
	let dataKey = "";
	let blockchainType = "";
	let denotation = 1;
	let hash = "";
	let hashTime = 0;
	let dataForReload = {};
	let diff: Change[] | undefined = undefined;
	let isDifferent = false;
	
	function onBeforeSend(data: Record<string, unknown>): GetQuestionnaireDataPostInterface["Response"] | void {
		dataForReload = data;
		hash = generateHash(JSON.stringify(data)).toString();
		
		const csv = localStorage.getItem(hash);
		if(csv) {
			hashTime = parseInt(localStorage.getItem(`${hash}-time`) ?? "0");
			if(hashTime) {
				return {csv: csv};
			}
		}
		
		localStorage.setItem(`${hash}-time`, Date.now().toString());
	}
	
	function onSent(response: GetQuestionnaireDataPostInterface["Response"]) {
		const csv = response?.csv;
		dataCharacterCount = csv?.length ?? 0;
		
		localStorage.setItem(hash, csv);
		blobUrl = createDataBlob(csv);
		m.redraw();
	}
	
	async function reloadData() {
		diff = undefined;
		reloadingFeedback.setLoading(true);
		localStorage.removeItem(hash);
		const response = await postData<GetQuestionnaireDataPostInterface>("/getQuestionnaireData", dataForReload as GetQuestionnaireDataPostInterface["Request"]);
		if(response) {
			hashTime = Date.now();
			localStorage.setItem(`${hash}-time`, hashTime.toString());
			onSent(response);
			reloadingFeedback.setSuccess(true);
		}
		else {
			reloadingFeedback.setSuccess(false);
		}
	}
	
	async function compareFile(event: Event) {
		const target = event.target as HTMLInputElement;
		if(!target.files?.length) {
			return;
		}
		const file = target.files[0];
		
		
		const original = localStorage.getItem(hash);
		const compare = await file.text();
		
		if(!original || !compare) {
			return;
		}
		
		diff = diffChars(compare, original);
		isDifferent = !!diff.find(entry => entry.added || entry.removed);
		m.redraw();
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
	const questionnaires = (await getData<ListQuestionnairesInterface>("/listQuestionnaires"))?.questionnaires;
	
	return {
		history: [
			{label: Lang.get("home"), page: "Home"},
			{label: Lang.get("viewData"), page: "ViewQuestionnaireData"},
		],
		view: () => <div class="vertical hAlignStretched fillSpace">
			{blobUrl
				? <div class="vertical hAlignStretched">
					<div class="textCentered">{Lang.get("infoDataCharacterCount", dataCharacterCount)}</div>
					<div class="textCentered" {...tooltip(Lang.get("tooltipDataCachedTime"))}>
						{Lang.get("infoDataCacheTime", (new Date(hashTime)).toLocaleString())}
					</div>
					<br/>
					<div class="horizontal">
						<div class="bigButton clickable" onclick={reloadData} {...tooltip(Lang.get("tooltipReload"))}>
							{Lang.get("reload")}
							<FeedbackIcon callback={reloadingFeedback}/>
						</div>
						<a class="bigButton" href={blobUrl} download="data.csv">{Lang.get("download")}</a>
						<div
							class="bigButton clickable"
							{...tooltip(Lang.get("tooltipCompare"))}
							{...floatingMenu("compare", close =>
								<div>
									<label>
										<small>{Lang.get("fileToCompareWith")}</small>
										<input type="file" accept="text/csv" onchange={(event: Event) => {close(); compareFile(event);}}/>
									</label>
								</div>
							)}>{Lang.get("compare")}</div>
					</div>
					{diff && (
						isDifferent
							? <pre class={css.differences}>{diff.map(part =>
								<pre>
									{part.added
										? <pre class={css.added}>{m.trust(part.value)}</pre>
										: part.removed
											? <pre class={css.removed}>{m.trust(part.value)}</pre>
											: <pre>{m.trust(part.value)}</pre>
									}
								</pre>
							)}</pre>
							: <div class={css.differences}>{Lang.get("foundNoChanges")}</div>
						)
					}
				</div>
				: <Form<GetQuestionnaireDataPostInterface> endpoint="/getQuestionnaireData" submitLabel={Lang.get("load")} onBeforeSend={onBeforeSend} onSent={onSent}>
					<div class={`labelLike ${css.preselectBox}`} {...tooltip(Lang.get("tooltipSelectQuestionnaire"))}>
						<small>{Lang.get("selectQuestionnaire")}</small>
						<div class={`inputLike horizontal wrapContent`}>
							{questionnaires?.map(q =>
								<span class={`clickable ${css.entry}`} onclick={() => fillQuestionnaire(q.questionnaireId)}>{q.questionnaireName}</span>
							)}
							<div class="fillSpace"></div>
							<FeedbackIcon callback={fromListFeedback}/>
						</div>
					</div>
					<div class="horizontal hAlignCenter wrapContent">
						<label {...tooltip(Lang.get("tooltipBlockchainPrivateKey"))}>
							<small>{Lang.get("publicKey")}</small>
							<textarea name="publicKey">{publicKey}</textarea>
						</label>
						
						<label {...tooltip(Lang.get("tooltipDataKey"))}>
							<small>{Lang.get("dataKey")}</small>
							<textarea name="dataKey">{dataKey}</textarea>
						</label>
					</div>
					
					<div class="horizontal hAlignCenter wrapContent">
						<label>
							<small>{Lang.get("type")}</small>
							<select name="blockchainType" value={blockchainType}>
								<option value="solana">{Lang.get("solana")}</option>
								<option value="solanaTest" selected="selected">{Lang.get("solanaTest")}</option>
							</select>
						</label>
						
						<label {...tooltip(Lang.get("tooltipDenotation"))}>
							<small>{Lang.get("denotation")}</small>
							<input type="number" min="1" name="denotation" value={denotation}/>
						</label>
					</div>
				</Form>
			}
			
			
		</div>
	};
});