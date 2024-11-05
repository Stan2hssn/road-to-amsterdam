import Common from "./Common";
import Output from "./Output";
import Input from "./Input";
import Dom from "./DOM";

import Stats from "stats.js";

export default class {
  constructor({ canvas }) {
    this.stats = new Stats();
    this.stats.showPanel(0);

    document.body.appendChild(this.stats.dom);

    Input.init();
    Common.init({ canvas });
    Dom.init();

    this.output = new Output();

    this.init();
  }

  init() {
    window.location.hash === "#debug" ? Common.setDebug() : null;

    if (Common.debug) {
      this.output.debug(Common.debug);
    }

    this.resize();
    this.x = this.resize.bind(this);

    window.addEventListener("resize", this.x, false);
  }

  render(t) {
    this.stats.begin();

    requestAnimationFrame(this.render.bind(this));
    Input.render(t);
    Common.render(t);
    Dom.render(t);
    this.output.render(t);
    this.stats.end();
  }

  resize() {
    Input.resize();
    Common.resize();
    Dom.resize();
    this.output.resize();
  }

  destroy() {
    window.removeEventListener("resize", this.x);

    Input.dispose();
    Common.dispose();
    Dom.dispose();
    this.output.dispose();
  }
}
