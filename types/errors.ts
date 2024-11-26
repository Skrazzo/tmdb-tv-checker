export interface DisplayErrorProps {
	when: string; // Describe when error happened "fetching api"
	message: unknown;
}

interface ErrorClassProps {
	cause: string | undefined;
	message: string;
}

export class NotFoundError extends Error {
	constructor({ cause, message }: ErrorClassProps) {
		super();

		this.name = "NotFound";
		if (cause) this.cause = cause;
		this.message = message;
	}
}

export class NoInsertResult extends Error {
	constructor({ cause, message }: ErrorClassProps) {
		super();

		this.name = "Undefined";
		if (cause) this.cause = cause;
		this.message = message;
	}
}

export class NoConfigValue extends Error {
	constructor(name: string) {
		super();

		this.name = "Invalid config";
		this.cause = `Value ${name} not found present or empty in the config file`;
	}
}
