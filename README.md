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
**_1、不指定依赖类型默认安装到dependencies_**
**_2、指定依赖安装到devDependencies -D_**

```bash
pnpm add [package] -D
```

**5、项目快捷创建**
**_1、projectName为想要创建的项目名,需要以驼峰的形式,eg：_**
**_2、projectType为项目所属入口,即pages下的大目录,目前只有index_**
**_3、eg: pnpm option create test -t index_**

```bash
pnpm option create [projectName] -t [projectType]
```
