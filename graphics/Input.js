import Device from "./pure/Device";
import { Vector2 } from "three";
import CustomEase from "gsap/CustomEase";
import gsap from "gsap";

class Input {
  constructor() {
    this.coords = new Vector2();
    this.prevCoords = new Vector2();

    this.delta = new Vector2();
    this.dragDelta = new Vector2();

    this.dragCoords = new Vector2();
    this.prevDragCoords = new Vector2();

    this.scroll = 0;
    this.currentScroll = 0;
    this.previousScroll = 0;

    this.velocity = 0;
    this.inertia = 0;

    this.temp = 0;

    this.timer = null;

    this.isScrolling = false;
    this.canDrag = false;

    this.onMouseMoveBound = this.onDocumentMouseMove.bind(this);
    this.onTouchStartBound = this.onDocumentTouchStart.bind(this);
    this.onTouchMoveBound = this.onDocumentTouchMove.bind(this);
    this.onScrollBound = this.onScroll.bind(this);
  }

  init() {
    this.vTo = gsap.quickTo(this, "velocity", {
      duration: 2,
      ease: "linear",
    });

    document.addEventListener("mousemove", this.onMouseMoveBound, {
      passive: false,
    });
    document.addEventListener("touchstart", this.onTouchStartBound, {
      passive: false,
    });
    document.addEventListener("touchmove", this.onTouchMoveBound, {
      passive: false,
    });
    document.addEventListener("wheel", this.onScrollBound, { passive: false });
  }

  onScroll(event) {
    clearTimeout(this.timer);
    this.isScrolling = true;

    this.currentScroll = event.deltaY;
    this.scroll += this.currentScroll;
    Device.scrollTop = (this.scroll / 2).toFixed(3);
    this.previousScroll = this.scroll;

    this.timer = setTimeout(() => {
      this.isScrolling = false;
    }, 100);
  }

  render() {
    this.delta.subVectors(this.coords, this.prevCoords);
    this.dragDelta.subVectors(this.dragCoords, this.prevDragCoords);

    this.prevCoords.copy(this.coords);

    if (!this.canDrag || this.isScrolling) {
      if (this.inertia > 0) {
        this.inertia -= 0.005;
      } else if (this.inertia < 0) {
        this.inertia += 0.005;
      }

      if (Math.abs(this.inertia) <= 0.01) {
        this.inertia = 0;
      }
    }

    if (Math.abs(this.inertia) > 0.01) {
      this.velocity += this.inertia;
    } else {
      if (Math.abs(this.velocity) <= 0.1) {
        this.velocity = 0;
      }
    }

    if (this.prevCoords.x === 0 && this.prevCoords.y === 0)
      this.delta.set(0, 0);
  }

  setCoords(x, y) {
    this.coords.set(
      (x / Device.viewport.width) * 2 - 1,
      -(y / Device.viewport.height) * 2 + 1,
    );
  }

  onDocumentMouseMove(event) {
    this.setCoords(event.clientX, event.clientY);
  }

  onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
      event.preventDefault();
      this.temp = 0;
      this.inertia = 0;
      this.canDrag = true;

      this.setCoords(event.touches[0].pageX, event.touches[0].pageY);
      this.dragCoords.copy(this.coords);
      this.prevDragCoords.copy(this.coords);
    }
  }

  onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
      clearTimeout(this.dragTimer);
      event.preventDefault();
      this.canDrag = true;
      this.setCoords(event.touches[0].pageX, event.touches[0].pageY);
      this.dragCoords.copy(this.coords);

      this.temp += 0.1;
      this.inertia = this.dragDelta.y / this.temp / 4;

      this.dragTimer = setTimeout(() => {
        this.canDrag = false;
      }, 10);
    } else {
      this.vTo(0);
    }
  }

  dispose() {
    document.removeEventListener("mousemove", this.onMouseMoveBound);
    document.removeEventListener("touchstart", this.onTouchStartBound);
    document.removeEventListener("touchmove", this.onTouchMoveBound);
    document.removeEventListener("wheel", this.onScrollBound);
  }

  resize() {}
}

export default new Input();
