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
    this.scroll = 0;
    this.previousScroll = 0;
    this.currentScroll = 0;
    this.count = 0;
    this.velocity = 0;
    this.mouseVelocity = 0;

    this.onMouseMoveBound = this.onDocumentMouseMove.bind(this);
    this.onTouchStartBound = this.onDocumentTouchStart.bind(this);
    this.onTouchEndBound = this.onDocumentTouchEnd.bind(this);
    this.onTouchMoveBound = this.onDocumentTouchMove.bind(this);

    this.onScrollBound = this.onScroll.bind(this);
  }

  init() {
    this.vTo = gsap.quickTo(this, "velocity", {
      duration: 0.2,
      ease: "power1.out",
    });

    this.xTo = gsap.quickTo(this.coords, "x", {
      duration: 0.2,
      ease: "power2.out",
    });

    this.yTo = gsap.quickTo(this.coords, "y", {
      duration: 0.2,
      ease: "power2.out",
    });

    document.addEventListener("mousemove", this.onMouseMoveBound, false);
    document.addEventListener("touchstart", this.onTouchStartBound, {
      passive: false,
    });
    document.addEventListener("touchmove", this.onTouchMoveBound, {
      passive: false,
    });
    document.addEventListener("touchend", this.onTouchEndBound, {
      passive: true,
    });
    document.addEventListener("wheel", this.onScrollBound, false);
  }

  onScroll(event) {
    clearTimeout(this.timer);
    this.currentScroll = event.deltaY;
    this.vTo(this.currentScroll / 20000);
    this.scroll += this.currentScroll;
    console.log("scrolling", Device.scrollTop, "velocity", this.scroll);
    Device.scrollTop = (this.scroll / 2).toFixed(3);
    this.previousScroll = this.scroll;
    Device.velocity = -this.velocity;

    this.timer = setTimeout(() => {
      this.vTo(0);

      gsap.to(Device, {
        duration: 0.5,
        velocity: 0,
        onUpdate: () => {
          Device.velocity = -this.velocity;
        },
      });
    }, 30);
  }

  render() {
    this.delta.subVectors(this.coords, this.prevCoords);
    this.prevCoords.copy(this.coords);

    if (this.prevCoords.x === 0 && this.prevCoords.y === 0) {
      this.delta.set(0, 0);
    }
  }

  setCoords(x, y) {
    if (this.timer) clearTimeout(this.timer);
    this.xTo((x / Device.viewport.width) * 2 - 1);
    this.yTo(-(y / Device.viewport.height) * 2 + 1);
    gsap.to(this, {
      mouseVelocity: 1,
      duration: 0.8,
      ease: "power2.out",
    });

    this.timer = setTimeout(() => {
      gsap.to(this, {
        mouseVelocity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      this.mouseMoved = false;
    }, 500);
  }

  onDocumentMouseMove(event) {
    this.setCoords(event.clientX, event.clientY);
  }

  onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
      event.preventDefault();
      this.mouseMoved = true;
      this.setCoords(event.touches[0].pageX, event.touches[0].pageY);
      gsap.to(this, {
        mouseVelocity: 1,
        duration: 2,
        ease: "power1.out",
      });
    }
  }

  onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
      event.preventDefault();
      this.setCoords(event.touches[0].pageX, event.touches[0].pageY);
    }
  }

  onDocumentTouchEnd(event) {
    if (event.touches.length === 0) {
      gsap.to(this, {
        mouseVelocity: 0,
        duration: 2,
        ease: "power1.out",
      });
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
