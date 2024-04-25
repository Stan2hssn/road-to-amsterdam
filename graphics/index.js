import Common from "./Common";
import Output from "./Output";
import Input from "./Input";

export default class {
  constructor({ canvas }) {
    Input.init();
    Common.init({ canvas });
    Common.setupFBO();

    this.output = new Output();

    this.init();
  }

  init() {
    Common.setDebug();
    this.output.setDebug();

    this.resize();
    this.x = this.resize.bind(this);

    window.addEventListener("resize", this.x, false);
  }

  render(t) {
    requestAnimationFrame(this.render.bind(this));
    Input.render(t);
    Common.render(t);
    this.output.render(t);
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
