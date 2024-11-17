export interface DisplayErrorProps {
	when: string; // Describe when error happened "fetching api"
	message: unknown;
	exit?: boolean;
}
