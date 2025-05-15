export function stringifyWithBigInts(obj: object, space = 2): string {
    return JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value), space);
}

export function updatedError(err: unknown, message: string, parameters: object): Error {
    if (err instanceof Error) {
        const updatedError = new Error(
            `${message}: ${err.message}\nParameters: ${JSON.stringify(parameters, null, 2)}`,
        );
        updatedError.stack = err.stack;
        updatedError.name = err.name;
        return updatedError;
    }
    return new Error(`${message}: ${String(err)}\nParameters: ${JSON.stringify(parameters, null, 2)}`);
}

export function setIfDefined<T extends object, K extends keyof T>(obj: T, key: K, value: T[K] | undefined) {
    if (value !== undefined) {
        obj[key] = value;
    }
}
