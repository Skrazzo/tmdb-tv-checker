export interface DisplayErrorProps {
	when: string; // Describe when error happened "fetching api"
	message: unknown;
	exit?: boolean;
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
