import Emotion from "./DOM/emotion.js";

class DOM {
  Component = {};

  constructor() {}

  init() {
    this.Component.emotion = new Emotion();
  }

  updateComponent(step) {
    // Handle component updates if needed
    console.log("Step updated to:", step);
    Object.keys(this.Component).forEach((key) => {
      if (typeof this.Component[key].update === "function") {
        this.Component[key].update(step);
      }
    });
  }

  dispose() {
    if (this.Component.emotion) {
      this.Component.emotion.dispose();
    }
  }

  render(t) {
    if (this.Component.emotion) {
      this.Component.emotion.render(t);
    }
  }

  resize() {
    if (this.Component.emotion) {
      this.Component.emotion.resize();
    }
  }

  setDebug(debug) {
    // Handle debugging for DOM components if needed
  }
}

export default new DOM();
