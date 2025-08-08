import m from "mithril";
import postData from "../../actions/postData.ts";
import {Lang} from "../../singleton/Lang.ts";
import PostDataStructureInterface from "../../../shared/PostDataStructureInterface.ts";
import {FixedComponent} from "../../mithril-polyfill.ts";
import FeedbackIcon, {FeedbackCallBack} from "./FeedbackIcon.tsx";
import {Btn} from "./Btn.tsx";
import DeleteInterface from "../../../shared/data/DeleteInterface.ts";

export type FormOptions<T extends PostDataStructureInterface> = {
	endpoint: T["Endpoint"],
	id?: number,
	deleteEndPoint?: DeleteInterface["Endpoint"],
	onSent?: (response: T["Response"]) => void,
	onDeleted?: () => void,
	onBeforeSend?: (data: Record<string, unknown>) => T["Response"] | void,
	submitLabel?: string,
	query?: `?${string}`
	headers?: Record<string, string>,
	filterData?: (data: Record<string, unknown>) => T["Request"],
	class?: string
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
		const {id, deleteEndPoint} = vNode.attrs;
		if(!id || !deleteEndPoint) {
			return;
		}
		feedback.setLoading(true);
		try {
			await postData(deleteEndPoint, {id: id});
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
			const formData = new FormData(event.target as HTMLFormElement);
			
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
		}
		catch(error) {
			errorMessage = Lang.getError(error);
			feedback.setSuccess(false);
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
							{!!vNode.attrs.deleteEndPoint && feedback.isReady()
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
export default FixedComponent(Form);