export interface Error {
	success: false;
	error: unknown;
}

export interface Success {
	success: true;
}

export interface TestRow {
	id: number;
	num: number;
}
