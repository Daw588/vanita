import createPersistentStore from "../lib/persistent-store";
import type { OutfitCreateData } from "../lib/outfit";

type RawOutfit = {
	data: OutfitCreateData,
	thumbnailUrl: string
};

export const outfitList = createPersistentStore<RawOutfit[]>("outfit-list", []);