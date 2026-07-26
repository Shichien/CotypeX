# CoTypeX for macOS

CoTypeX 直接增强官方 Codex 输入端，不创建新的输入框或练习面板。

## 使用

1. 完全退出所有正在运行的 Codex 窗口。
2. 双击 `Start CoTypeX.command`，或者在终端运行 `./cotypex run`。
3. Codex 启动后，按 `Control+Option+T` 进入或退出练习。

练习中按 `Tab` 或 `Enter` 更换内容，按 `Esc` 退出并恢复原草稿。终端进程需要保持运行；按 `Control+C` 会移除注入行为。

启动器会验证官方应用包标识 `com.openai.codex`，并自动查找以下名称：

- `/Applications/Codex.app`
- `/Applications/OpenAI Codex.app`
- `/Applications/OpenAI.Codex.app`
- `/Applications/ChatGPT.app`
- 用户目录下 `Applications` 中的相同名称

也可以显式指定应用包：

```bash
./cotypex run --codex-path /Applications/ChatGPT.app
```

## Codex++

安装共用用户脚本：

```bash
./cotypex install-codex-plus-plus
```

默认位置是 `~/.config/Codex++/user_scripts/cotypex.js`。如果设置了 `XDG_CONFIG_HOME`，则使用该目录下的 `Codex++/user_scripts`。

## 系统安全提示

当前自动构建产物没有 Apple Developer ID 签名和公证。正式分发前应配置签名与公证；不要把移除系统安全属性作为默认安装步骤。
