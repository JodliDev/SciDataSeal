interface SchedulerEntry {
	action: () => void;
	nextRun: number;
	repeatEveryMinutes: number;
}

/**
 * Represents a Scheduler that triggers actions at a specified hour of the day.
 */
export default class Scheduler {
	private timeoutId?: NodeJS.Timeout;
	private nextRun: number = 0;
	
	/**
	 * Represents a queue that stores an array of functions intended to be executed sequentially.
	 */
	private readonly queue: SchedulerEntry[] = [];
	
	/**
	 * Adds a function to the queue that should be repeated at the specified interval.
	 * Also schedules / corrects the next Scheduler execution.
	 *
	 * @param repeatEveryMinutes - The interval in minutes at which the function should be executed.
	 * @param action - The function to be added to the queue.
	 */
	public add(repeatEveryMinutes: number, action: () => void) {
		const entry = {
			action: action,
			repeatEveryMinutes: repeatEveryMinutes,
			nextRun: Date.now() + repeatEveryMinutes * 60 * 1000
		} satisfies SchedulerEntry
		this.queue.push(entry);
		
		this.queueNextRun();
	}
	
	/**
	 * Figures out and schedules (if needed) the next execution.
	 */
	private queueNextRun(): void {
		let nextRun = this.queue[0]?.nextRun ?? 0;
		
		for(const entry of this.queue) {
			if(entry.nextRun < nextRun) {
				nextRun = entry.nextRun;
			}
		}
		if(nextRun == this.nextRun) {
			return;
		}
		
		if(this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
		if(nextRun) {
			this.nextRun = nextRun;
			this.timeoutId = setTimeout(this.run.bind(this), nextRun - Date.now());
		}
	}
	
	/**
	 * Executes actions in the queue that are due to be executed.
	 * After processing the queue, schedules the next execution.
	 */
	private run(): void {
		const now = Date.now();
		for(const entry of this.queue) {
			if(entry.nextRun <= now) {
				entry.action();
				entry.nextRun = now + entry.repeatEveryMinutes * 60 * 1000;
			}
		}
		this.queueNextRun();
	}
}