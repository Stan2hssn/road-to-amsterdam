import Common from "./Common";
import Device from "./pure/Device";
import { Vector2, Raycaster, Uniform, Vector3, LOD } from "three";
import gsap from "gsap";

class Input {
  constructor() {
    // Coordinate-related
    this.coords = new Vector2(0, 0);
    this.prevCoords = new Vector2();
    this.delta = new Vector2();

    // Drag-related
    this.dragCoords = new Vector2();
    this.prevDragCoords = new Vector2();
    this.dragDelta = new Vector2();
    this.canDrag = false;
    this.dragTimer = null;
    this.temp = 0;

    // splatCoords
    this.splatCoords = new Vector2();
    this.prevSplatCoords = new Vector2();

    // Scroll-related
    this.scroll = 0;
    this.previousScroll = 0;
    this.currentScroll = 0;
    this.scrollZ = 0;
    this.zoom = 0;
    this.push = 0;
    this.prevPush = 0;
    this.isScrolling = false;
    this.inertia = 0;

    // Mouse interaction
    this.mouseMoved = false;
    this.mouseVelocity = 0;
    this.mousePowerIn = 1;

    // Raycasting-related
    this.raycaster = new Raycaster();
    this.raycasterCoords = new Vector3(0, 0, 0);
    this.prevRayCoords = new Vector3(0, 0, 0);
    this.rayDelta = new Vector2();
    this.rayVelocity = 0;
    this.interactivesObjects = [];
    this.objectId = new Uniform(null);

    // General interaction states
    this.isHovering = false;
    this.isHolding = false;
    this.isIdling = false;

    // Timer and control variables
    this.timer = null;
    this.count = 0;
    this.idleClock = null;

    // Uniform-related
    this.velocity = 0;
    this.velHigh = false;
    this.camZ = 0;

    // Object properties (if needed)
    this.object = {
      heart: {
        shrink: new Uniform(0),
        motionTime: new Uniform(0),
        idle: new Uniform(0),
        isExplosed: false,
      },
    };

    this.object = {
      heart: {
        shrink: new Uniform(0),
        motionTime: new Uniform(0),
        idle: new Uniform(0),
        isExplosed: false,
      },
    };

    this.boundMethods();
  }

  boundMethods() {
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onMouseOutBound = this.onMouseOut.bind(this);
    this.onTouchStartBound = this.onTouchStart.bind(this);
    this.onTouchMoveBound = this.onTouchMove.bind(this);
    this.onScrollBound = this.onScroll.bind(this);
    this.onMouseDownBound = this.onMouseDown.bind(this);
    this.onMouseUpBound = this.onMouseUp.bind(this);
  }

  init() {
    this.setupBounds();
    this.initGSAPAnimations();
    this.addEventListeners();
    // this.shift();
  }

  setupBounds() {
    const heartElement = document.querySelector(".heart");
    if (heartElement) {
      this.heart = heartElement.getBoundingClientRect();
      this.limitUp = -this.heart.top + Device.viewport.height;
      this.limitBottom = -this.heart.bottom - Device.viewport.height;
    }
  }

  initGSAPAnimations() {
    this.vTo = gsap.quickTo(this, "velocity", {
      duration: 0.2,
      ease: "power1.out",
    });
    this.xTo = gsap.quickTo(this.coords, "x", {
      duration: 0.6,
      ease: "power2.out",
    });
    this.yTo = gsap.quickTo(this.coords, "y", {
      duration: 0.6,
      ease: "power2.out",
    });
    this.zTo = gsap.quickTo(this, "camZ", { duration: 1, ease: "power1.out" });
    this.scrollZTo = gsap.quickTo(this, "scrollZ", {
      duration: 0.5,
      ease: "power1.out",
    });
    this.xRay = gsap.quickTo(this.raycasterCoords, "x", {
      duration: 0.3,
      ease: "power1.out",
    });
    this.yRay = gsap.quickTo(this.raycasterCoords, "y", {
      duration: 0.3,
      ease: "power1.out",
    });
    this.zRay = gsap.quickTo(this.raycasterCoords, "z", {
      duration: 0.3,
      ease: "power1.out",
    });

    this.heartAnimation = gsap.timeline({ paused: true });
  }

  addEventListeners() {
    document.addEventListener("mousemove", this.onMouseMoveBound);
    document.addEventListener("mouseout", this.onMouseOutBound);
    document.addEventListener("touchstart", this.onTouchStartBound, {
      passive: false,
    });
    document.addEventListener("touchmove", this.onTouchMoveBound, {
      passive: false,
    });
    document.addEventListener("mousedown", this.onMouseDownBound);
    document.addEventListener("mouseup", this.onMouseUpBound);
    document.addEventListener("wheel", this.onScrollBound);
  }

  shift() {
    setTimeout(() => {
      Device.scrollTop = -this.scroll / 4 - Device.scrollHeight;
      // Device.scrollTop = 0;

      this.mousePowerIn = 100;
      this.scrollZ = -200;
    }, 300);
  }

  onScroll(event) {
    clearTimeout(this.timer);

    this.velHigh = true;
    this.isScrolling = true;

    this.currentScroll = -event.deltaY / 4;
    this.velocity = this.currentScroll;
    this.scroll = Math.min(
      Math.max(this.scroll + this.currentScroll, -Device.scrollHeight),
      0,
    );
    Device.scrollTop = this.scroll;

    if (this.scroll < this.limitUp && this.scroll > this.limitBottom) {
      const zoomDelta = -event.deltaY * 3;
      this.scrollZTo(Math.min(Math.max(this.scrollZ + zoomDelta, -200), 2));
    }
    if (this.scroll < this.limitUp - Device.viewport.height / 2) {
      gsap.to(this, {
        mousePowerIn: 100,
        duration: 3,
      });
    } else if (this.mousePowerIn > 1) {
      gsap.to(this, {
        mousePowerIn: 1,
        duration: 3,
      });
    }

    this.timer = setTimeout(() => {
      this.isScrolling = false;
      gsap.to(this, { velocity: 0, duration: 0.3 });
    }, 100);
  }

  onMouseOut() {
    this.isHovering = false;
  }

  setCoords(x, y) {
    this.isScrolling = false;
    if (!this.mouseMoved) {
      this.mouseMoved = true;
      gsap.to(this, { mouseVelocity: 1, duration: 1 });
    }

    if (this.velHigh) {
      gsap.to(this, { velocity: 0, duration: 0.3 });
      this.velHigh = false;
    }

    this.xTo((x / Device.viewport.width) * 2 - 1);
    this.yTo(-(y / Device.viewport.height) * 2 + 1);
    this.zTo(Math.abs((x / Device.viewport.width) * 2 - 1));

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {}, 2000);
  }

  render() {
    this.delta.copy(this.coords).sub(this.prevCoords);
    this.prevCoords.copy(this.coords);
    this.prevRayCoords.copy(this.raycasterCoords);
    this.prevSplatCoords.copy(this.splatCoords);

    if (this.delta.length() > 0) {
      this.updateRaycaster();
      this.updateSplatCoords();

      // this.idleCall();
    } else {
      if (this.mouseMoved) {
        gsap.to(this, { mouseVelocity: 0, duration: 0.3 });

        this.mouseMoved = false;
      }
    }

    if (!this.isHovering) {
      gsap.to(this, { rayVelocity: 0, duration: 0.3 });
    } else {
      if (!this.isIdling) {
        // this.idleCall();
      }
    }

    if (Math.abs(this.inertia) > 0.2) {
      this.scroll += this.inertia;
      Device.scrollTop = -this.scroll;
    }
  }

  onMouseMove(event) {
    this.setCoords(event.clientX, event.clientY);
  }

  updateRaycaster() {
    const pointer = this.coords;
    this.raycaster.setFromCamera(pointer, Common.pages.About.cameras.main);
    const intersects = this.raycaster.intersectObjects(
      this.interactivesObjects,
    );

    if (intersects.length > 0) {
      if (!this.isHovering) {
        this.isHovering = true;

        gsap.to(this, { rayVelocity: 1, duration: 1 });
      }

      const { x, y, z } = intersects[0].point;
      this.xRay(x);
      this.yRay(y);
      this.zRay(z);
    } else {
      if (this.isHovering) {
        this.isHovering = false;
        // gsap.to(this, { rayVelocity: 0, duration: 0.3 });
      }
    }
  }

  updateSplatCoords() {
    const pointer = this.coords;
    this.raycaster.setFromCamera(
      pointer,
      Common.pages.Postprocess.cameras.main,
    );
    const intersects = this.raycaster.intersectObjects(
      Common.pages.Postprocess.scenes.main.children,
    );

    if (intersects.length > 0) {
      this.splatCoords.copy(intersects[0].uv);
    }
  }

  onTouchStart(event) {
    if (event.touches.length === 1) {
      this.prevPush = event.touches[0].pageY;
      this.inertia = 0;
    }
  }
  onTouchMove(event) {
    if (event.touches.length === 1) {
      clearTimeout(this.dragTimer);
      this.push = this.prevPush - event.touches[0].pageY;
      this.inertia = this.push * 0.4;
      this.scroll = Math.min(
        Math.max(this.scroll + this.push, 0),
        Device.scrollHeight,
      );
    }
  }

  onMouseDown() {
    this.isHolding = true;
    if (this.isHovering) {
      this.heartAnimation
        .to(this.object.heart.shrink, {
          value: 1,
          duration: 2,
          ease: "power2.inOut",
        })
        .to(this.object.heart.motionTime, {
          value: 8,
          duration: 12,
          onComplete: () => {
            this.object.heart.isExplosed = true;
          },
        });
      this.heartAnimation.play();
    }
  }

  onMouseUp() {
    this.isHolding = false;
    if (this.isHovering && this.object.heart.shrink.value !== 1) {
      this.heartAnimation.reverse();
    }
  }

  idleCall() {
    if (this.object.heart.isExplosed) return;
    clearTimeout(this.idleClock);

    if (!this.isIdling && !this.isHovering) {
      this.idleClock = setTimeout(() => {
        gsap.to(this.object.heart.idle, { value: 1, duration: 3 });
        this.isIdling = true;
      }, 2000);
    } else if (this.isIdling && this.isHovering) {
      gsap.to(this.object.heart.idle, { value: 0, duration: 2 });
      this.isIdling = false;
    }
  }

  dispose() {
    document.removeEventListener("mousemove", this.onMouseMoveBound);
    document.removeEventListener("mouseout", this.onMouseOutBound);
    document.removeEventListener("touchstart", this.onTouchStartBound);
    document.removeEventListener("touchmove", this.onTouchMoveBound);
    document.removeEventListener("wheel", this.onScrollBound);
  }

  resize() {
    if (Device.scrollTop > 0) Device.scrollTop = 0;
    if (Device.scrollTop < -Device.scrollHeight) {
      Device.scrollTop = -Device.scrollHeight;
      this.scroll = -Device.scrollHeight;
    }
  }
}

export default new Input();
