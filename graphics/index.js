import Common from "./Common";
import Output from "./Output";
import Input from "./Input";
import Stats from "stats.js";

export default class {
  constructor({ canvas }) {
    this.stats = new Stats();

    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    Input.init();
    Common.init({ canvas });
    this.output = new Output();

    this.init();
  }

  init() {
    this.resize();
    this.x = this.resize.bind(this);

    if (window.location.hostname === "localhost") {
      Common.debug();
      this.output.debug();
    }

    window.addEventListener("resize", this.x, false);
  }

  render(t) {
    this.stats.begin();
    Input.render(t);
    Common.render(t);
    this.output.render(t);
    this.stats.end();
    requestAnimationFrame(this.render.bind(this));
  }

  resize() {
    Input.resize();
    Common.resize();
    this.output.resize();
  }

  destroy() {
    window.removeEventListener("resize", this.x);

    Input.dispose();
    Common.dispose();
    this.output.dispose();
  }
}
