/**
 * Whether the extension is running development, or in production environment.
 * This constant supports conditional compilation thanks to Terser.
 */
export const DEBUG = import.meta.env.MODE === "debug"; // Either "release" or "debug"

export const EXTENSION_ID = "dcmbddbidlgkkaaiogiecbbjimjeicmo";
