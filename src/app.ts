// 学籍番号: 21FI041
// 氏名: 菊地 春希

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class SolarSystem {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  private planetData: {
    name: string,
    mesh: THREE.Mesh,
    orbit: THREE.Object3D,
    distance: number,
    speed: number,
    radius: number
  }[] = [];

  private moonOrbit: THREE.Object3D;
  private moonMesh: THREE.Mesh;
  private meteors: THREE.Mesh[] = [];
  private targetIndex: number = 2;
  private nameLabel: HTMLDivElement;

  constructor() {
    this.initRenderer();
    this.initCamera();
    this.initLight();
    this.setCubeBackground();
    this.createSun();
    this.createPlanets();
    this.createMoon();
    this.createSaturnRing();
    this.createStars();
    this.initControls();
    this.addKeyboardControls();
    this.createNameLabel();
    this.animate();
  }

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  private initCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(0, 50, 150);
    this.camera.lookAt(0, 0, 0);
  }

  private initControls() {
    new OrbitControls(this.camera, this.renderer.domElement);
  }

  private addKeyboardControls() {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        this.targetIndex = (this.targetIndex + 1) % this.planetData.length;
      } else if (event.key === 'ArrowLeft') {
        this.targetIndex = (this.targetIndex - 1 + this.planetData.length) % this.planetData.length;
      }
    });
  }

  private createNameLabel() {
    this.nameLabel = document.createElement('div');
    this.nameLabel.style.position = 'absolute';
    this.nameLabel.style.top = '10px';
    this.nameLabel.style.left = '10px';
    this.nameLabel.style.color = 'white';
    this.nameLabel.style.fontSize = '24px';
    this.nameLabel.style.fontFamily = 'sans-serif';
    document.body.appendChild(this.nameLabel);
  }

  private initLight() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);

    const whiteLight = new THREE.PointLight(0xffffff, 2, 1000);
    whiteLight.position.set(0, 0, 0);
    this.scene.add(whiteLight);
  }

  private setCubeBackground() {
    const loader = new THREE.CubeTextureLoader();
    const path = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/cube/space/';
    const format = '.jpg';
    const urls = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
    ];
    const cubeTexture = loader.load(urls);
    this.scene.background = cubeTexture;
  }

  private createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starVertices = [];
    for (let i = 0; i < starCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);
  }

  private createSun() {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xff0000 });
    const sun = new THREE.Mesh(geometry, material);
    this.scene.add(sun);
  }

  private createPlanets() {
    const colors = [
      0xa9a9a9, 0xffcc99, 0x88ccff, 0xff6633, 0xffcc66, 0xcccccc, 0x66ccff, 0x3366ff
    ];
    const names = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
    const distances = [10, 15, 20, 25, 35, 45, 55, 65];
    const radii = [0.6, 0.9, 1.1, 0.8, 2.2, 2, 1.6, 1.6];
    const speeds = [0.1, 0.08, 0.06, 0.045, 0.02, 0.015, 0.012, 0.01];

    const loader = new THREE.TextureLoader();

    for (let i = 0; i < names.length; i++) {
      const orbit = new THREE.Object3D();
      this.scene.add(orbit);

      const curve = new THREE.EllipseCurve(
        0, 0, distances[i], distances[i],
        0, 2 * Math.PI, false, 0
      );
      const points = curve.getPoints(100);
      const geometryCurve = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const materialCurve = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
      const orbitLine = new THREE.Line(geometryCurve, materialCurve);
      this.scene.add(orbitLine);

      const geometry = new THREE.SphereGeometry(radii[i], 32, 32);
      let material;
      if (names[i] === 'Earth') {
        const texture = loader.load('https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg');
        material = new THREE.MeshStandardMaterial({ map: texture });
      } else {
        material = new THREE.MeshStandardMaterial({
          color: colors[i],
          metalness: 0.4,
          roughness: 0.6
        });
      }
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = distances[i];
      orbit.add(mesh);
      this.planetData.push({ name: names[i], mesh, orbit, distance: distances[i], speed: speeds[i], radius: radii[i] });
    }
  }

  private createMoon() {
    const earth = this.planetData.find(p => p.name === 'Earth');
    if (!earth) return;
    this.moonOrbit = new THREE.Object3D();
    earth.mesh.add(this.moonOrbit);
    const moonGeo = new THREE.SphereGeometry(0.27, 32, 32);
    const moonTex = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/moon_1024.jpg');
    const moonMat = new THREE.MeshStandardMaterial({ map: moonTex });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.x = 2;
    this.moonOrbit.add(this.moonMesh);
  }

  private createSaturnRing() {
    const saturn = this.planetData.find(p => p.name === 'Saturn');
    if (!saturn) return;
    const ringGeo = new THREE.RingGeometry(2.2, 3.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xbbbbbb, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    saturn.mesh.add(ringMesh);
  }

  private createMeteor() {
    const geo = new THREE.SphereGeometry(0.1, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const meteor = new THREE.Mesh(geo, mat);
    meteor.position.set(
      THREE.MathUtils.randFloatSpread(200), 100, THREE.MathUtils.randFloatSpread(200)
    );
    this.scene.add(meteor);
    this.meteors.push(meteor);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    const elapsed = this.clock.getElapsedTime();

    for (const planet of this.planetData) {
      planet.orbit.rotation.y = elapsed * planet.speed;
      planet.mesh.rotation.y += 0.005;
    }

    if (this.moonOrbit) {
      this.moonOrbit.rotation.y = elapsed * 0.06;
      if (this.moonMesh) this.moonMesh.rotation.y += 0.005;
    }

    if (Math.random() < 0.01) this.createMeteor();

    for (let i = 0; i < this.meteors.length; i++) {
      const m = this.meteors[i];
      m.position.y -= 1;
      if (m.position.y < -50) {
        this.scene.remove(m);
        this.meteors.splice(i, 1);
        i--;
      }
    }

    const target = this.planetData[this.targetIndex]?.mesh;
    if (target) {
      const targetPos = new THREE.Vector3();
      target.getWorldPosition(targetPos);
      const camOffset = new THREE.Vector3(0, 3, 6);
      const camTarget = targetPos.clone().add(camOffset);
      this.camera.position.lerp(camTarget, 0.05);
      this.camera.lookAt(targetPos);
      this.nameLabel.innerText = `追従中: ${this.planetData[this.targetIndex].name}`;
    }

    this.renderer.render(this.scene, this.camera);
  };
}

window.onload = () => {
  new SolarSystem();
};
