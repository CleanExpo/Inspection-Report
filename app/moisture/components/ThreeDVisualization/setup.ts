import * as THREE from 'three';

export interface SceneConfig {
  width: number;
  height: number;
  backgroundColor: number;
  fov: number;
  near: number;
  far: number;
}

export interface SceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

export class SceneManager {
  private config: SceneConfig;
  private container: HTMLDivElement;
  private sceneRefs: SceneRefs;

  constructor(container: HTMLDivElement, config: Partial<SceneConfig> = {}) {
    this.container = container;
    this.config = {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: 0xf0f0f0,
      fov: 75,
      near: 0.1,
      far: 1000,
      ...config
    };
    this.sceneRefs = this.initializeScene();
  }

  private initializeScene(): SceneRefs {
    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(this.config.backgroundColor);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      this.config.fov,
      this.config.width / this.config.height,
      this.config.near,
      this.config.far
    );
    camera.position.set(10, 10, 10);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(this.config.width, this.config.height);
    this.container.appendChild(renderer.domElement);

    return { scene, camera, renderer };
  }

  public setupLighting(): void {
    const { scene } = this.sceneRefs;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);
  }

  public handleResize(): void {
    const { camera, renderer } = this.sceneRefs;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  public dispose(): void {
    const { scene, renderer } = this.sceneRefs;

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    renderer.dispose();
    if (this.container.contains(renderer.domElement)) {
      this.container.removeChild(renderer.domElement);
    }
  }

  public getRefs(): SceneRefs {
    return this.sceneRefs;
  }
}
