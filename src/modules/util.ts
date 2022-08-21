export function clamp(value: number, min: number, max: number): number {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

export function makeDraggable(base: HTMLDivElement, handle: HTMLDivElement) {
	let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	handle.onmousedown = dragMouseDown;

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();

		// Get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;

		// Call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();

		// Calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

		// Set the element's new position:
		base.style.top = (base.offsetTop - pos2) + "px";
		base.style.left = (base.offsetLeft - pos1) + "px";
	}

	function closeDragElement() {
		// Stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

export async function getCsrfToken() {
	const res = await fetch("https://avatar.roblox.com/v1/avatar/thumbnail-customization", {
		method: "POST",
		headers: new Headers({
			"Content-Type": "application/json"
		}),
		credentials: "include"
	});

	return res.headers.get("x-csrf-token");
}