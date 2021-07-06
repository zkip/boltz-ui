export function deleteKeys(...keys: string[]) {
	return (target: Object) => {
		keys.map((key) => Reflect.deleteProperty(target, key));
		return target;
	};
}
