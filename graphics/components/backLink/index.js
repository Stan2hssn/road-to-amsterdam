import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
  Vector2,
  WebGLRenderTarget,
  RGBAFormat,
  NearestFilter,
  DepthFormat,
  DepthTexture,
  UnsignedShortType,
  TextureLoader,
} from "three";
import Device from "../../pure/Device";
import Common from "../../Common";
import Input from "../../Input";
import pixelsVertex from "../glsl/pixels/pixel.vert";
import pixelsFragment from "../glsl/pixels/pixel.frag";

export default class {
  constructor() {
    this.glb = null;
    this.screen = null;
    this.renderTarget = null;
    this.glbNear = -5;
    this.glbFar = -10;
    this.timeline = gsap.timeline({ paused: true });
    this.updateCallback = false;

    this.timer = null;
    this.t = 0;
    this.t1 = 0;

    this.init();
  }

  init() {
    clearTimeout(this.timer);

    this.modelLoader = new GLTFLoader();
    this.loader = new TextureLoader();
    this.getTexture();

    this.renderTarget = this.getRenderTarget();

    // Load the 3D model
    this.modelLoader.load("/Models/Arrow.glb", (glb) => {
      const gltfScale = 1;
      glb.scene.scale.set(gltfScale, gltfScale, gltfScale);
      glb.scene.position.set(0, 0, this.glbFar);
      glb.scene.rotation.set(0, Math.PI, 0);

      glb.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new MeshBasicMaterial({
            color: 0x236a88,
          });
        }
      });

      this.glb = glb.scene;
      Common.pages.About.scenes.depth.add(this.glb);

      this.setupAnchorHover();
    });

    this.screen = this.createScreenMesh();
    Common.pages.About.scenes.story.add(this.screen);

    this.timer = setTimeout(() => {
      this.resize(Common.scale, Device.viewport.height, Device.viewport.width);
    }, 1000);
  }

  setupAnchorHover() {
    const anchorElements = document.querySelectorAll("a.link");

    anchorElements.forEach((anchor) => {
      anchor.addEventListener("mouseenter", () => this.start());
      anchor.addEventListener("mouseleave", () => this.stop());
    });
  }

  start() {
    if (!this.glb) return;
    gsap.to(this.glb.position, {
      z: this.glbNear,
      duration: 2,
      ease: "power4.out",
      overwrite: "auto",
      onStart: () => {
        this.updateCallback = true;
      },
    });
  }

  stop() {
    if (!this.glb) return;

    gsap.to(this.glb.position, {
      z: this.glbFar,
      duration: 1.5,
      ease: "power1.in",
      overwrite: "auto",
      onStart: () => {
        this.updateCallback = true;
      },
      onComplete: () => {
        this.updateCallback = false;
      },
    });
  }

  updateRotation(t) {
    if (this.updateCallback) {
      this.t1 += 0.04;

      this.glb.rotation.y = Math.sin(t * 0.2);
      this.glb.rotation.z = Math.cos(t * 0.2);
      this.glb.rotation.x = Math.PI * 1.25;
    }
  }

  render(t, render) {
    if (!this.updateCallback && !render) return;

    this.t += 0.04;

    this.updateRotation(this.t);

    this.screen.material.uniforms.uTime.value = this.t;
    this.screen.material.uniforms.uMouse.value = Input.coords;

    Common.renderer.setRenderTarget(this.renderTarget);
    Common.renderer.render(
      Common.pages.About.scenes.depth,
      Common.pages.About.cameras.depth.main,
    );

    this.screen.material.uniforms.uInfoTexture.value =
      this.renderTarget.depthTexture;
    this.screen.material.uniforms.uTexture.value = this.renderTarget.texture;
    this.screen.position.y = Device.scrollTop;
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
    target.stencilBuffer = true;
    target.depthBuffer = true;
    target.depthTexture = new DepthTexture();
    target.depthTexture.format = DepthFormat;
    target.depthTexture.type = UnsignedShortType;

    return target;
  }

  getTexture() {
    this.noise = this.loader.load("/Texture/noise_light.jpg");
  }

  createScreenMesh() {
    return new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        vertexShader: pixelsVertex,
        fragmentShader: `
        precision highp float;
        #include <packing>

        uniform float uTime;
        uniform float cameraNear;
        uniform float cameraFar;
        
        varying vec2 vUv;
        uniform vec2 uResolution;
        uniform vec2 uMouse;

        varying vec3 vPos;

        uniform sampler2D uInfoTexture;
        uniform sampler2D uTexture;
        uniform sampler2D tNoise;

        #define uBlurStrength 1.;
        
        float readDepth( sampler2D uInfoTexture, vec2 coord ) {
                float fragCoordZ = texture2D( uInfoTexture, coord ).x;
                float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
                return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        }

        float tvNoise (vec2 p, float ta, float tb) {
            return fract(sin(p.x * ta + p.y * tb) * 5678.);
        }
        vec3 draw(sampler2D image, vec2 uv) {
            return texture2D(image,vec2(uv.x, uv.y)).rgb;   
        }
        float rand(vec2 co){
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        vec3 blur(vec2 uv, sampler2D image, float blurAmount){
            vec3 blurredImage = vec3(0.);
        
            #define repaet 30.
            for (float i = 0.; i < repaet; i++) { 
                vec2 q = vec2(cos(degrees((i / repaet) * 360.)), sin(degrees((i / repaet) * 360.))) * (rand(vec2(i, uv.x + uv.y)) + blurAmount); 
                vec2 uv2 = uv + (q * blurAmount);
                blurredImage += draw(image, uv2) / 2.;
                q = vec2(cos(degrees((i / repaet) * 360.)), sin(degrees((i / repaet) * 360.))) * (rand(vec2(i + 2., uv.x + uv.y + 24.)) + blurAmount); 
                uv2 = uv + (q * blurAmount);
                blurredImage += draw(image, uv2) / 2.;
            }
            return blurredImage / repaet;
        }

        vec3 blur2(vec2 uv, sampler2D image, float blurAmount){
            vec3 blurredImage = vec3(0.);
                float t = uTime + 120.;

            
            float ta = t * 0.654321;
            float tb = t * (ta * 0.123456);
            vec4 noise = vec4(vec3(1. - tvNoise(uv, ta, tb)), 1.); 
            float depth = readDepth(uInfoTexture, uv); 
            float gradient = smoothstep(-0.2, 1.,  blur(uv, uInfoTexture, .005).r - .2);

            #define repeats 40.
            for (float i = 0.; i < repeats; i++) { 
                vec2 q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i, uv.x + uv.y)) + blurAmount); 
                vec2 uv2 = uv + (q * blurAmount * gradient);
                blurredImage += draw(image, uv2) / 2.;
                q = vec2(cos(degrees((i / repeats) * 360.)), sin(degrees((i / repeats) * 360.))) * (rand(vec2(i + 2., uv.x + uv.y + 24.)) + blurAmount); 
                uv2 = uv + (q * blurAmount * gradient);
                blurredImage += draw(image, uv2) / 2.;
            }
            return blurredImage / repeats;
        }

        void main() {
                float t = uTime + 120.;
                vec2 uv = vUv;
                uv -= 0.5;

                vec2 winUv = gl_FragCoord.xy / uResolution.xy;
                float depth = readDepth(uInfoTexture, winUv); 
                float gradient = smoothstep(-0.2, 1.,  blur(winUv, uInfoTexture, .01).r - .2);

                float ta = t * 0.654321;
                float tb = t * (ta * 0.123456);
                vec4 noise = vec4(vec3(1. - tvNoise(winUv, ta, tb)), 1.);

                float ratio = uResolution.x / uResolution.y;

                float direction = step(1., ratio);

                vec2 responsive = vec2(mix(ratio, 1.0, direction), mix(1.0, 1.0 / ratio, direction));
                vec2 mUv = uv * responsive;

                winUv -= vec2(uMouse.x * .5, uMouse.y * .505);

                vec2 corrected_mouse = uMouse * responsive;



                
                vec4 color = vec4(blur2( winUv , uTexture, .08),1.);  
                // color = texture2D(uTexture, winUv);
                color -= noise * .01;  
                
                gl_FragColor = vec4(winUv, 1., 1.);
                gl_FragColor = vec4(vec3(gradient), 1.);
                gl_FragColor = noise;
                gl_FragColor = color;
                }
`,
        uniforms: {
          uTime: new Uniform(100 * Math.random()),
          uResolution: new Uniform(
            new Vector2(
              Device.viewport.width,
              Device.viewport.height,
            ).multiplyScalar(Device.pixelRatio),
          ),
          uMouse: new Uniform(Input.coords),
          uTexture: new Uniform(null),
          uInfoTexture: new Uniform(null),
          cameraNear: new Uniform(Common.params.depth.near),
          cameraFar: new Uniform(Common.params.depth.far),
          tNoise: new Uniform(this.noise),
        },
      }),
    );
  }

  resize(scale, height, width) {
    this.updateCallback = true;
    const rect = document.querySelector(".back_link").getBoundingClientRect();

    this.screen.scale.set(
      Device.viewport.width * 1.2,
      Device.viewport.height * 1.2,
      1,
    );
    this.screen.position.set(
      rect.left + rect.width * 0.5 - width * 0.5,
      -rect.top + Device.scrollTop - rect.height * 0.5 + height * 0.5,
      -50,
    );

    this.screen.material.uniforms.uResolution.value
      .set(Device.viewport.width, Device.viewport.height)
      .multiplyScalar(Device.pixelRatio);

    this.renderTarget.setSize(
      Device.viewport.width * Device.pixelRatio,
      Device.viewport.height * Device.pixelRatio,
    );

    this.updateCallback = false;
    this.render(0, true);
  }

  setDebug(debug) {}
}
