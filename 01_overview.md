# 01. レンダーターゲットの基本と ScenePainter.js との関係

## 1.1 レンダーターゲットとは？
- GPU に描かれた結果をそのまま画面に出すのではなく、テクスチャとして保持するためのオフスクリーン描画先。
- レンダラーは color, depth, stencil など複数のバッファを持つフレームバッファを準備し、そこへシェーダーの出力をストアする。
- 得られたテクスチャは後続の描画パスでマテリアルやポストプロセスに流用できる。

## 1.2 ScenePainter.js での役割
ScenePainter.js では複数のレンダーターゲットが入れ子で使われています。

| 用途 | 代表的な変数 | 概要 |
| --- | --- | --- |
| ペイント結果の蓄積 | TextureTransformer.feedbackTexture.renderTarget | ブラシ描画の結果を次フレームへフィードバックする。
| UV 展開ビュー | 	ransformer.uvScene + UVMask | モデルの UV を 2D 平面に変換し、どのピクセルが塗られたかをマスクに反映する。
| ブラシプレビュー | previewPlane.material.map | レンダーターゲットのテクスチャをスクリーン上の平面に貼り付けて確認用に表示。

- enderer.setRenderTarget(...) で描画先を切り替え、enderOperation ラッパーでラウンドトリップしています。
- 実際のメッシュへは paintMesh.material.map = feedbackTexture.renderTarget.texture のように、最終テクスチャを割り当てて反映。

## 1.3 一般的な観点
1. **アロケーション戦略** – 大きなテクスチャほどメモリを圧迫するため、必要最小限のサイズとフォーマットを選ぶ。
2. **クリアと保持** – enderer.setRenderTarget(null) でデフォルトフレームバッファに戻る前に、必要なら enderer.clear() で色/深度をリセット。
3. **MRT (Multiple Render Targets)** – WebGL2 では複数カラーバッファを同時に出力可能だが、Three.js の WebGLMultipleRenderTargets を使うと抽象化される。
4. **同期** – テクスチャをサンプリングするマテリアルへ渡す前に 	exture.needsUpdate = true が必要なケースがある（HTMLCanvasTexture など）。

## 1.4 よくある落とし穴
- **UV が無いメッシュ** : ScenePainter.js では UnwrapUVs を呼び出して一時的に UV を生成。
- **sRGB と Linear の混在** : ペイント結果を SRGBColorSpace で扱うかどうかを決めておかないと色が変化する。
- **ピクセル座標系** : UV ベースの描画では [0,1] 範囲、キャンバスベースではピクセル単位になるため、ブラシサイズ換算に注意。