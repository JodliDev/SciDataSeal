import m from "mithril";
import LoadingSpinner from "../../widgets/LoadingSpinner.tsx";
import {PageContent} from "../../../PageComponent.ts";

export default function Loading(): PageContent {
	return {
		history: [],
		view: () =>  <div id="Loading" class="vertical hAlignCenter vAlignCenter fillSpace">
			<LoadingSpinner/>
		</div>
	};
}