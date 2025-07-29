import {PrivatePage} from "../../PageComponent.ts";
import m from "mithril";
import Form from "../widgets/Form.tsx";
import CreateStudyInterface from "../../../shared/data/CreateStudyInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import {SiteTools} from "../../singleton/SiteTools.ts";

// noinspection JSUnusedGlobalSymbols
export default PrivatePage(async () => {
	async function onReceive(response: CreateStudyInterface["Response"]) {
		SiteTools.switchPage("Study", `?id=${response.studyId}`);
	}
	
	return{
		history: [["Admin"]],
		view: () => <Form<CreateStudyInterface> endpoint="/createStudy" onReceive={onReceive}>
			<label>
				<small>{Lang.get("studyName")}</small>
				<input type="text" name="studyName"/>
			</label>
			<label>
				<small>{Lang.get("type")}</small>
				<select name="blockchainType">
					<option value="solana">{Lang.get("solana")}</option>
					<option value="solanaTest" selected="selected">{Lang.get("solanaTest")}</option>
				</select>
			</label>
			<label>
				<small>{Lang.get("privateKey")}</small>
				<textarea name="blockchainPrivateKey"></textarea>
			</label>
		</Form>
	};
});