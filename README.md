# 竖镜

从小说一步步拆成横屏电影感写实剧的拍摄准备包：快评、分集、剧本、资产、分镜、提示词。可在本页生成静帧 / 视频，或把每条提示词打开到 [Grok Imagine 代理](https://grok.com/imagine/agent)。

## 给 Grok Bot

这是完整前端工程。栈：TanStack Start + React 19 + Tailwind v4 + Zustand。默认 16:9、电影感写实。

核心目录：

- `src/lib/` — 管线、提示词拼装、资产库、Imagine 链接、生成接口
- `src/components/` — 工作台、资产卡、视觉方向
- `src/routes/` — 页面入口

本地：`npm install` 后 `npm run dev`（端口 8080）。构建：`npm run build`。

不要把密钥写进仓库。出图走服务端 `XAI_API_KEY`（有才启用「生成」）。
