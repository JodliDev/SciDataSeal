import m from "mithril";
import postData from "../../actions/postData.ts";
import {Endpoints} from "../../../shared/definitions/Endpoints.ts";
import ExceptionInterface from "../../../shared/exceptions/ExceptionInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import PostDataStructureInterface from "../../../shared/PostDataStructureInterface.ts";
import {FixedComponent} from "../../mithril-polyfill.ts";
import FeedbackIcon, {FeedbackCallBack} from "./FeedbackIcon.tsx";

type FormOptions<T extends PostDataStructureInterface> = {
	endpoint: Endpoints
	onReceive?: (response: T["Response"]) => void,
	submitLabel?: string,
	query?: `?${string}`
	headers?: Record<string, string>,
	filterData?: (data: Record<string, unknown>) => T["Request"],
	class?: string
};

function Form<T extends PostDataStructureInterface>(vNode: m.Vnode<FormOptions<T>>) {
	let errorMessage: string = "";
	const feedback = new FeedbackCallBack();
	
	const onSubmit = async (event: SubmitEvent) => {
		try {
			feedback.setLoading(true);
			m.redraw();
			
			event.preventDefault();
			const formData = new FormData(event.target as HTMLFormElement);
			
			const data: Record<string, unknown> = {};
			for(const entry of formData.entries()) {
				const key = entry[0];
				if(key.endsWith("[]")) {
					const realKey = key.substring(0, key.length - 2);
					if(data.hasOwnProperty(key))
						(data[realKey] as unknown[]).push(entry[1]);
					else
						data[realKey] = [entry[1]];
				}
				else
					data[entry[0]] = entry[1];
			}
			const uploadData = vNode.attrs.filterData ? vNode.attrs.filterData(data) : data;
			
			const response = await postData(vNode.attrs.endpoint, uploadData, {query: vNode.attrs.query, headers: vNode.attrs.headers});
			vNode.attrs.onReceive?.(response);
			feedback.setSuccess(true);
		}
		catch(error) {
			const knownError = error as ExceptionInterface;
			errorMessage = knownError.message ? Lang.getDynamic(knownError.message, ...(knownError.values ?? [])) : Lang.get("errorUnknown");
			feedback.setSuccess(false);
		}
		feedback.setLoading(false);
		m.redraw();
	}
	
	return {
		view: ({children}: m.Vnode<FormOptions<T>>) => (
			<form onsubmit={onSubmit} class={`vertical hAlignCenter ${vNode.attrs.class ?? ""}`}>
				<div class="warn">{errorMessage}</div>
				<div class="vertical hAlignCenter">
					{children}
					<div class="entry horizontal vAlignCenter selfAlignStretch">
						<div class="fillSpace"></div>
						<FeedbackIcon callback={feedback} reserveSpace={true}/>
						<input type="submit" value={vNode.attrs.submitLabel ?? Lang.get("save")} disabled={!feedback.isReady()}/>
					</div>
				</div>
			</form>
		)
	};
}

export default FixedComponent(Form);