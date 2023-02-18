export default class Draggable {
	private pos1 = 0;
	private pos2 = 0;
	private pos3 = 0;
	private pos4 = 0;
	private target: HTMLElement;

	public constructor(target: HTMLElement) {
		this.target = target;
	}

	public drag(e: MouseEvent) {
		this.dragMouseDown(e);
	}

	private dragMouseDown(e: MouseEvent) {
		e.preventDefault();
		const self = this;
		
		// get the mouse cursor position at startup:
		this.pos3 = e.clientX;
		this.pos4 = e.clientY;
		document.onmouseup = () => self.closeDragElement();
		
		// call a function whenever the cursor moves:
		document.onmousemove = moveEvent => {
			self.elementDrag(moveEvent);
		}
	}

	private elementDrag(e: MouseEvent) {
		e.preventDefault();

		// calculate the new cursor position:
		this.pos1 = this.pos3 - e.clientX;
		this.pos2 = this.pos4 - e.clientY;
		this.pos3 = e.clientX;
		this.pos4 = e.clientY;

		// set the element's new position:
		this.target.style.top = this.target.offsetTop - this.pos2 + "px";
		this.target.style.left = this.target.offsetLeft - this.pos1 + "px";
	}

	private closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}