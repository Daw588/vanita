export {};

const container = document.createElement("div");
container.id = "app";
document.body.appendChild(container);

const toggleBtn = document.createElement("div");
toggleBtn.id = "app-toggle";
toggleBtn.textContent = "Vanita";
document.body.appendChild(toggleBtn);

const style = document.createElement("style");
/*
	Will be replaced with actual css by pack.js.
	Ticks are required to not break the code after CSS injection.
*/
style.textContent = `%CSS%`; // eslint-disable-line
document.head.appendChild(style);