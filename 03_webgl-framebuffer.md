# 03. WebGL でのネイティブ実装

## 3.1 基礎構成
Three.js の WebGLRenderTarget は WebGL の Framebuffer Object (FBO) と Texture / Renderbuffer をラップしたものです。ネイティブに書くと以下のような手順になります。

```js
const gl = canvas.getContext('webgl2');

// 1. フレームバッファを作成
const framebuffer = gl.createFramebuffer();

// 2. カラーテクスチャを作成して設定
const colorTex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, colorTex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

// 3. 深度バッファが必要なら Renderbuffer を追加
const depthBuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1024, 1024);

// 4. FBO にアタッチ
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTex, 0);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

// 5. 完了チェック
const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
if (status !== gl.FRAMEBUFFER_COMPLETE) {
  throw new Error('Framebuffer incomplete: ' + status.toString(16));
}
```

## 3.2 描画フロー
1. gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
2. gl.viewport(0, 0, width, height);
3. 必要なら gl.clearColor / gl.clear。
4. いつも通りジオメトリを描画。
5. gl.bindFramebuffer(gl.FRAMEBUFFER, null); でデフォルトフレームバッファへ戻る。

描画済みテクスチャは colorTex として一般的なサンプラーユニフォームにバインドし、別のパスで使用できます。

## 3.3 Three.js との対応表

| WebGL | Three.js | 備考 |
| --- | --- | --- |
| gl.createFramebuffer() | 
ew THREE.WebGLRenderTarget() 内部 | Three.js が FBO の生成/管理を隠蔽
| gl.bindFramebuffer() | 
enderer.setRenderTarget(target) | 解放時は 	arget.dispose() が deleteFramebuffer を呼ぶ
| gl.texImage2D + gl.texParameteri | 
enderTarget.texture の image, minFilter など | Three.js はリサイズ時に自動で再割り当て
| gl.framebufferTexture2D | 
enderTarget.texture を自動的に COLOR_ATTACHMENT0 へ | MRT を使う場合は WebGLMultipleRenderTargets
| gl.framebufferRenderbuffer | 
enderTarget.depthTexture / depthBuffer | 
enderTarget.depthTexture = new THREE.DepthTexture() でカスタム可能

## 3.4 デバッグと検証
- gl.getError() だけでなく WEBGL_debug_renderer_info 拡張を使うと GPU 固有の挙動を確認できる。
- FBO の不完全ステータスは 0x8CD6（添付ミス）、0x8CD7（添付サイズ不一致）など数種類に分かれるため、Three.js の抽象化層が隠した情報を調べたいときに役立つ。
- gl.readPixels でターゲット内容を CPU へ持ち帰れば、自前のテストコードで差分検証も可能。