# RenderTarget サンプル

> [!NOTE]
> 本リポジトリは、Three.js の RenderTarget の理解のために AI に作成してもらったサンプルコードです。

このフォルダは ScenePainter.js を理解するためのレンダーターゲット学習ノートです。章ごとに Three.js とネイティブ WebGL の観点を切り分けてあり、必要に応じてサンプルコードも掲載しています。

## 章構成
1. 01_overview.md – レンダーターゲットの概念と ScenePainter.js における役割
2. 02_threejs-render-targets.md – Three.js での API、管理フロー、注意点
3. 03_webgl-framebuffer.md – WebGL でのネイティブ実装と Three.js との対応表
4. 04_sample-project.md – 実行手順付きの最小サンプル

## 読み方
章は相互参照できるようにまとめていますが、まず 01 と 02 を読めば ScenePainter.js のコード（特に TextureTransformer と FeedbackTexture 周り）の理解が進みます。ネイティブ実装を自分で手を動かしたい場合は 03 と 04 を順に参照してください。