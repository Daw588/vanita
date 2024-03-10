export type Result<Ok, Err> =
	Ok extends void
		? { success: true } | { success: false, error: Err }
		: { success: true, value: Ok } | { success: false, error: Err }

export function Ok(): { success: true }
export function Ok<T>(value: NonNullable<T>): { success: true, value: T }
export function Ok<T>(value?: NonNullable<T>): { success: true, value?: T } {
	return {
		success: true,
		value
	};
}

export function Err<T>(error: T): { success: false, error: T } {
	return {
		success: false,
		error
	};
}
