import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest';
import Scheduler from "../../src/backend/Scheduler.ts";

describe("Scheduler", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	
	afterEach(() => {
		vi.useRealTimers();
	});
	
	function advanceTime(targetHour: number, now = new Date()) {
		const targetDate = new Date();
		targetDate.setHours(targetHour, 0, 0, 0);
		const delay = targetDate.getTime() - now.getTime();
		vi.advanceTimersByTime(delay);
	}
	
	it("should add an action to the queue", () => {
		const mockAction = vi.fn();
		const scheduler = new Scheduler(12);
		
		scheduler.add(mockAction);
		
		expect(scheduler["queue"]).toContain(mockAction);
	});
	
	it("should execute queued actions at the specified hour", () => {
		const mockAction = vi.fn();
		const now = new Date();
		const targetHour = now.getHours() + 1;
		const scheduler = new Scheduler(targetHour);
		
		scheduler.add(mockAction);
		
		advanceTime(targetHour);
		
		expect(mockAction).toHaveBeenCalled();
	});
	
	it("should run all actions that where added", () => {
		const mockAction = vi.fn();
		const now = new Date();
		const targetHour = now.getHours() + 1;
		const scheduler = new Scheduler(targetHour);
		
		scheduler.add(mockAction);
		scheduler.add(mockAction);
		scheduler.add(mockAction);
		
		advanceTime(targetHour);
		
		expect(mockAction).toHaveBeenCalledTimes(3);
	});
});