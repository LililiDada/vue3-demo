## 项目启动

推荐使用 pnpm 进行包管理

**1、安装 pnpm**

```bash
npm i -g pnpm
```

**2、安装依赖**

```bash
pnpm install
```

**3、本地启动**

```bash
pnpm dev
```

本地启动后访问示例：

| 浏览器地址                                | 对应页面 |
| ----------------------------------------- | -------- |
| `http://localhost:5173/#/`                | 首页     |
| `http://localhost:5173/fundmarket.html#/` | 基金页面 |

> 项目是多页面应用（MPA），`src/pages/` 下每个目录是一个独立入口。
>
> 通过 `shortUrlPlugin` 实现短路径访问，无需写完整模板路径。
>
> 新增入口后重启 dev server 即可自动识别。

**4、将依赖添加到不用依赖项类别**

不指定依赖类型默认安装到 `dependencies`，指定 `-D` 安装到 `devDependencies`：

```bash
pnpm add [package] -D
```

## 脚手架命令

项目提供两个脚手架命令，通过 `pnpm option` 调用。

### 创建视图：`create`

在已有入口下创建视图组件和路由配置。

```bash
pnpm option create <视图名> -t <入口名>
```

示例：

```bash
# 在 index 入口下创建 test 视图
pnpm option create test -t index
# 生成 src/pages/index/views/test/index.vue
# 生成 src/pages/index/router/test.ts（自动注册到 router/index.ts）

# 在 fundmarket 入口下创建 mySetting 视图
pnpm option create mySetting -t fundmarket
```

参数说明：

| 参数          | 说明                 | 示例                  |
| ------------- | -------------------- | --------------------- |
| `<视图名>`    | 视图组件名，驼峰形式 | `test`、`mySetting`   |
| `-t <入口名>` | 所属页面入口目录名   | `index`、`fundmarket` |

### 创建入口：`add entry`

创建全新的页面入口，自动生成入口必需的文件和目录。

```bash
pnpm option add entry <入口名>
```

示例：

```bash
pnpm option add entry mypage
# 生成：
# src/pages/mypage/index.html        # HTML 壳
# src/pages/mypage/main.ts           # 入口文件
# src/pages/mypage/App.vue           # 根组件（含 router-view）
# src/pages/mypage/router/index.ts   # 路由配置（空壳）
# src/pages/mypage/views/            # 视图组件目录
# src/pages/mypage/components/       # 公共组件目录
```

参数说明：

| 参数 | 说明 | 示例 |
|------|------|------|
| `<入口名>` | 页面入口名，小写英文 | `fundmarket`、`mypage` |

> 新入口创建后重启 dev server 即可通过 `http://localhost:5173/<入口名>.html#/` 访问。

> `config/viteConfig.ts` 的 `readPages()` 会自动扫描识别，无需手动配置。

### 创建组件：`add view`

在已有入口下创建视图组件，路由配置直接写入 `router/index.ts`（不建独立路由文件）。

```bash
pnpm option add view <视图名> -t <入口名>
```

示例：

```bash
# 在 index 入口下创建 testView 视图，路由直接注册
pnpm option add view testView -t index
# 生成 src/pages/index/views/testView/index.vue
# 路由对象直接写入 src/pages/index/router/index.ts（无独立文件）

# 在 fundmarket 入口下创建 mySetting 视图
pnpm option add view mySetting -t fundmarket
```

参数说明：

| 参数          | 说明                 | 示例                  |
| ------------- | -------------------- | --------------------- |
| `<视图名>`    | 视图组件名，驼峰形式 | `testView`、`mySetting` |
| `-t <入口名>` | 所属页面入口目录名   | `index`、`fundmarket` |

> `add view` 与 `create` 的区别：`create` 创建独立的 `router/<name>.ts` 路由文件并自动注册，`add view` 不建路由文件，直接将路由定义写入 `router/index.ts`。

### 构建部署

```bash
pnpm build
```

输出在 `dist/` 目录，每个入口独立一个 HTML 文件：

```
dist/
  index.html
  fundmarket.html
```

部署时 Nginx 或 CDN 直接分发这些文件，无需特殊路由配置。
