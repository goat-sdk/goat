export function mustBeDefined<T>(
	value: T | null | undefined,
	message = "Should be defined",
): T {
	if (value === null || value === undefined) {
		throw new Error(message);
	}
	return value;
}
