export class InvalidChainError extends Error {
    constructor(message?: string) {
        super(message || "Invalid chain specified");
        this.name = "InvalidChainError";

        // Set the prototype explicitly (necessary for Error subclassing in TS)
        Object.setPrototypeOf(this, InvalidChainError.prototype);
    }
}
