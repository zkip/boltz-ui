export function Relation(id, { ...props } = {}) {
	return Object.assign(
		{
			id,
			next_sibling: undefined,
			prev_sibling: undefined,
			parent: undefined,
			child: undefined,
		},
		props
	);
}

export const DETAILD_BEFORE = 0;
export const DETAILD_In = 1;
export const DETAILD_AFTER = 2;

export const EMPTY_NUMBER = new Number();
