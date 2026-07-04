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

**5、项目快捷创建**

- `projectName` 为想要创建的项目名，需要以驼峰形式
- `projectType` 为项目所属入口，即 pages 下的大目录，目前只有 `index`

```bash
pnpm option create [projectName] -t [projectType]
```

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
