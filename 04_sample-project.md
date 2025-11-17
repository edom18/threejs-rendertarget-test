# 04. 最低限の動作確認サンプル
この章では、Three.js の WebGLRenderTarget を使って「オフスクリーンで描いた内容を平面に貼る」だけの最小サンプルを示します。ScenePainter.js のような複雑なブラシ処理は省き、仕組みを体験することに集中します。

## 4.1 ファイル構成
```
learning-rendertarget/sample/
├─ index.html
└─ main.js
```
同じリポジトリにある three.module.js をそのまま import して構いません。

## 4.2 index.html
```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>RenderTarget Sample</title>
    <style>body { margin: 0; background: #111; }</style>
  </head>
  <body>
    <canvas id="app"></canvas>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

## 4.3 main.js
```js
import * as THREE from '../three.module.js';

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
```

## 4.4 実行方法
1. リポジトリ直下で npx serve など簡易サーバーを立てる（ローカルファイル参照では ES Modules がブロックされるため）。
2. ブラウザで http://localhost:3000/learning-rendertarget/sample/ を開く。
3. 回転するオレンジの帯が中央に表示され、これは paintTarget.texture から貼り付けられた結果。BrushMaterial.color を動的に変えているので、テクスチャが毎フレーム更新されていることが確認できる。

## 4.5 応用アイデア
- BrushQuad の代わりに THREE.Sprite やパーティクルを並べるとブラシストローク風になる。
- paintTarget.texture を別のシェーダーマテリアルに渡し、ScenePainter.js と同じくメッシュへ直接アサインすれば 3D モデル塗装の最小構成が完成する。