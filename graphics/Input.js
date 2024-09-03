import Common from "./Common";
import Device from "./pure/Device";

import { Vector2, Raycaster, Uniform } from "three";

import gsap from "gsap";
import { Group } from "three/examples/jsm/libs/tween.module.js";

class Input {
  constructor() {
    this.coords = new Vector2(0, 0);
    this.camZ = 0;
    this.scrollZ = 0;
    this.zoom = 0;

    this.isScrolling = false;
    this.canDrag = false;

    this.mouseMoved = false;
    this.prevCoords = new Vector2();

    this.dragCoords = new Vector2();
    this.prevDragCoords = new Vector2();
    this.dragDelta = new Vector2();

    this.delta = new Vector2();
    this.timer = null;
    this.temp = 0;

    this.scroll = 0;
    this.previousScroll = 0;
    this.currentScroll = 0;
    this.push = 0;
    this.prevPush = 0;

    this.count = 0;

    this.velocity = 0;
    this.inertia = 0;

    this.dragTimer = null;

    this.mouseVelocity = 0;

    this.raycaster = new Raycaster();
    this.raycasterCoords = new Vector2();
    this.objectId = new Uniform(null);
    this.isHovering = false;

    if (!Device.isMobile) {
      this.coords.set(-0.5, 0);

      this.velocity = 0;
      this.inertia = 0;
      this.onMouseMoveBound = this.onDocumentMouseMove.bind(this);
    }
    this.onTouchStartBound = this.onDocumentTouchStart.bind(this);
    this.onTouchMoveBound = this.onDocumentTouchMove.bind(this);
    this.onScrollBound = this.onScroll.bind(this);
  }

  init() {
    this.interactivesObjects = Common.pages.About.groups.main.children;
    this.heart = document.querySelector(".heart").getBoundingClientRect();
    this.limitUp = -this.heart.top + Device.viewport.height;
    this.limitBottom = -this.heart.bottom - Device.viewport.height;

    this.vTo = gsap.quickTo(this, "velocity", {
      duration: 0.2,
      ease: "power1.out",
    });

    this.xTo = gsap.quickTo(this.coords, "x", {
      duration: 0.6,
      ease: "power2.out",
    });

    this.yTo = gsap.quickTo(this.coords, "y", {
      duration: 1,
      ease: "power2.out",
    });

    this.zTo = gsap.quickTo(this, "camZ", {
      duration: 1,
      ease: "power1.out",
    });

    this.scrollZTo = gsap.quickTo(this, "scrollZ", {
      duration: 0.5,
      ease: "power1.out",
    });

    document.addEventListener("mousemove", this.onMouseMoveBound, false);
    document.addEventListener("touchstart", this.onTouchStartBound, {
      passive: false,
    });
    document.addEventListener("touchmove", this.onTouchMoveBound, {
      passive: false,
    });

    document.addEventListener("wheel", this.onScrollBound, false);

    // this.shift();
  }

  shift() {
    setTimeout(() => {
      Device.scrollTop = -this.scroll / 4 - 2300;
    }, 0);
  }

  onScroll(event) {
    clearTimeout(this.timer);
    this.isScrolling = true;
    this.currentScroll = -event.deltaY / 4;
    this.clamp = Math.min(
      Math.max(this.scroll + this.currentScroll, -Device.scrollHeight),
      0,
    );

    this.scroll = this.clamp;

    Device.scrollTop = this.clamp;

    if (this.clamp < this.limitUp && this.clamp > this.limitBottom) {
      this.zoom = -event.deltaY * 3;
      this.actualZoom = Math.min(Math.max(this.scrollZ + this.zoom, -200), 2);
      this.scrollZTo(this.actualZoom);

      console.log("scrollZ", this.scrollZ);
    }

    this.timer = setTimeout(() => {
      this.isScrolling = false;
    }, 100);
  }

  setCoords(x, y) {
    if (this.timer) clearTimeout(this.timer);

    this.xTo((x / Device.viewport.width) * 2 - 1);
    this.yTo(-(y / Device.viewport.height) * 2 + 1);
    this.zTo(Math.abs((x / Device.viewport.width) * 2 - 1));

    this.mouseMoved = true;
    this.timer = setTimeout(() => {
      this.mouseMoved = false;
    }, 100);
  }

  render() {
    this.delta.subVectors(this.coords, this.prevCoords);

    this.prevCoords.copy(this.coords);

    if (!this.canDrag) {
      if (this.inertia > 0) {
        this.inertia -= 0.4;
      } else if (this.inertia < 0) {
        this.inertia += 0.4;
      }

      if (Math.abs(this.inertia) <= 0.1) {
        this.inertia = 0;
      }
    }

    if (
      Math.abs(this.inertia) > 0.2 &&
      this.scroll >= 0 &&
      this.scroll <= Device.scrollHeight
    ) {
      this.scroll += this.inertia;

      Device.scrollTop = -this.scroll;
    } else {
      if (Math.abs(this.velocity) <= 0.1) {
        this.previousScroll = this.scroll;

        this.inertia = 0;
      }
    }

    if (this.prevCoords.x === 0 && this.prevCoords.y === 0) {
      this.delta.set(0, 0);
    }
  }

  onDocumentMouseMove(event) {
    this.setCoords(event.clientX, event.clientY);
    // this.updateRaycatser();
  }

  updateRaycatser() {
    const pointer = this.coords;
    this.raycaster.setFromCamera(pointer, Common.pages.About.cameras.main);

    const intersects = this.raycaster.intersectObjects(
      this.interactivesObjects,
    );

    if (intersects.length > 0) {
      const { x, y } = intersects[0].point;

      // this.raycasterCoords.set(x, y);
      this.isHovering = true;
    } else {
      this.isHovering = false;
    }
  }

  onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
      this.canDrag = true;
      this.temp = 0;
      this.inertia = 0;
      // this.setCoords(event.touches[0].pageX, event.touches[0].pageY);
      this.prevPush = event.touches[0].pageY;
    }
  }

  onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
      clearTimeout(this.dragTimer);

      this.temp += 0.1;

      // Calculate the change in Y position
      this.push = this.prevPush - event.touches[0].pageY;

      this.currentScroll = this.push * 0.8;

      this.inertia = this.currentScroll / this.temp / 20;

      // Adjust scroll calculation for better responsiveness
      this.scroll = Math.min(
        Math.max(this.previousScroll + this.currentScroll, 0),
        Device.scrollHeight,
      );

      this.dragTimer = setTimeout(() => {
        this.canDrag = false;
      }, 10);
    }
  }

  dispose() {
    document.removeEventListener("mousemove", this.onMouseMoveBound);
    document.removeEventListener("touchstart", this.onTouchStartBound);
    document.removeEventListener("touchmove", this.onTouchMoveBound);
    document.removeEventListener("wheel", this.onScrollBound);
    this.interactivesObjects = [];
  }

  resize() {
    if (Device.scrollTop > 0) {
      Device.scrollTop = 0;
    } else if (Device.scrollTop < -Device.scrollHeight) {
      Device.scrollTop = -Device.scrollHeight;
      this.scroll = -Device.scrollHeight;
      this.previousScroll = -Device.scrollHeight + 10;
    }
  }
}

export default new Input();
