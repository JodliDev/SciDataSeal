import m from "mithril";
import postData from "../../actions/postData.ts";
import {Endpoints} from "../../../shared/definitions/Endpoints.ts";
import ExceptionInterface from "../../../shared/exceptions/ExceptionInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import PostDataStructureInterface from "../../../shared/PostDataStructureInterface.ts";
import LoadingSpinner from "./LoadingSpinner.tsx";
import {FixedComponent} from "../../mithril-polyfill.ts";

type FormOptions<T extends PostDataStructureInterface> = {
	endpoint: Endpoints
	onReceive: (response: T["Response"]) => void,
	filterData?: (data: Record<string, unknown>) => T["Request"],
	class?: string
};

function Form<T extends PostDataStructureInterface>(vNode: m.Vnode<FormOptions<T>>) {
	let errorMessage: string = "";
	let isLoading: boolean = false;
	
	const onSubmit = async (event: SubmitEvent) => {
		try {
			isLoading = true;
			m.redraw();
			
			event.preventDefault();
			const formData = new FormData(event.target as HTMLFormElement);
			
			const data: Record<string, unknown> = {};
			for(const entry of formData.entries()) {
				data[entry[0]] = entry[1];
			}
			const uploadData = vNode.attrs.filterData ? vNode.attrs.filterData(data) : data;
			
			const response = await postData(vNode.attrs.endpoint, uploadData);
			vNode.attrs.onReceive(response);
		}
		catch(error) {
			const knownError = error as ExceptionInterface;
			errorMessage = knownError.message ? Lang.getDynamic(knownError.message, ...(knownError.values ?? [])) : Lang.get("errorUnknown");
		}
		isLoading = false;
		m.redraw();
	}
	
	return {
		view: () => (
			<form onsubmit={onSubmit} class={`vertical hAlignCenter ${vNode.attrs.class ?? ""}`}>
				<div class="warn selfAlignStart">{errorMessage}</div>
				<div class="vertical hAlignCenter">
					{vNode.children}
					<div class="entry horizontal vAlignCenter">
						<div class="fillSpace"></div>
						{isLoading && <LoadingSpinner/>}
						<input type="submit" value={Lang.get("login")} disabled={isLoading}/>
					</div>
				</div>
			</form>
		)
	};
}

export default FixedComponent(Form)