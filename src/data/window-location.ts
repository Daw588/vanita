import createPersistentStore from "../lib/persistent-store";

export const windowLocation = createPersistentStore<{x: number, y: number}>("window-location", {x: 0, y: 0});