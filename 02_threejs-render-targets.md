# 02. Three.js でのレンダーターゲット活用

## 2.1 API の概要
- const target = new THREE.WebGLRenderTarget(width, height, options);
- 主なオプション: minFilter, magFilter, Format, 	ype, depthBuffer, stencilBuffer。
- Renderer.setRenderTarget(target) で描画先を切り替え、Renderer.render(scene, camera) を呼ぶと target.texture に結果が格納される。

```js
// 基本的な 2 パス構成
const renderTarget = new THREE.WebGLRenderTarget(1024, 1024, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  colorSpace: THREE.SRGBColorSpace,
});

renderer.setRenderTarget(renderTarget);
renderer.render(offscreenScene, offscreenCamera);

renderer.setRenderTarget(null); // デフォルトに戻す
screenMaterial.map = renderTarget.texture;
renderer.render(mainScene, camera);
```

## 2.2 ScenePainter.js から見る実例
1. **TextureTransformer** – FeedbackTexture が内部に makeTarget() を持ち、ping-pong（A と B を入れ替えながら連続描画）でブラシ結果を蓄積。
2. **UVMask** – renderer.setRenderTarget(uvMaskTarget) で専用マスクを生成し、そのテクスチャを実ブラシ計算のシェーダーに渡す。
3. **プレビュー** – previewPlane.material.map にリアルタイムで renderTarget.texture をアサインしているため、画面左下で最終結果を即確認可能。

## 2.3 運用時の Tips
- **再利用と破棄** : サイズ変更が必要になった場合は renderTarget.dispose() を呼んで GPU リソースを開放。
- **自動クリア** : renderer.autoClear = false にして手動で renderer.clear() を呼ぶと、複数パスを重ねたいケースに便利。
- **深度バッファ** : ブラシのような 2D ペイントでは depthBuffer: false で良い。ScenePainter.js でも FeedbackTexture 系は色バッファのみ。
- **複数レンダーターゲット** : WebGL2 + Three.js r150 以降なら THREE.WebGLMultipleRenderTargets を利用して G-Buffer 的な構成を組める。

## 2.4 デバッグ方法
- renderer.getContext() で生の WebGL コンテキストを取得し、checkFramebufferStatus などで直接状態確認可能。
- レンダーターゲットのテクスチャを単色メッシュに貼り、画面に全画面表示するだけでもバグ特定がしやすくなる。
- WebGLRenderTarget.debug は存在しないので、ScenePainter.js と同じように previewPlane を用意するのが実務的。