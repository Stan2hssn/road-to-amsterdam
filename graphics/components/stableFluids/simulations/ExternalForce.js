import ShaderPass from "./ShaderPass";
import Shaders from "../../glsl/Shaders";

import { PlaneGeometry, ShaderMaterial, Vector2, Mesh } from "three";
import Input from "../../../Input";

export default class ExternalForce extends ShaderPass {
  constructor(simProps) {
    super({
      output: simProps.dst,
    });
    this.init(simProps);
  }

  init(simProps) {
    super.init();

    const mousG = new PlaneGeometry(1, 1);

    const mouseM = new ShaderMaterial({
      uniforms: {
        px: { value: simProps.cellScale },
        force: { value: new Vector2(0, 0) },
        center: { value: new Vector2(0, 0) },
        scale: { value: new Vector2(simProps.cursorSize, simProps.cursorSize) },
      },
      vertexShader: Shaders.simulation.sim.mouse,
      fragmentShader: Shaders.simulation.sim.externalForce,
    });

    this.mouse = new Mesh(mousG, mouseM);
    this.scene.add(this.mouse);
  }

  update(props) {
    const forceX = (Input.delta.x / 2) * props.mouse_force;
    const forceY = (Input.delta.y / 2) * props.mouse_force;

    const cursorSizeX = props.cursor_size * props.cellScale.x;
    const cursorSizeY = props.cursor_size * props.cellScale.y;

    const centerX = Math.min(
      Math.max(Input.coords.x, -1 + cursorSizeX + props.cellScale.x * 2),
      1 - cursorSizeX - props.cellScale.x * 2,
    );
    const centerY = Math.min(
      Math.max(Input.coords.y, -1 + cursorSizeY + props.cellScale.y * 2),
      1 - cursorSizeY - props.cellScale.y * 2,
    );

    const uniforms = this.mouse.material.uniforms;

    uniforms.force.value.set(forceX, forceY);
    uniforms.center.value.set(centerX, centerY);
    uniforms.scale.value.set(props.cursor_size, props.cursor_size);

    super.update();
  }
}
