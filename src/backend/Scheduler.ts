export default class Scheduler {
	private readonly hourOfDay: number;
	private readonly queue: (() => void)[] = [];
	
	constructor(hourOfDay: number) {
		this.hourOfDay = hourOfDay;
		this.queueNextRun();
	}
	
	public add(action: () => void) {
		this.queue.push(action);
	}
	
	private queueNextRun() {
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
	
	private run() {
		for(const action of this.queue) {
			action();
		}
		this.queueNextRun();
	}
}