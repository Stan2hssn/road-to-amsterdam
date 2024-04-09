import Common from "./Common";
import Output from "./Output";
import Input from "./Input";
import Device from "./pure/Device";

export default class {
  constructor({ canvas, scrollContainer }) {
    Input.init();
    Common.init({ canvas, scrollContainer });

    this.output = new Output();

    this.init();
  }

  init() {
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
