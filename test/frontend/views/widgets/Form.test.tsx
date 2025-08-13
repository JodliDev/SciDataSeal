import {describe, it, vi, expect, afterAll, afterEach, beforeEach} from "vitest";
import m from "mithril";
import Form, {FormOptions} from "../../../../src/frontend/views/widgets/Form.tsx";
import postData from "../../../../src/frontend/actions/postData.ts";
import {correctType, renderVNode} from "../../testRender.ts";
import cssFeedbackIcon from "../../../../src/frontend/views/widgets/FeedbackIcon.module.css";
import cssButton from "../../../../src/frontend/views/widgets/Btn.module.css";
import {wait} from "../../../convenience.ts";


describe("Form", () => {
	vi.mock("../../../../src/frontend/actions/postData.ts", () => ({
		default: vi.fn(() => "answer")
	}));
	
	beforeEach(() => {
		options = {endpoint: "/test"};
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});
	afterAll(() => {
		vi.resetAllMocks();
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
		expect(component.dom.querySelector("input[type=text][name=key][value=value]")).toBeDefined()
		expect(component.dom.querySelector("input[type=text][name=otherKey][value=otherValue]")).toBeDefined()
	});
	
	describe("Submit event", () => {
		beforeEach(() => {
			options = {endpoint: "/test", onSent: onSent};
		});
		afterEach(() => {
			vi.restoreAllMocks();
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
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.success}`)).toBeDefined();
		});
		
		it("should show failed after submit if error happened", async  () => {
			vi.mocked(postData).mockRejectedValue(new Error());
			const component = createForm();
			const element = component.dom.querySelector("form")!;
			element.dispatchEvent(new Event("submit"));
			
			await wait(1); //onSubmit is asynchronous
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.failed}`)).toBeDefined();
		});
	});
	
	describe("Delete event", () => {
		beforeEach(() => {
			options = {endpoint: "/test", onDeleted: onDeleted};
			vi.spyOn(window, "confirm").mockReturnValue(true);
		});
		afterEach(() => {
			vi.restoreAllMocks();
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
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.success}`)).toBeDefined();
		});
		
		it("should show failed after delete if error happened", () => {
			vi.mocked(postData).mockRejectedValue(new Error());
			
			options.id = 123;
			options.addDeleteBtnFor = "user";
			const component = createForm();
			
			const element = component.dom.querySelector(`.${cssButton.Btn}.delete`)!;
			element.dispatchEvent(new Event("click"));
			
			expect(component.dom.querySelector(`.${cssFeedbackIcon.failed}`)).toBeDefined();
		});
	})
	
});