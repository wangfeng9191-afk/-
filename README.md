# Bobby 星际先锋 - 本地运行指南 (VSCode)

本指南将帮助你在本地计算机上使用 VSCode 运行和自定义《Bobby 星际先锋》游戏。

## 1. 环境准备

在开始之前，请确保你的电脑已安装以下软件：
- **Node.js** (建议版本 v18 或更高): [下载地址](https://nodejs.org/)
- **Visual Studio Code (VSCode)**: [下载地址](https://code.visualstudio.com/)

## 2. 项目初始化

1. **下载代码**: 将本项目的所有文件下载到你的本地文件夹。
2. **打开项目**: 启动 VSCode，点击 `File -> Open Folder...`，选择项目所在的文件夹。
3. **安装依赖**:
   在 VSCode 中打开终端 (`Ctrl + ` ` 或 `Terminal -> New Terminal`)，输入以下命令并回车：
   ```bash
   npm install
   ```

## 3. 资源替换 (自定义图片)

你可以轻松替换游戏中的战机和敌机图片。

1. **创建资源文件夹**:
   在项目根目录下创建一个名为 `public` 的文件夹，并在其内部创建 `assets` 文件夹。
   结构如下：
   ```
   /项目根目录
     /public
       /assets
         player.png       (主角战机)
         enemy_basic.png  (基础敌机)
         enemy_fast.png   (快速敌机)
         enemy_heavy.png  (重型敌机)
   ```
2. **替换图片**:
   将你自己的 `.png` 图片放入 `public/assets` 文件夹中，并确保文件名与上述一致。
   - 建议尺寸：战机 40x40 像素，敌机 30x30 到 50x50 像素。
   - 必须是透明背景的 PNG 格式。

## 4. 运行游戏

在 VSCode 终端中输入以下命令：

```bash
npm run dev
```

终端会显示类似以下内容：
```
Server running on http://localhost:3000
```

按住 `Ctrl` 键并点击链接，或者在浏览器地址栏输入 `http://localhost:3000` 即可开始游戏。

## 5. 核心代码说明

- `src/components/GameCanvas.tsx`: 游戏的核心逻辑，包括碰撞检测、自动射击、音效生成和绘图逻辑。
- `src/constants.ts`: 游戏平衡性参数（如速度、血量、得分、图片路径等）。
- `src/App.tsx`: 游戏的 UI 界面、成就系统和状态管理。
- `server.ts`: 后端 Express 服务器配置。

## 7. 发布到 GitHub

1. **创建仓库**: 在 GitHub 上创建一个新的仓库（不要勾选 Initialize with README）。
2. **本地关联**:
   在项目根目录执行：
   ```bash
   git init
   ```
   (可选) 创建 `.gitignore` 确保不上传 `node_modules` 和 `dist`:
   ```text
   node_modules
   dist
   .env
   ```
3. **提交代码**:
   ```bash
   git add .
   git commit -m "Initial commit: Bobby Star Pioneer"
   ```
4. **推送到 GitHub**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

## 8. 部署到 Vercel

Vercel 是部署前端项目最简单的平台，它会自动识别 Vite 配置。

1. **登录 Vercel**: 访问 [vercel.com](https://vercel.com/) 并使用 GitHub 账号登录。
2. **导入项目**: 点击 "Add New" -> "Project"，找到你刚才上传的 GitHub 仓库并点击 "Import"。
3. **配置项目**:
   - **Framework Preset**: 保持默认 (Vite)。
   - **Build Command**: `npm run build` (默认)。
   - **Output Directory**: `dist` (默认)。
4. **环境变量 (可选)**:
   如果你的游戏使用了 Gemini API 或其他密钥，在 "Environment Variables" 中添加它们。
5. **部署**: 点击 "Deploy"。

部署完成后，你会获得一个 `https://your-project.vercel.app` 的公网链接，任何人都可以通过该链接玩你的游戏！

## 9. 进阶：在 Vercel 运行后端 API

如果你需要保留 `server.ts` 中的后端逻辑（如 `/api/health`），Vercel 要求将后端代码放在 `api/` 目录下作为 Serverless Functions。

1. 在根目录创建 `api/` 文件夹。
2. 创建 `api/index.ts` 并将 Express 逻辑迁移进去。
3. 详情请参考 [Vercel Express 指南](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js/using-express)。

对于本游戏，纯静态部署（`dist` 目录）已足够运行所有核心玩法。
