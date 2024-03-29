import { gInfoDialog } from "./stores";

type Structure<T> = {
	title: string,
	description: string,
	actions: {
		label: string,
		icon?: string,
		kind: "normal" | "danger",
		value: T
	}[],
	dismissible: boolean
}

export default function<T>(inst: Structure<T>) {
	return {
		invoke: () => {
			return new Promise<T | void>(resolve => {
				gInfoDialog.set({
					title: inst.title,
					description: inst.description,
					actions: inst.actions.map(v => {
						return {
							label: v.label,
							icon: v.icon,
							kind: v.kind,
							onClick: () => {
								gInfoDialog.update(prev => ({ ...prev, visible: false }));
								resolve(v.value);
							}
						}
					}),
					visible: true,
					dismiss: () => {
						if (inst.dismissible) {
							gInfoDialog.update(prev => ({ ...prev, visible: false }));
							resolve();
						}
					}
				});
			});
		}
	}
}