import Device from "./pure/Device";
import { Vector2 } from "three";

import CustomEase from "gsap/CustomEase";
import gsap from "gsap";

class Input {
  constructor() {
    this.coords = new Vector2();
    this.mouseMoved = false;
    this.prevCoords = new Vector2();
    this.delta = new Vector2();
    this.timer = null;
    this.scroll = 0;
    this.previousScroll = 0;
    this.currentScroll = 0;
    this.count = 0;
    this.velocity = 0;

    this.onMouseMoveBound = this.onDocumentMouseMove.bind(this);
    this.onTouchStartBound = this.onDocumentTouchStart.bind(this);
    this.onTouchMoveBound = this.onDocumentTouchMove.bind(this);
    this.onScrollBound = this.onScroll.bind(this);
  }

  init() {
    gsap.registerPlugin(CustomEase);
    this.xTo = gsap.quickTo(this, "velocity", {
      duration: 5,
      ease: CustomEase.create("custom", "M0,0 C0.18,0.411 0.299,0.791 1,1 "),
    });

    document.addEventListener("mousemove", this.onMouseMoveBound, false);
    document.addEventListener("touchstart", this.onTouchStartBound, {
      passive: false,
    });
    document.addEventListener("touchmove", this.onTouchMoveBound, {
      passive: false,
    });
    document.addEventListener("wheel", this.onScrollBound, false);
  }

  onScroll(event) {
    clearTimeout(this.timer);
    this.currentScroll = event.deltaY;
    this.xTo(this.currentScroll / 6000);
    this.scroll += this.currentScroll;
    Device.scrollTop = (this.scroll / 2).toFixed(3);
    this.previousScroll = this.scroll;
    Device.velocity = -this.velocity;

    this.timer = setTimeout(() => {
      this.xTo(0);

      gsap.to(Device, {
        duration: 4,
        velocity: 0,
        ease: CustomEase.create("custom", "M0,0 C0.18,0.411 0.299,0.791 1,1 "),

        onUpdate: () => {
          Device.velocity = -this.velocity;
        },
      });
    }, 30);
  }

  render() {
    this.delta.subVectors(this.coords, this.prevCoords);
    this.prevCoords.copy(this.coords);

    if (this.prevCoords.x === 0 && this.prevCoords.y === 0)
      this.delta.set(0, 0);
  }

  setCoords(x, y) {
    if (this.timer) clearTimeout(this.timer);
    this.coords.set(
      (x / Device.viewport.width) * 2 - 1,
      -(y / Device.viewport.height) * 2 + 1,
    );
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

  dispose() {
    document.removeEventListener("mousemove", this.onMouseMoveBound);
    document.removeEventListener("touchstart", this.onTouchStartBound);
    document.removeEventListener("touchmove", this.onTouchMoveBound);
    document.removeEventListener("wheel", this.onScrollBound);
  }

  resize() {}
}

export default new Input();
