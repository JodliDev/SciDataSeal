import {describe, it, vi, expect, afterAll, afterEach, beforeEach} from "vitest";
import m from "mithril";
import Form, {FormOptions} from "../../../../src/frontend/views/structures/Form.tsx";
import postData from "../../../../src/frontend/actions/postData.ts";
import {correctType, renderVNode} from "../../testRender.ts";
import cssFeedbackIcon from "../../../../src/frontend/views/structures/FeedbackIcon.module.css";
import cssButton from "../../../../src/frontend/views/structures/Btn.module.css";
import {wait} from "../../../convenience.ts";
import CanceledByUserException from "../../../../src/shared/exceptions/CanceledByUserException.ts";


describe("Form", () => {
	vi.mock("../../../../src/frontend/actions/postData.ts", () => ({
		default: vi.fn(() => "answer")
	}));
	
	beforeEach(() => {
		options = {endpoint: "/test"};
	});
	afterEach(() => {
		vi.resetAllMocks();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	
	
	let options: FormOptions<any> = {endpoint: "/test"};
	function createForm() {
		return renderVNode(() => m(correctType(Form), options, [
			m("input", {type: "text", name: "key", value: "value"}),
			m("input", {type: "text", name: "otherKey", value: "otherValue"}),
			m("input", {type: "text", name: "array[]", value: "first"}),
			m("input", {type: "text", name: "array[]", value: "second"}),
		]));
	}
	
	it("Form should contain child elements", () => {
		const component = createForm();
		
		const input1 = component.dom.querySelector("input[type=text][name=key]") as HTMLInputElement;
		const input2 = component.dom.querySelector("input[type=text][name=otherKey]") as HTMLInputElement;
		const inputGroup = component.dom.querySelectorAll("input[type=text][name='array[]']");
		
		expect(input1).not.toBeNull();
		expect(input1.value).toBe("value");
		expect(input2).not.toBeNull();
		expect(input2.value).toBe("otherValue");
		expect(inputGroup.length).toBe(2);
		expect((inputGroup[0] as HTMLInputElement).value).toBe("first");
		expect((inputGroup[1] as HTMLInputElement).value).toBe("second");
	});
	
	describe("Submit event", () => {
		beforeEach(() => {
			options = {endpoint: "/test", onSent: onSent};
		});
		afterEach(() => {
			vi.resetAllMocks();
		});
		
		const onSent = vi.fn();
		
		it("should send correct data when onSubmit is triggered", async () => {
			const component = createForm();
			const element = component.dom.querySelector("form")!;
			element.dispatchEvent(new Event("submit"));
			
			await wait(1); //onSubmit is asynchronous
			
			expect(postData).toHaveBeenCalledWith("/test", {key: "value", otherKey: "otherValue", array: ["first", "second"]}, expect.any(Object));
			expect(onSent).toHaveBeenCalledWith("answer");
		});
		
		it("should send id if provided via options", async () => {
			options.id = 123;
			const component = createForm();
			const element = component.dom.querySelector("form")!;
			element.dispatchEvent(new Event("submit"));
			
			await wait(1); //onSubmit is asynchronous
			
			expect(onSent).toHaveBeenCalledWith("answer");
			expect(postData).toHaveBeenCalledWith("/test", {key: "value", otherKey: "otherValue", array: ["first", "second"], id: "123"}, expect.any(Object));
		});
		
		it("should send corrected data when filterData is provided", async () => {
			options.filterData = () => {
				return {newKey: "newValue"}
			};
			const component = createForm();
			
			const element = component.dom.querySelector("form")!;
			element.dispatchEvent(new Event("submit"));
			
			await wait(1); //onSubmit is asynchronous
			
			expect(onSent).toHaveBeenCalledWith("answer");
			expect(postData).toHaveBeenCalledWith("/test", {newKey: "newValue"}, expect.any(Object));
		});
		
		it("should skip postData when onBeforeSend responds with data", async () => {
			options.onBeforeSend = () => {
				return {newKey: "newValue"}
			}
			const component = createForm();
			
			const element = component.dom.querySelector("form")!;
			element.dispatchEvent(new Event("submit"));
			
			await wait(1); //onSubmit is asynchronous
			
			expect(onSent).toHaveBeenCalledWith({newKey: "newValue"});
			expect(postData).not.toHaveBeenCalledWith();
		});
		
		it("should show success after submit if no error happened", async () => {
			const component = createForm();
			const element = component.dom.querySelector("form")!;
			element.dispatchEvent(new Event("submit"));
			
			await wait(1); //onSubmit is asynchronous
			component.redraw();
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.success}`)).not.toBeNull();
		});
		
		it("should show failed after submit if error happened", async  () => {
			vi.mocked(postData).mockRejectedValue(new Error());
			const component = createForm();
			const element = component.dom.querySelector("form")!;
			element.dispatchEvent(new Event("submit"));
			
			await wait(1); //onSubmit is asynchronous
			component.redraw();
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.failed}`)).not.toBeNull();
		});
		
		
		it("should not show error if submit was canceled", async  () => {
			options.onBeforeSend = () => {
				throw new CanceledByUserException();
			}
			
			const component = createForm();
			const element = component.dom.querySelector("form")!;
			element.dispatchEvent(new Event("submit"));
			
			await wait(1); //onSubmit is asynchronous
			component.redraw();
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.failed}`)).toBeNull();
			expect(component.dom.querySelector(`.${cssFeedbackIcon.success}`)).toBeNull();
		});
		it("should only empty form after submit when emptyFormWhenDone is set", async  () => {
			async function runTest() {
				const component = createForm();
				const element = component.dom.querySelector("form")!;
				element.dispatchEvent(new Event("submit"));
				
				await wait(1); //onSubmit is asynchronous
				
				return component.dom.querySelector("input[type=text][name=key]") as HTMLInputElement;
			}
			
			
			const input1 = await runTest();
			expect(input1.value).toBe("value");
			
			options.clearFormWhenDone = true;
			const input2 = await runTest();
			expect(input2.value).toBe("");
		});
	});
	
	describe("Delete event", () => {
		beforeEach(() => {
			options = {endpoint: "/test", onDeleted: onDeleted};
			vi.spyOn(window, "confirm").mockReturnValue(true);
		});
		afterEach(() => {
			vi.resetAllMocks();
		});
		
		const onDeleted = vi.fn();
		
		it("should call delete endpoint if delete button is triggered", async () => {
			options.id = 123;
			options.addDeleteBtnFor = "user"
			options.onDeleted = onDeleted
			const component = createForm();
			
			const element = component.dom.querySelector(`.${cssButton.Btn}.delete`)!
			element.dispatchEvent(new Event("click"));
			
			await wait(1); //delete is asynchronous
			
			expect(postData).toHaveBeenCalledWith("/deleteEntry", {id: 123, type: "user"});
			expect(onDeleted).toHaveBeenCalled();
		});
		
		it("should cancel delete if confirm was canceled", async () => {
			vi.spyOn(window, "confirm").mockReturnValue(false);
			
			options.id = 123;
			options.addDeleteBtnFor = "user";
			const component = createForm();
			
			const element = component.dom.querySelector(`.${cssButton.Btn}.delete`)!
			element.dispatchEvent(new Event("click"));
			
			await wait(1); //delete is asynchronous
			
			expect(postData).not.toHaveBeenCalled();
		});
		
		it("should cancel delete if id is not defined", async() => {
			options.addDeleteBtnFor = "user";
			const component = createForm();
			
			const element = component.dom.querySelector(`.${cssButton.Btn}.delete`)!
			element.dispatchEvent(new Event("click"));
			
			await wait(1); //delete is asynchronous
			
			expect(postData).not.toHaveBeenCalled();
		});
		
		it("should show success after delete if no error happened", async () => {
			options.id = 123;
			options.addDeleteBtnFor = "user";
			const component = createForm();
			
			const element = component.dom.querySelector(`.${cssButton.Btn}.delete`)!;
			element.dispatchEvent(new Event("click"));
			
			await wait(1); //delete is asynchronous
			component.redraw();
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.success}`)).not.toBeNull();
		});
		
		it("should show failed after delete if error happened", async () => {
			vi.mocked(postData).mockRejectedValue(new Error());
			
			options.id = 123;
			options.addDeleteBtnFor = "user";
			const component = createForm();
			
			const element = component.dom.querySelector(`.${cssButton.Btn}.delete`)!;
			element.dispatchEvent(new Event("click"));
			
			await wait(1); //delete is asynchronous
			component.redraw();
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.failed}`)).not.toBeNull();
		});
	})
	
});