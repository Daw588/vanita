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
		this.target.style.top = this.target.offsetTop - this.offY + "px";
		this.target.style.left = this.target.offsetLeft - this.offX + "px";
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