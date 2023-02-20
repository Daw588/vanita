import MemoryStore from "../lib/memory-store";

const meta = document.querySelector("meta[name='csrf-token']");
const initialValue = (meta) ? meta.getAttribute("data-token") : "COULD_NOT_EXTRACT_TOKEN";

export let xCsrfToken = new MemoryStore<string>(initialValue);