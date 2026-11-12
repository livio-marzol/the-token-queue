import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RgbShiftShader } from '../shaders/RgbShiftShader.js';

export class World {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = this.checkMobile();

    // Inicializa suporte a RectAreaLight shaders
    RectAreaLightUniformsLib.init();

    this.pointer = new THREE.Vector2(-999, -999);
    this.raycaster = new THREE.Raycaster();

    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLights();
    this.initPostProcessing();
    this.bindEvents();
  }

  checkMobile() {
    return (
      window.innerWidth < 768 ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0)
    );
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060709, this.isMobile ? 0.045 : 0.035);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.1,
      100
    );
    this.adjustCameraForViewport();
  }

  adjustCameraForViewport() {
    // Em telas verticais de smartphone (aspect < 1), afasta a câmera para evitar que os objetos 3D
    // ocupem 100% da largura e colidam com os textos HTML
    const aspect = this.width / this.height;
    if (aspect < 1.0) {
      this.camera.position.set(0, 0, Math.min(7.0 / Math.max(aspect * 1.1, 0.5), 11.5));
    } else {
      this.camera.position.set(0, 0, 7.0);
    }
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: !this.isMobile, // Economia crítica de GPU em dispositivos modestos
      alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    
    // PixelRatio inteligente: no mobile limita a 1.0 ou 1.25 para evitar sobrecarga térmica e de bateria
    const maxPixelRatio = this.isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.75);
    this.renderer.setPixelRatio(maxPixelRatio);

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Sombras somente em desktop para manter 60fps em dispositivos modestos
    if (!this.isMobile) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      this.renderer.shadowMap.enabled = false;
    }

    this.container.appendChild(this.renderer.domElement);
  }

  initLights() {
    this.ambientLight = new THREE.AmbientLight(0x0f111a, 1.6);
    this.scene.add(this.ambientLight);

    this.mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    this.mainLight.position.set(5, 8, 5);
    if (!this.isMobile) {
      this.mainLight.castShadow = true;
      this.mainLight.shadow.mapSize.width = 1024;
      this.mainLight.shadow.mapSize.height = 1024;
    }
    this.scene.add(this.mainLight);

    // RectAreaLights físicas de estúdio
    this.rectLightBronze = new THREE.RectAreaLight(0xc99757, 5.0, 7, 3.5);
    this.rectLightBronze.position.set(2.5, 3.5, 3);
    this.rectLightBronze.lookAt(0, 0, 0);
    this.scene.add(this.rectLightBronze);

    this.rectLightCyan = new THREE.RectAreaLight(0x00f0ff, 3.0, 5, 3);
    this.rectLightCyan.position.set(-3.5, -1.5, 2.5);
    this.rectLightCyan.lookAt(0, 0, 0);
    this.scene.add(this.rectLightCyan);

    // PointLights
    this.errorPointLight = new THREE.PointLight(0xff334b, 3.0, 15, 1.8);
    this.errorPointLight.position.set(0, 0, 2);
    this.scene.add(this.errorPointLight);

    this.agenticCoreLight = new THREE.PointLight(0x00f0ff, 0.0, 20, 2.0);
    this.agenticCoreLight.position.set(0, 0, 1.5);
    this.scene.add(this.agenticCoreLight);

    this.symposiumLight = new THREE.PointLight(0xffa834, 0.0, 25, 2.0);
    this.symposiumLight.position.set(0, 1.5, 3.0);
    this.scene.add(this.symposiumLight);
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.rgbShiftPass = new ShaderPass(RgbShiftShader);
    this.rgbShiftPass.renderToScreen = true;
    this.composer.addPass(this.rgbShiftPass);
  }

  setChromaticAberration(amount, angle = 0.0, distortion = 0.0) {
    if (this.rgbShiftPass && this.rgbShiftPass.uniforms) {
      this.rgbShiftPass.uniforms.uAmount.value = amount;
      this.rgbShiftPass.uniforms.uAngle.value = angle;
      this.rgbShiftPass.uniforms.uDistortion.value = distortion;
    }
  }

  bindEvents() {
    this.onResize = this.onResize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
    window.addEventListener('touchstart', this.onTouchMove, { passive: true });
  }

  onPointerMove(event) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onTouchMove(event) {
    if (event.touches && event.touches.length > 0) {
      const touch = event.touches[0];
      this.pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = this.checkMobile();

    this.camera.aspect = this.width / this.height;
    this.adjustCameraForViewport();
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    const maxPixelRatio = this.isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.75);
    this.renderer.setPixelRatio(maxPixelRatio);

    this.composer.setSize(this.width, this.height);
  }

  update(delta, elapsed) {
    if (this.rgbShiftPass && this.rgbShiftPass.uniforms) {
      this.rgbShiftPass.uniforms.uTime.value = elapsed;
    }
  }

  render() {
    this.composer.render();
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchstart', this.onTouchMove);

    this.scene.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
