# 盘库网页系统使用和部署指南

## 项目概述

这是一个基于 Node.js、Express、SQLite 和前端 JavaScript 构建的库存盘点管理系统。支持 Excel 文件导入、扫码盘点、数据导出等功能，最终可打包成 Windows EXE 可执行文件。

## 系统功能

- **Excel 文件导入**：支持导入包含商品信息的 Excel 文件
- **扫码盘点**：通过扫码枪实时录入商品条码，更新盘点状态
- **数据导出**：支持导出多种格式的盘点记录
- **实时同步**：通过 WebSocket 实现实时数据同步
- **模板下载**：提供标准的库存盘点 Excel 模板
- **防止重复导入**：自动检测任务是否已有盘点数据，防止重复导入

## 环境要求

- Node.js (版本 18.x 或更高)
- npm 包管理器
- Windows 操作系统（用于打包 EXE 文件）

## 安装依赖

### 使用国内镜像源安装（推荐）

```bash
# 使用阿里云镜像源安装依赖
npm install --registry https://registry.npmmirror.com

# 或使用腾讯云镜像源
npm install --registry https://mirrors.cloud.tencent.com/npm/
```

### 如果不使用镜像源

```bash
npm install
```

## 项目结构

```
盘库网页/
├── server.js          # Express 服务器
├── script.js          # 前端 JavaScript 逻辑
├── index.html         # 主界面
├── styles.css         # 样式文件
├── package.json       # 项目配置和依赖
├── 查库存.xlsx        # Excel 模板文件
└── README.md          # 本说明文件
```

## 开发模式运行

### 启动开发服务器

```bash
npm run dev
# 或
node server.js
```

服务器将启动在 `http://localhost:3000`

## 生产部署

### 1. 打包成 EXE 文件

```bash
npm run build
# 或直接使用 pkg 命令
pkg . --targets node18-win-x64 --output 盘库.exe
```

### 2. 打包说明

- 使用 `pkg` 工具将 Node.js 应用打包成 Windows EXE 文件
- 所有依赖和静态资源（HTML、CSS、JS）都会被打包到 EXE 中
- 生成的 `盘库.exe` 文件可直接在 Windows 系统运行

## 使用方法

### 1. 准备 Excel 模板

- 点击界面上的"下载Excel模板"按钮获取标准模板
- 按照模板格式填写商品信息（商品名称、分类、条码等）

### 2. 导入数据

- 点击"导入Excel"按钮选择准备好的 Excel 文件
- 系统会自动解析文件并存储到数据库
- 系统会检测是否已有相同任务的盘点数据，防止重复导入

### 3. 开始盘点

- 在扫码框中扫描商品条码
- 扫描后商品状态会实时更新为"已盘"
- 扫描记录会保存到数据库

### 4. 数据导出

- 支持导出累计扫描记录
- 支持导出日志表（包含商品名和分类列）
- 支持导出未盘点商品表
- 所有导出文件均为 XLSX 格式

## 配置说明

### package.json 配置

```json
{
  "scripts": {
    "start": "node server.js",           # 启动生产服务器
    "dev": "nodemon server.js",          # 启动开发服务器
    "build": "pkg . --targets node18-win-x64 --output 盘库.exe"  # 打包 EXE
  },
  "pkg": {
    "assets": [
      "index.html",
      "script.js", 
      "styles.css"
    ]
  }
}
```

## 故障排除

### 常见问题

1. **无法启动服务器**
   - 检查 Node.js 版本是否符合要求
   - 检查端口 3000 是否被占用

2. **Excel 文件导入失败**
   - 检查 Excel 文件格式是否正确
   - 确保文件包含必要的列（商品名称、分类、条码等）

3. **扫码功能不工作**
   - 确认扫码枪连接正常
   - 检查扫码框是否获得焦点

### 依赖问题

如果遇到依赖安装问题，可以尝试：

```bash
# 清理 npm 缓存
npm cache clean --force

# 删除 node_modules 并重新安装
rm -rf node_modules package-lock.json
npm install --registry https://registry.npmmirror.com
```

## 技术栈

- **后端**: Node.js, Express.js
- **数据库**: SQLite
- **前端**: HTML, CSS, JavaScript
- **文件处理**: XLSX 库
- **实时通信**: WebSocket
- **打包工具**: pkg

## 安全说明

- 系统运行在本地，数据存储在本地 SQLite 数据库
- 不涉及网络传输敏感数据
- 建议定期备份数据库文件

## 更新日志

- v1.0: 初始版本，包含基础盘点功能
- v1.1: 添加防止重复导入功能
- v1.2: 添加多种导出功能
- v1.3: 添加模板下载功能
- v1.4: 优化性能，修复导出记录限制问题
