import m from "mithril";
import postData from "../../actions/postData.ts";
import {Endpoints} from "../../../shared/Endpoints.ts";
import ExceptionInterface from "../../../shared/exceptions/ExceptionInterface.ts";
import {Lang} from "../../singleton/Lang.ts";
import PostDataStructure from "../../../shared/data/PostDataStructure.ts";
import LoadingSpinner from "./LoadingSpinner.tsx";
import {FixedComponent} from "../../mithril-polyfill.ts";

type FormOptions<T extends PostDataStructure> = {
	endpoint: Endpoints
	onReceive: (response: T["Response"]) => void
	class?: string
};

function Form<T extends PostDataStructure>(vNode: m.Vnode<FormOptions<T>>) {
	let errorMessage: string = "";
	let isLoading: boolean = false;
	
	const onSubmit = async (event: SubmitEvent) => {
		isLoading = true;
		m.redraw();
		
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		
		const data: Record<string, unknown> = {};
		for(const key of vNode.attrs.values) {
			data[key] = formData.get("key");
		}
		
		try {
			const response = await postData(vNode.attrs.endpoint, data);
			vNode.attrs.onReceive(response);
		}
		catch(error) {
			const knownError = error as ExceptionInterface;
			errorMessage = knownError.message ?? Lang.get("unknownError");
		}
		isLoading = false;
		m.redraw();
	}
	
	return {
		view: () => (
			<form onsubmit={onSubmit} class={`vertical ${vNode.attrs.class ?? ""}`}>
				{vNode.children}
				<div class="warn fullLine">{errorMessage}</div>
				<div class="entry horizontal vAlignCenter fullLine">
					<div class="fillSpace"></div>
					{isLoading && <LoadingSpinner/>}
					<input type="submit" value={Lang.get("login")} disabled={isLoading}/>
				</div>
			</form>
		)
	};
}

export default FixedComponent(Form)