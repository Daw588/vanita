const container = document.createElement("div");
container.id = "app";
document.body.appendChild(container);

const style = document.createElement("style");
/*
	Will be replaced with actual css by pack.js.
	Ticks are required to not break the code after CSS injection.
*/
style.textContent = `%CSS%`;
document.head.appendChild(style);