## 项目启动

推荐使用pnpm进行包管理

**1、安装pnpm**

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

**4、将依赖添加到不用依赖项类别**
① 不指定依赖类型默认安装到dependencies
② 指定依赖安装到devDependencies

```bash
pnpm add [package] --dev
```
