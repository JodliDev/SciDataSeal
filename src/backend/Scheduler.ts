/**
 * Represents a Scheduler that triggers actions at a specified hour of the day.
 */
export default class Scheduler {
	/**
	 * Represents the hour of the day ranging from 0 to 23.
	 */
	private readonly hourOfDay: number;
	
	/**
	 * Represents a queue that stores an array of functions intended to be executed sequentially.
	 */
	private readonly queue: (() => void)[] = [];
	
	constructor(hourOfDay: number) {
		this.hourOfDay = hourOfDay;
		this.queueNextRun();
	}
	
	/**
	 * Adds a function to the queue.
	 *
	 * @param action - The function to be added to the queue.
	 */
	public add(action: () => void) {
		this.queue.push(action);
	}
	
	/**
	 * Schedules the next execution of the `run` method at a specified hour of the day.
	 * Calculates the time remaining until the next occurrence of the specified hour. If the current time has already passed
	 * the specified hour for today, it schedules the execution for the next day at that hour.
	 */
	private queueNextRun(): void {
		const now = Date.now();
		const date = new Date();
		date.setHours(this.hourOfDay);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		
		if(date.getTime() < now)
			date.setDate(date.getDate() + 1);
		
		const nextRunTime = date.getTime() - now;
		
		setTimeout(this.run.bind(this), nextRunTime);
	}
	
	/**
	 * Executes all actions currently in the queue sequentially.
	 * After processing the queue, schedules the next execution.
	 */
	private run(): void {
		for(const action of this.queue) {
			action();
		}
		this.queueNextRun();
	}
}