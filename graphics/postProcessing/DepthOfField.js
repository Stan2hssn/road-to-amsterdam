import {
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  Uniform,
  WebGLRenderTarget,
  RGBAFormat,
  NearestFilter,
  DepthTexture,
  DepthFormat,
  UnsignedShortType,
  Vector2,
} from "three";

import Common from "../Common.js";
import Device from "../pure/Device.js";
import Shaders from "../pure/Shaders.js";

export default class DephtOfField {
  params = {
    samples: 3, // Samples on the first ring
    rings: 3, // Ring count
    maxBlur: 1.0, // Max blur amount (clamp value)
    showFocus: false, // Show debug focus point
    focalDepth: 1.5, // Focal distance in meters
    focalLength: 12.0, // Focal length in mm
    fstop: 2.0, // F-stop value
    manualdof: false, // Manual depth of field calculation
    ndofstart: 1.0, // Near DOF blur start
    ndofdist: 2.0, // Near DOF blur falloff distance
    fdofstart: 1.0, // Far DOF blur start
    fdofdist: 3.0, // Far DOF blur falloff distance
    CoC: 0.03, // Circle of confusion size in mm
    vignetting: false, // Use vignetting
    vignout: 1.3, // Vignetting outer border
    vignin: 0.0, // Vignetting inner border
    vignfade: 22.0, // F-stops till vignette fades
    autofocus: false, // Use autofocus in shader
    focus: new Vector2(0.5, 0.5), // Autofocus point (0.0, 0.0 to 1.0, 1.0)
    threshold: 0.7, // Highlight threshold
    gain: 100.0, // Highlight gain
    bias: 0.5, // Bokeh edge bias
    fringe: 0.7, // Bokeh chromatic aberration/fringing
    noise: true, // Use noise instead of pattern for sample dithering
    namount: 0.0001, // Dither amount
    depthblur: false, // Blur the depth buffer
    dbsize: 1.25, // Depth blur size
    pentagon: false, // Use pentagon as bokeh shape
    feather: 0.4, // Pentagon shape feather
  };

  constructor(target) {
    this.target = target;
    this.init();
  }

  getOutput() {
    const {
      samples,
      rings,
      maxBlur,
      showFocus,
      focalDepth,
      focalLength,
      fstop,
      manualdof,
      ndofstart,
      ndofdist,
      fdofstart,
      fdofdist,
      CoC,
      vignetting,
      autofocus,
      focus,
      threshold,
      gain,
      bias,
      fringe,
      noise,
      namount,
      depthblur,
      dbsize,
      pentagon,
      feather,
    } = this.params;

    this.outputGeometry = new PlaneGeometry(2, 2);
    this.outputMaterial = new ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        cameraNear: { value: Common.params.cameraNear },
        cameraFar: { value: Common.params.cameraFar },
        samples: { value: samples },
        rings: { value: rings },
        maxBlur: { value: maxBlur },
        showFocus: { value: showFocus },
        focalDepth: { value: focalDepth },
        focalLength: { value: focalLength },
        fstop: { value: fstop },
        manualdof: { value: manualdof },
        ndofstart: { value: ndofstart },
        ndofdist: { value: ndofdist },
        fdofstart: { value: fdofstart },
        fdofdist: { value: fdofdist },
        CoC: { value: CoC },
        vignetting: { value: vignetting },
        autofocus: { value: autofocus },
        focus: { value: focus },
        threshold: { value: threshold },
        gain: { value: gain },
        bias: { value: bias },
        fringe: { value: fringe },
        noise: { value: noise },
        namount: { value: namount },
        depthblur: { value: depthblur },
        dbsize: { value: dbsize },
        pentagon: { value: pentagon },
        feather: { value: feather },
        texel: {
          value: new Vector2(
            1 / Device.viewport.width,
            1 / Device.viewport.height,
          ),
        },
        width: { value: Device.viewport.width * Device.pixelRatio },
        height: { value: Device.viewport.height * Device.pixelRatio },
      },
      vertexShader: Shaders.postProcessing.depthOfField.vertex,
      fragmentShader: Shaders.postProcessing.depthOfField.fragment,
    });

    this.output = new Mesh(this.outputGeometry, this.outputMaterial);
    this.output.position.set(0, 0, 0);
    this.addOutput();
  }

  addOutput() {
    Common.sceneManager.scenes.mainScene.add(this.output);
  }

  init() {
    this.getOutput();
    this.getDepthTexture();
  }

  getRenderTarget() {
    const target = new WebGLRenderTarget(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );
    target.texture.format = RGBAFormat;
    target.texture.minFilter = NearestFilter;
    target.texture.magFilter = NearestFilter;
    target.texture.generateMipmaps = false;
    target.stencilBuffer = false;
    target.depthBuffer = true;
    target.depthTexture = new DepthTexture();
    target.depthTexture.format = DepthFormat;
    target.depthTexture.type = UnsignedShortType;

    return target;
  }

  getDepthTexture() {
    this.dethTarget = this.getRenderTarget();
  }

  render(t) {
    // Render the scene to the render target to get color and depth textures
    Common.rendererManager.renderer.setRenderTarget(this.dethTarget);
    Common.rendererManager.renderer.render(
      Common.sceneManager.scenes.instanceScene,
      Common.cameraManager.cameras.instanceCamera,
    );

    // Update uniforms
    this.output.material.uniforms.tDiffuse.value = this.dethTarget.texture;
    this.output.material.uniforms.tDepth.value = this.dethTarget.depthTexture;
  }

  resize() {
    this.output.material.uniforms.width =
      Device.viewport.width * Device.pixelRatio;
    this.output.material.uniforms.height =
      Device.viewport.height * Device.pixelRatio;

    this.dethTarget.setSize(width, height);
    this.output.material.uniforms.texel.value.set(1 / width, 1 / height);
  }

  dispose() {
    // Clean up resources
    this.outputGeometry.dispose();
    this.outputMaterial.dispose();
    this.dethTarget.dispose();
  }

  debug(debug) {
    const params = this.params;
    const uniforms = this.outputMaterial.uniforms;

    return;
    // Samples
    debug
      .addBinding(params, "samples", {
        label: "Samples",
        min: 1,
        max: 10,
        step: 1,
      })
      .on("change", () => {
        uniforms.samples.value = params.samples;
      });

    // Rings
    debug
      .addBinding(params, "rings", {
        label: "Rings",
        min: 1,
        max: 10,
        step: 1,
      })
      .on("change", () => {
        uniforms.rings.value = params.rings;
      });

    // Max Blur
    debug
      .addBinding(params, "maxBlur", {
        label: "Max Blur",
        min: 0.0,
        max: 10.0,
        step: 0.1,
      })
      .on("change", () => {
        uniforms.maxBlur.value = params.maxBlur;
      });

    // Show Focus
    debug
      .addBinding(params, "showFocus", {
        label: "Show Focus",
      })
      .on("change", () => {
        uniforms.showFocus.value = params.showFocus;
      });

    // Focal Depth
    debug
      .addBinding(params, "focalDepth", {
        label: "Focal Depth",
        min: 0.0,
        max: 100.0,
        step: 0.1,
      })
      .on("change", () => {
        uniforms.focalDepth.value = params.focalDepth;
      });

    // Focal Length
    debug
      .addBinding(params, "focalLength", {
        label: "Focal Length",
        min: 1.0,
        max: 200.0,
        step: 1.0,
      })
      .on("change", () => {
        uniforms.focalLength.value = params.focalLength;
      });

    // F-stop
    debug
      .addBinding(params, "fstop", {
        label: "F-stop",
        min: 0.1,
        max: 22.0,
        step: 0.1,
      })
      .on("change", () => {
        uniforms.fstop.value = params.fstop;
      });

    // Manual DOF
    debug
      .addBinding(params, "manualdof", {
        label: "Manual DOF",
      })
      .on("change", () => {
        uniforms.manualdof.value = params.manualdof;
      });

    // Near DOF Start
    debug
      .addBinding(params, "ndofstart", {
        label: "Near DOF Start",
        min: 0.0,
        max: 100.0,
        step: 0.1,
      })
      .on("change", () => {
        uniforms.ndofstart.value = params.ndofstart;
      });

    // Near DOF Distance
    debug
      .addBinding(params, "ndofdist", {
        label: "Near DOF Distance",
        min: 0.0,
        max: 100.0,
        step: 0.1,
      })
      .on("change", () => {
        uniforms.ndofdist.value = params.ndofdist;
      });

    // Far DOF Start
    debug
      .addBinding(params, "fdofstart", {
        label: "Far DOF Start",
        min: 0.0,
        max: 100.0,
        step: 0.1,
      })
      .on("change", () => {
        uniforms.fdofstart.value = params.fdofstart;
      });

    // Far DOF Distance
    debug
      .addBinding(params, "fdofdist", {
        label: "Far DOF Distance",
        min: 0.0,
        max: 100.0,
        step: 0.1,
      })
      .on("change", () => {
        uniforms.fdofdist.value = params.fdofdist;
      });

    // Circle of Confusion (CoC)
    debug
      .addBinding(params, "CoC", {
        label: "Circle of Confusion",
        min: 0.0,
        max: 0.1,
        step: 0.001,
      })
      .on("change", () => {
        uniforms.CoC.value = params.CoC;
      });

    // Vignetting
    debug
      .addBinding(params, "vignetting", {
        label: "Vignetting",
      })
      .on("change", () => {
        uniforms.vignetting.value = params.vignetting;
      });

    // Autofocus
    debug
      .addBinding(params, "autofocus", {
        label: "Autofocus",
      })
      .on("change", () => {
        uniforms.autofocus.value = params.autofocus;
      });

    // Focus X
    debug
      .addBinding(params.focus, "x", {
        label: "Focus X",
        min: 0.0,
        max: 1.0,
        step: 0.01,
      })
      .on("change", () => {
        uniforms.focus.value.x = params.focus.x;
      });

    // Focus Y
    debug
      .addBinding(params.focus, "y", {
        label: "Focus Y",
        min: 0.0,
        max: 1.0,
        step: 0.01,
      })
      .on("change", () => {
        uniforms.focus.value.y = params.focus.y;
      });

    // Threshold
    debug
      .addBinding(params, "threshold", {
        label: "Threshold",
        min: 0.0,
        max: 1.0,
        step: 0.01,
      })
      .on("change", () => {
        uniforms.threshold.value = params.threshold;
      });

    // Gain
    debug
      .addBinding(params, "gain", {
        label: "Gain",
        min: 0.0,
        max: 200.0,
        step: 1.0,
      })
      .on("change", () => {
        uniforms.gain.value = params.gain;
      });

    // Bias
    debug
      .addBinding(params, "bias", {
        label: "Bias",
        min: 0.0,
        max: 1.0,
        step: 0.01,
      })
      .on("change", () => {
        uniforms.bias.value = params.bias;
      });

    // Fringe
    debug
      .addBinding(params, "fringe", {
        label: "Fringe",
        min: 0.0,
        max: 1.0,
        step: 0.01,
      })
      .on("change", () => {
        uniforms.fringe.value = params.fringe;
      });

    // Noise
    debug
      .addBinding(params, "noise", {
        label: "Noise",
      })
      .on("change", () => {
        uniforms.useNoise.value = params.noise;
      });

    // Noise Amount
    debug
      .addBinding(params, "namount", {
        label: "Noise Amount",
        min: 0.0,
        max: 0.01,
        step: 0.0001,
      })
      .on("change", () => {
        uniforms.namount.value = params.namount;
      });

    // Depth Blur
    debug
      .addBinding(params, "depthblur", {
        label: "Depth Blur",
      })
      .on("change", () => {
        uniforms.depthblur.value = params.depthblur;
      });

    // Depth Blur Size
    debug
      .addBinding(params, "dbsize", {
        label: "Depth Blur Size",
        min: 0.0,
        max: 10.0,
        step: 0.1,
      })
      .on("change", () => {
        uniforms.dbsize.value = params.dbsize;
      });

    // Pentagon Bokeh
    debug
      .addBinding(params, "pentagon", {
        label: "Pentagon Bokeh",
      })
      .on("change", () => {
        uniforms.pentagon.value = params.pentagon;
      });

    // Feather
    debug
      .addBinding(params, "feather", {
        label: "Feather",
        min: 0.0,
        max: 1.0,
        step: 0.01,
      })
      .on("change", () => {
        uniforms.feather.value = params.feather;
      });
  }
}
