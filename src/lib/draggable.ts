export default class Draggable {
	private offX = 0;
	private offY = 0;
	private mouseX = 0;
	private mouseY = 0;
	public readonly target: HTMLElement;
	private dragCompletedCallbacks: (() => void)[] = [];

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
		this.mouseX = e.clientX;
		this.mouseY = e.clientY;
		document.onmouseup = () => self.closeDragElement();
		
		// call a function whenever the cursor moves:
		document.onmousemove = moveEvent => {
			self.elementDrag(moveEvent);
		}
	}

	private elementDrag(e: MouseEvent) {
		e.preventDefault();

		// calculate the new cursor position:
		this.offX = this.mouseX - e.clientX;
		this.offY = this.mouseY - e.clientY;
		this.mouseX = e.clientX;
		this.mouseY = e.clientY;

		// set the element's new position:
		this.updateWindowPosition();
	}

	public updateWindowPosition() {
		let x = this.target.offsetLeft - this.offX;
		let y = this.target.offsetTop - this.offY;

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		const targetStyle = window.getComputedStyle(this.target);
		const targetWidth = parseFloat(targetStyle.width);
		const targetHeight = parseFloat(targetStyle.height);

		// Prevent the window from going out viewport horizontally
		if (x < 0) {
			x = 0;
		} else if (x + targetWidth > viewportWidth) {
			x = viewportWidth - targetWidth;
		}

		// Prevent the window from going out viewport vertically
		if (y < 0) {
			y = 0;
		} else if (y + targetHeight > viewportHeight) {
			y = viewportHeight - targetHeight;
		}

		this.target.style.left = x + "px";
		this.target.style.top = y + "px";
	}

	get targetX() {
		return parseFloat(this.target.style.left);
	}

	set targetX(value: number) {
		this.target.style.left = value + "px";
	}

	get targetY() {
		return parseFloat(this.target.style.top);
	}

	set targetY(value: number) {
		this.target.style.top = value + "px";
	}

	private closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;

		this.dragCompletedCallbacks.forEach(callback => callback());
	}

	public onDragCompleted(callback: () => void) {
		this.dragCompletedCallbacks.push(callback);
	}
}