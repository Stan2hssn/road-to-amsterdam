import Device from "./pure/Device";

import { Vector2 } from "three";

import gsap from "gsap";

class Input {
  constructor() {
    this.coords = new Vector2();
    this.dragCoords = new Vector2();
    this.mouseMoved = false;
    this.prevCoords = new Vector2();
    this.prevDragCoords = new Vector2();
    this.delta = new Vector2();
    this.timer = null;
    this.count = 0;
    this.isDragging = false; // New state variable to track dragging

    this.initAnimation();
  }

  initAnimation() {
    this.dragToX = gsap.quickTo(this.dragCoords, "x", {
      duration: 0.5,
      ease: "power1.inOut",
    });
    this.dragToY = gsap.quickTo(this.dragCoords, "y", {
      duration: 0.5,
      ease: "power1.inOut",
    });
    this.xTo = gsap.quickTo(this.coords, "x", {
      duration: 0.5,
      ease: "power1.inOut",
    });

    this.yTo = gsap.quickTo(this.coords, "y", {
      duration: 0.5,
      ease: "power1.inOut",
    });
  }

  init() {
    document.addEventListener(
      "mousemove",
      this.onDocumentMouseMove.bind(this),
      false,
    );
    document.addEventListener(
      "mousedown",
      this.onDocumentMouseDown.bind(this),
      false,
    );
    document.addEventListener(
      "mouseup",
      this.onDocumentMouseUp.bind(this),
      false,
    );
    document.addEventListener(
      "touchstart",
      this.onDocumentTouchStart.bind(this),
      false,
    );
    document.addEventListener(
      "touchmove",
      this.onDocumentTouchMove.bind(this),
      false,
    );
  }

  setCoords(x, y) {
    if (this.timer) clearTimeout(this.timer);

    this.xTo((x / Device.viewport.width) * 2 - 1);
    this.yTo(-(y / Device.viewport.height) * 2 + 1);

    this.mouseMoved = true;
    this.timer = setTimeout(() => {
      this.mouseMoved = false;
    }, 100);
  }

  onDocumentMouseMove(event) {
    this.setCoords(event.clientX, event.clientY);

    if (this.isDragging) {
      // Log only when dragging
      this.dragCoords.copy(this.coords);
      console.log("dragging with mouse", this.dragCoords);
    }
  }

  onDocumentMouseDown(event) {
    this.isDragging = true; // Set dragging state to true
  }

  onDocumentMouseUp(event) {
    if (this.dragTimer) clearTimeout(this.dragTimer);

    this.dragTimer = setTimeout(() => {
      this.isDragging = false; // Set dragging state to false
    }, 100);
  }

  onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
      event.preventDefault();
      this.setCoords(event.touches[0].pageX, event.touches[0].pageY);
    }
  }

  onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
      event.preventDefault();
      this.xTo((x / Device.viewport.width) * 2 - 1);
      this.yTo(-(y / Device.viewport.height) * 2 + 1);

      this.dragCoords.copy(this.coords);
    }
  }

  render() {
    this.delta.subVectors(this.coords, this.prevCoords);
    this.prevCoords.copy(this.coords);
    this.prevDragCoords.copy(this.dragCoords);

    if (this.prevCoords.x === 0 && this.prevCoords.y === 0)
      this.delta.set(0, 0);
  }

  dispose() {}

  resize() {}
}

export default new Input();
