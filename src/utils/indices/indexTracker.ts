import { isNotFound } from "../constants";

export class IndexTracker<Data extends object> {
	protected changeProcess = new Array<number>();
	protected initPosition = new WeakMap<Data, number>();
	protected changeTime = new WeakMap<Data, number>();

	insert(data: Data, position: number) {
		if (!this.initPosition.has(data)) {
			this.initPosition.set(data, position);
			this.changeTime.set(data, this.changeProcess.length);
			this.changeProcess.push(position);
		}
	}
	remove(data: Data) {
		const position = this.initPosition.get(data);
		if (!isNotFound(position)) {
			this.initPosition.delete(data);
			this.changeTime.delete(data);
			this.changeProcess.push(-position);
		}
	}
	get(data: Data) {
		const start = this.changeTime.get(data);
		let ip = this.initPosition.get(data);
		if (!isNotFound(ip) && !isNotFound(start)) {
			for (let i = start + 1; i < this.changeProcess.length; i++) {
				const cp = this.changeProcess[i];
				if (isPositive(cp)) {
					if (ip >= cp) {
						ip++;
					}
				} else {
					if (ip > -cp) {
						ip--;
					}
				}
			}
			return ip;
		}
	}
}

function isPositive(n: number) {
	return 1 / n > 0;
}
