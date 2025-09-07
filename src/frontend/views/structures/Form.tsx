import m from "mithril";
import postData from "../../actions/postData.ts";
import {Lang} from "../../singleton/Lang.ts";
import PostDataStructureInterface from "../../../shared/PostDataStructureInterface.ts";
import {TsClosureComponent} from "../../mithril-polyfill.ts";
import FeedbackIcon, {FeedbackCallBack} from "./FeedbackIcon.tsx";
import {Btn} from "./Btn.tsx";
import DeleteInterface from "../../../shared/data/DeleteInterface.ts";
import CanceledByUserException from "../../../shared/exceptions/CanceledByUserException.ts";

/**
 * Options for the Form component.
 *
 * @property endpoint - The endpoint to which data will be sent.
 * @property query - Optional query string to be appended to the endpoint.
 * @property headers - Optional headers to include when sending data to the backend..
 * @property id - Optional id used for the delete button. The id will also be sent to the backend indicating that an existing entry should be changed rather than creating a new one.
 * @property addDeleteBtnFor - Specifies if a delete button should be shown.
 * @property onSent - Optional callback executed after the form is successfully submitted and backend responded with a successful response. The response is passed as a parameter
 * @property onDeleted - Optional callback that is executed after the delete action is completed.
 * @property onBeforeSend - Callback that is executed before the form submission. If modified data is returned, no data is sent to the backend.
 * @property submitLabel - Optional label text for the form's submit button.
 * @property filterData - Optional callback to filter or transform input data before it's sent.
 * @property clearFormWhenDone - Indicates whether the form should be cleared after submission.
 */
export type FormOptions<T extends PostDataStructureInterface> = {
	endpoint: T["Endpoint"];
	query?: `?${string}`;
	headers?: Record<string, string>;
	id?: number;
	addDeleteBtnFor?: DeleteInterface["Request"]["type"];
	onSent?: (response: T["Response"]) => void;
	onDeleted?: () => void;
	onBeforeSend?: (data: Record<string, unknown>) => T["Response"] | void;
	submitLabel?: string;
	filterData?: (data: Record<string, unknown>) => T["Request"];
	clearFormWhenDone?: boolean;
	class?: string;
};

/**
 * Provides a <form> that handles sending data to the backend, handling and returning the response,
 * and displaying loading states and backend feedback. Also provides an optional delete functionality.
 */
function Form<T extends PostDataStructureInterface>(vNode: m.Vnode<FormOptions<T>>) {
	let errorMessage: string = "";
	const feedback = new FeedbackCallBack();
	
	async function deleteEntry() {
		if(!confirm(Lang.get("confirmDeleteEntry"))) {
			return;
		}
		const {id, addDeleteBtnFor} = vNode.attrs;
		if(!id || !addDeleteBtnFor) {
			return;
		}
		feedback.setLoading(true);
		try {
			await postData<DeleteInterface>("/deleteEntry", {id: id, type: addDeleteBtnFor});
			feedback.setSuccess(true);
			vNode.attrs.onDeleted?.();
		}
		catch(error) {
			errorMessage = Lang.getError(error);
			feedback.setSuccess(false);
		}
	}
	
	async function onSubmit(event: SubmitEvent) {
		try {
			feedback.setLoading(true);
			
			event.preventDefault();
			const formTarget = event.target as HTMLFormElement;
			const formData = new FormData(formTarget);
			
			const data: Record<string, unknown> = {};
			for(const entry of formData.entries()) {
				const key = entry[0];
				if(key.endsWith("[]")) {
					const realKey = key.substring(0, key.length - 2);
					if(data.hasOwnProperty(realKey)) {
						(data[realKey] as unknown[]).push(entry[1]);
					}
					else {
						data[realKey] = [entry[1]];
					}
				}
				else {
					data[entry[0]] = entry[1];
				}
			}
			const uploadData = vNode.attrs.filterData ? vNode.attrs.filterData(data) : data;
			const pre = vNode.attrs.onBeforeSend && vNode.attrs.onBeforeSend(uploadData);
			const response = pre ? pre : await postData(vNode.attrs.endpoint, uploadData, {query: vNode.attrs.query, headers: vNode.attrs.headers});
			vNode.attrs.onSent?.(response);
			feedback.setSuccess(true);
			
			if(vNode.attrs.clearFormWhenDone) {
				formTarget.reset();
			}
		}
		catch(error) {
			if(error instanceof CanceledByUserException) {
				feedback.setLoading(false);
			}
			else {
				errorMessage = Lang.getError(error);
				feedback.setSuccess(false);
			}
		}
	}
	
	return {
		view: (newVNode: m.VnodeDOM<FormOptions<T>>) => {
			vNode = newVNode;
			return (
				<form {...vNode.attrs} onsubmit={onSubmit} class={`vertical hAlignCenter ${vNode.attrs.class ?? ""}`}>
					<div class="warn">{errorMessage}</div>
					<div class="vertical hAlignLeft">
						{!!vNode.attrs.id && <input type="hidden" name="id" value={vNode.attrs.id}/>}
						{vNode.children}
						<div class="entry horizontal vAlignCenter selfAlignStretch">
							{!!vNode.attrs.addDeleteBtnFor && feedback.isReady()
								? <Btn.TooltipBtn class="warn" iconKey="delete" description={Lang.get("tooltipDeleteEntry")} onclick={deleteEntry}/>
								: <Btn.Empty/>
							}
							
							<div class="fillSpace"></div>
							<FeedbackIcon callback={feedback} reserveSpace={true}/>
							<input type="submit" value={vNode.attrs.submitLabel ?? Lang.get("save")} disabled={!feedback.isReady()}/>
						</div>
					</div>
				</form>
			)
		}
	};
}

/**
 * Provides a <form> that handles sending data to the backend, handling and returning the response,
 * and displaying loading states and backend feedback. Also provides an optional delete functionality.
 */
export default TsClosureComponent(Form);