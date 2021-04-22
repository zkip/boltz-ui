import { sleep, tasks } from "../../../src/utils/async";

test("tasks", () => {
	let ok1 = false,
		ok2 = false;
	tasks(
		new Promise((rv) => {
			setTimeout(() => {
				ok1 = true;
				rv();
			}, 1000);
		}),
		new Promise((rv) => {
			setTimeout(() => {
				ok2 = true;
				rv();
			}, 1000);
		})
	);

	return new Promise((rv) => {
		setTimeout(() => {
			expect(ok1).toEqual(true);
			expect(ok2).toEqual(true);
			rv();
		}, 1100);
	});
});

test("sleep", () => {
	let ok = false;

	async function exec() {
		await sleep(1000);
		ok = true;
	}

	exec();

	return new Promise((rv) => {
		setTimeout(() => {
			expect(ok).toEqual(true);
			rv();
		}, 1100);
	});
});
