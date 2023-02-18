import App from "./app.svelte";
import "./styles/global.css";

const app = new App({
	target: document.getElementById("app")
});

export default app;
