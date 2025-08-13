import m from "mithril";
import {TsClosureComponent} from "../../mithril-polyfill.ts";
import FeedbackIcon, {FeedbackCallBack} from "./FeedbackIcon.tsx";


interface Attributes {
	callback: FeedbackCallBack
}

export default TsClosureComponent<Attributes>(() => {
	return {
		view: (vNode) => {
			const feedback = vNode.attrs.callback;
			return <div class="vertical hAlignCenter vAlignCenter">
				{feedback.isReady()
					? vNode.children
					: <FeedbackIcon callback={feedback}/>
				}
			</div>
		}
	};
});
