import {describe, it, vi, expect} from "vitest";
import FeedbackIcon, {FeedbackCallBack} from "../../../../src/frontend/views/widgets/FeedbackIcon.tsx";
import cssFeedbackIcon from "../../../../src/frontend/views/widgets/FeedbackIcon.module.css";
import cssLoadingSpinner from "../../../../src/frontend/views/widgets/LoadingSpinner.module.css";
import {renderComponent} from "../../testRender.ts";

describe("FeedbackIcon", () => {
	const feedback = new FeedbackCallBack();
	
	it("should show an empty tag when no state is provided", () => {
		const component = renderComponent(FeedbackIcon, {reserveSpace: false, callback: feedback});
		const el = component.dom.querySelector(`.${cssFeedbackIcon.FeedbackIcon}`)!;
		expect(el.children.length).toBe(0);
	});
	it("should reserveSpace when set in options", () => {
		const component = renderComponent(FeedbackIcon, {reserveSpace: true, callback: feedback});
		expect(component.dom.querySelector(`.${cssFeedbackIcon.reserveSpace}`)).not.toBeNull();
	});
	
	describe("setLoading", () => {
		it("should show a LoadingSpinner when setLoading(true) and remove it when setLoading(false)", () => {
			const component = renderComponent(FeedbackIcon, {reserveSpace: false, callback: feedback});
			
			feedback.setLoading(true);
			component.redraw();
			
			expect(component.dom.querySelector(`.${cssLoadingSpinner.LoadingSpinner}`)).not.toBeNull();
			
			feedback.setLoading(false);
			component.redraw();
			
			expect(component.dom.querySelector(`.${cssLoadingSpinner.LoadingSpinner}`)).toBeNull();
			const el = component.dom.querySelector(`.${cssFeedbackIcon.FeedbackIcon}`)!;
			expect(el.children.length).toBe(0);
		});
	});
	
	describe("setSuccess", () => {
		it("should show success for setSuccess(true)", () => {
			const component = renderComponent(FeedbackIcon, {reserveSpace: false, callback: feedback});
			
			feedback.setSuccess(true);
			component.redraw();
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.success}`)).not.toBeNull();
			expect(component.dom.querySelector(`.${cssFeedbackIcon.failed}`)).toBeNull();
		});
		
		it("should show failed for setSuccess(false)", () => {
			const component = renderComponent(FeedbackIcon, {reserveSpace: false, callback: feedback});
			
			feedback.setSuccess(false);
			component.redraw();
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.success}`)).toBeNull();
			expect(component.dom.querySelector(`.${cssFeedbackIcon.failed}`)).not.toBeNull();
		});
		
		it("should remove success state after timeout", () => {
			vi.useFakeTimers();
			const component = renderComponent(FeedbackIcon, {reserveSpace: false, callback: feedback});
			
			feedback.setSuccess(true);
			component.redraw();
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.success}`)).not.toBeNull();
			
			vi.advanceTimersByTime(5000);
			component.redraw();
			expect(component.dom.querySelector(`.${cssFeedbackIcon.success}`)).toBeNull();
			const el = component.dom.querySelector(`.${cssFeedbackIcon.FeedbackIcon}`)!;
			expect(el.children.length).toBe(0);
			
			vi.useRealTimers();
		});
	});
	
	describe("isReady", () => {
		it("should return true by default", () => {
			renderComponent(FeedbackIcon, {reserveSpace: false, callback: feedback});
			
			expect(feedback.isReady()).toBe(true);
		});
		
		it("should return false when loading", () => {
			renderComponent(FeedbackIcon, {reserveSpace: false, callback: feedback});
			
			feedback.setLoading(true);
			expect(feedback.isReady()).toBe(false);
			
			feedback.setLoading(false);
			expect(feedback.isReady()).toBe(true);
		});
		
		it("should return true when success", () => {
			renderComponent(FeedbackIcon, {reserveSpace: false, callback: feedback});
			
			feedback.setSuccess(true);
			expect(feedback.isReady()).toBe(true);
		});
		
		it("should return false when success after loading", () => {
			renderComponent(FeedbackIcon, {reserveSpace: false, callback: feedback});
			
			feedback.setLoading(true);
			feedback.setSuccess(true);
			expect(feedback.isReady()).toBe(true);
		});
		
		it("should return false when failed", () => {
			renderComponent(FeedbackIcon, {reserveSpace: false, callback: feedback});
			
			feedback.setSuccess(false);
			expect(feedback.isReady()).toBe(false);
		});
		
		it("should return false when failed after loading", () => {
			renderComponent(FeedbackIcon, {reserveSpace: false, callback: feedback});
			
			feedback.setLoading(true);
			feedback.setSuccess(false);
			expect(feedback.isReady()).toBe(false);
		});
	});
});