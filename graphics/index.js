import Common from "./Common";
import Output from "./Output";
import Input from "./Input";
import { hash } from "three/examples/jsm/nodes/Nodes.js";

export default class {
  constructor({ canvas }) {
    Input.init();
    Common.init({ canvas });

    this.output = new Output();

    this.init();
  }

  init() {
    this.resize();
    this.x = this.resize.bind(this);

    // Common.debug();
    // this.output.debug(Common.pane);

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
