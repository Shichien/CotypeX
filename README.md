# CoTypeX

CoTypeX 是一个直接在 Codex 桌面版官方输入端内运行的打字练习工具。它不会创建新的输入框、练习面板或工具栏，也不会改变官方输入区的尺寸。练习文字贴合在官方编辑器的文字位置，而焦点、键盘事件和中文输入法仍由官方编辑器处理。

它提供两种入口，但共用同一个注入脚本：

- 独立版：Windows 或 macOS 的 Rust 启动器打开本机 CDP 端口，并把 CoTypeX 注入 Codex。
- Codex++ 版：把 `dist/cotypex.user.js` 作为用户脚本加载。

CoTypeX 不修改 `WindowsApps`、macOS 应用包、`app.asar` 或 Codex 配置，不读取对话内容，也不访问网络。

## 使用 Windows 版

先关闭所有正在运行的 Codex 窗口，然后执行：

```powershell
.\cotypex.exe run
```

Codex 打开后按 `Ctrl+Alt+T` 进入或退出练习。练习中可以使用：

- `Tab` 或 `Enter`：更换练习内容。
- `Esc`：退出练习并恢复进入练习前尚未发送的内容。

启动器必须保持运行。关闭 Codex 后，CDP 端口会随 Codex 一起关闭。按 `Ctrl+C` 可以移除当前页面中的 CoTypeX，但不会代替用户关闭 Codex。

如果自动发现失败，可以指定官方程序路径：

```powershell
.\cotypex.exe run --codex-path 'C:\Program Files\WindowsApps\OpenAI.Codex_xxx\app\ChatGPT.exe'
```

连接一个已经由其他可信启动器开放的端口：

```powershell
.\cotypex.exe attach --port 9337
```

## 使用 macOS 版

发布包同时支持 Apple 芯片和 Intel。先完全退出 Codex，然后双击 `Start CoTypeX.command`，或者在终端运行：

```bash
./cotypex run
```

Codex 打开后按 `Control+Option+T` 进入或退出练习。macOS 启动器会验证官方应用包标识，并支持 `Codex.app`、`OpenAI Codex.app`、`OpenAI.Codex.app` 和 `ChatGPT.app`。也可以显式指定：

```bash
./cotypex run --codex-path /Applications/ChatGPT.app
```

macOS 详细说明见 `macos/README.md`。

## 安装到 Codex++

可以直接使用生成的 `dist/cotypex.user.js`，也可以运行：

```powershell
.\cotypex.exe install-codex-plus-plus
```

默认安装位置：

```text
Windows: %APPDATA%\Codex++\user_scripts\cotypex.js
macOS:   ~/.config/Codex++/user_scripts/cotypex.js
```

随后在 Codex++ 中启用用户脚本并重新加载，或者重启 Codex++。

## 从源码构建

```powershell
Set-Location web
npm install
npm test
npm run build
Set-Location ..
cargo test
cargo build --release
```

构建结果：

- Windows：`target/release/cotypex.exe`
- macOS：运行 `scripts/build-macos-release.sh`，生成 `release/CoTypeX-<版本>-macos-universal.zip`
- `dist/cotypex.user.js`

## 安全边界

CDP 没有面向同一用户其他本机进程的身份验证。CoTypeX 因此执行以下限制：

- 只连接回环地址和指定端口。
- 校验浏览器身份，端口被其他进程接管时停止运行。
- 只接受 Codex 或 ChatGPT 的页面目标，排除宠物覆盖页面。
- 不提供网络请求，不记录按键，也不保存练习内容。
- 不自动结束 Codex 进程；不用时应正常关闭 Codex，从而关闭调试端口。

## 项目结构

```text
src/                    Rust 启动器和 CDP 客户端
web/src/                练习引擎、页面注入与样式
web/tests/              打字逻辑测试
web/demo/               仅用于验证注入行为的本地页面夹具
dist/cotypex.user.js    两种入口共用的生成脚本
macos/                  macOS 启动入口与说明
scripts/                macOS 通用发布包构建脚本
```
