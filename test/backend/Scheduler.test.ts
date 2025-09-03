import {afterAll, beforeAll, describe, expect, it, vi} from "vitest";
import Scheduler from "../../src/backend/Scheduler.ts";

describe("Scheduler", () => {
	beforeAll(() => {
		vi.useFakeTimers();
	});
	afterAll(() => {
		vi.useRealTimers();
	});
	
	it("should add a function to the queue and schedule it correctly", () => {
		const scheduler = new Scheduler();
		const mockAction = vi.fn();
		
		scheduler.add(10, mockAction); // Schedule with a 10-minute interval
		
		vi.advanceTimersByTime(1); // Schedule calls run() asynchronously, so advance by 1 millisecond
		expect(mockAction).toHaveBeenCalledTimes(0);
		
		vi.advanceTimersByTime(10 * 60 * 1000); // Fast-forward 10 minutes
		expect(mockAction).toHaveBeenCalledTimes(1);
		
		vi.advanceTimersByTime(5 * 60 * 1000); // Fast-forward 10 minutes
		expect(mockAction).toHaveBeenCalledTimes(1);
		
		vi.advanceTimersByTime(5 * 60 * 1000); // Fast-forward 10 minutes
		expect(mockAction).toHaveBeenCalledTimes(2);
	});
	
	it("should correct timeout when adding a function", () => {
		const spySetTimeout = vi.spyOn(global, "setTimeout");
		const spyClearTimeout = vi.spyOn(global, "clearTimeout");
		
		const scheduler = new Scheduler();
		const mockAction1 = vi.fn();
		const mockAction2 = vi.fn();
		const mockAction3 = vi.fn();
		
		// First timeout
		scheduler.add(60, mockAction1); // Schedule with a 60-minute interval
		expect(scheduler["nextRun"]).toBe(Date.now() + 60 * 60 * 1000);
		expect(spySetTimeout).toHaveBeenCalledWith(expect.any(Function), 60 * 60 * 1000);
		expect(spyClearTimeout).not.toHaveBeenCalled();
		
		// Corrected timeout
		scheduler.add(10, mockAction2); // Schedule with a 10-minute interval
		expect(scheduler["nextRun"]).toBe(Date.now() + 10 * 60 * 1000);
		expect(spySetTimeout).toHaveBeenCalledWith(expect.any(Function), 10 * 60 * 1000);
		expect(spyClearTimeout).toHaveBeenCalled();
		
		spySetTimeout.mockClear();
		spyClearTimeout.mockClear();
		
		// Timeout without correction
		scheduler.add(20, mockAction3); // Schedule with a 20-minute interval
		expect(scheduler["nextRun"]).toBe(Date.now() + 10 * 60 * 1000); // Should be unchanged
		expect(spySetTimeout).not.toHaveBeenCalled();
		expect(spyClearTimeout).not.toHaveBeenCalled();
		
		// Advance time
		vi.advanceTimersByTime(10 * 60 * 1000); // Fast-forward 10 minutes
		expect(mockAction2).toHaveBeenCalledTimes(1);
		expect(mockAction3).toHaveBeenCalledTimes(0);
		expect(mockAction1).toHaveBeenCalledTimes(0);
		
		vi.advanceTimersByTime(50 * 60 * 1000); // Fast-forward another 50 minutes
		expect(mockAction2).toHaveBeenCalledTimes(6);
		expect(mockAction3).toHaveBeenCalledTimes(3);
		expect(mockAction1).toHaveBeenCalledTimes(1);
		
		// Cleanup
		spySetTimeout.mockRestore();
		spyClearTimeout.mockRestore();
	});
	
	it("should handle multiple actions in the queue", () => {
		const scheduler = new Scheduler();
		const mockAction1 = vi.fn();
		const mockAction2 = vi.fn();
		
		scheduler.add(2, mockAction1); // Schedule with a 2-minute interval
		scheduler.add(3, mockAction2); // Schedule with a 3-minute interval
		
		vi.advanceTimersByTime(2 * 60 * 1000); // Fast-forward 2 minutes
		expect(mockAction1).toHaveBeenCalledTimes(1);
		expect(mockAction2).toHaveBeenCalledTimes(0);
		
		vi.advanceTimersByTime(60 * 1000); // Fast-forward another 1 minute
		expect(mockAction1).toHaveBeenCalledTimes(1);
		expect(mockAction2).toHaveBeenCalledTimes(1);
	});
});