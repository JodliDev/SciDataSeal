import {describe, it, expect} from "vitest";
import {correctType, renderVNode} from "../../testRender.ts";
import FeedbackContent from "../../../../src/frontend/views/structures/FeedbackContent.tsx";
import {FeedbackCallBack} from "../../../../src/frontend/views/structures/FeedbackIcon.tsx";
import cssLoadingSpinner from "../../../../src/frontend/views/structures/LoadingSpinner.module.css";
import m from "mithril";

describe("FeedbackContent", () => {
	const feedback = new FeedbackCallBack();
	function createView() {
		return renderVNode(() => m(correctType(FeedbackContent), {callback: feedback}, [
			m("div", {class: "test"})
		]));
	}
	
	it("should show FeedbackIcon when not ready", () => {
		const component = createView();
		
		expect(component.dom.querySelector(`.${cssLoadingSpinner.LoadingSpinner}`)).toBeNull();
		expect(component.dom.querySelector(".test")).not.toBeNull();
		
		feedback.setLoading(true);
		component.redraw();
		
		expect(component.dom.querySelector(`.${cssLoadingSpinner.LoadingSpinner}`)).not.toBeNull();
		expect(component.dom.querySelector(".test")).toBeNull();
	});
});