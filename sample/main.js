import * as THREE from '../../three.module.js';

const canvas = document.querySelector('#app');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// 1) オフスクリーン用シーン（ブラシ代わりに回転する正方形）
const offscreenScene = new THREE.Scene();
const offscreenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
offscreenCamera.position.z = 2;
const brushMaterial = new THREE.MeshBasicMaterial({ color: 0xff6633 });
const brushQuad = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.4), brushMaterial);
offscreenScene.add(brushQuad);

// 2) レンダーターゲット（1024x1024, 深度なし）
const paintTarget = new THREE.WebGLRenderTarget(1024, 1024, {
  depthBuffer: false,
  colorSpace: THREE.SRGBColorSpace,
});

// 3) メインシーン（ターゲットを貼る平面）
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10);
camera.position.z = 2;
const previewMaterial = new THREE.MeshBasicMaterial({ map: paintTarget.texture });
const previewPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), previewMaterial);
scene.add(previewPlane);

function render(time) {
  const t = time * 0.001;
  brushQuad.rotation.z = t;
  brushMaterial.color.setHSL((t * 0.1) % 1, 0.8, 0.6);

  // (A) レンダーターゲットへ描画
  renderer.setRenderTarget(paintTarget);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(offscreenScene, offscreenCamera);

  // (B) デフォルトフレームバッファへ戻して表示
  renderer.setRenderTarget(null);
  renderer.setClearColor(0x222222, 1);
  renderer.clear();
  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);