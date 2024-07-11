import Device from "./pure/Device";
import { Vector2 } from "three";
import gsap from "gsap";

class Input {
  constructor() {
    this.coords = new Vector2();
    this.mouseMoved = false;
    this.prevCoords = new Vector2();
    this.delta = new Vector2();
    this.timer = null;
    this.count = 0;
    this.scrollTop = 0;
    this.scroll = 0;
    this.currentScroll = 0;
    this.previousScroll = 0;
    this.isScrolling = false;
  }

  init() {
    this.xTo = gsap.quickTo(this.coords, "x", {
      duration: 0.3,
      ease: "power2.out",
    });

    this.yTo = gsap.quickTo(this.coords, "y", {
      duration: 0.3,
      ease: "power2.out",
    });

    this.scrollTo = gsap.quickTo(this, "scrollTop", {
      duration: 0.8,
      ease: "power1.out",
    });

    document.addEventListener("wheel", this.onScroll.bind(this), {
      passive: true, // Set to true to improve scroll performance
    });

    document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this));
    document.addEventListener(
      "touchstart",
      this.onDocumentTouchStart.bind(this),
      { passive: true }, // Mark the listener as passive for better performance
    );
    document.addEventListener(
      "touchmove",
      this.onDocumentTouchMove.bind(this),
      { passive: true }, // Mark the listener as passive for better performance
    );
  }

  onScroll(event) {
    clearTimeout(this.timer);
    this.isScrolling = true;
    this.currentScroll = event.deltaY;
    this.scroll = this.scroll + this.currentScroll;
    Device.cameraY = -this.scroll / 200;
    this.previousScroll = this.scroll;

    this.timer = setTimeout(() => {
      this.isScrolling = false;
    }, 100);
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
      this.setCoords(event.touches[0].pageX, event.touches[0].pageY);
    }
  }

  render() {
    this.delta.subVectors(this.coords, this.prevCoords);
    this.prevCoords.copy(this.coords);

    if (this.prevCoords.x === 0 && this.prevCoords.y === 0) {
      this.delta.set(0, 0);
    }
  }

  dispose() {}

  resize() {}
}

export default new Input();
