import { writable } from "svelte/store";

type Instance = {
	id: string,
	message: string,
	lifespan: number // In seconds
}

export const FADE_TIME = 1; // In seconds

const SAFE_ZONE_DELAY = 1;

export const instances = writable<Instance[]>([]);

// TODO: Refactor this so that it is no longer a class
// biome-ignore lint/complexity/noStaticOnlyClass: Will be refactored at some point I suppose
export class Snackbar {
	public static show(message: string, lifespan: number) {
		// Add snackbar instance to queue
		const id = crypto.randomUUID(); // TODO: Perhaps use Date.now() to improve performance?
		instances.update(value => {
			value.push({
				id,
				message,
				lifespan
			});
			return value;
		});

		const delay = (lifespan + FADE_TIME + SAFE_ZONE_DELAY) * 1000;

		// Remove the snackbar instance after it's visually gone
		setTimeout(() => {
			instances.update(value => {
				const index = value.findIndex(v => v.id === id);
				if (index !== -1) {
					value.splice(index, 1);
				}
				return value;
			});
		}, delay)
	}
}
