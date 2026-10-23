# 技术栈检索配方（跨项目通用）

先判断栈，再按对应配方检索。判断方法：看仓库根目录的清单文件。

| 特征文件 | 栈 | 常见分层 |
|---|---|---|
| pom.xml / build.gradle | Java (Spring) | Controller → Service → Mapper/Dao → Entity |
| package.json + express/koa/nest | Node | router → controller → service → model/orm |
| pyproject.toml / requirements.txt | Python | views/router → service → repository → model |
| go.mod | Go | handler → service → repo → model |
| *.csproj / *.sln | .NET | Controller → Service → Repository → Entity |
| composer.json | PHP (Laravel) | routes → Controller → Service → Model |
| Gemfile | Ruby (Rails) | routes → Controller → Model |
| *.kt + gradle | Kotlin | Controller → Service → Repository |

## Java / Spring

```
glob **/*Controller.java          # 入口
glob **/*Service*.java           # 业务
glob **/*Mapper.xml              # SQL（表名在这里）
grep "@TableName" --include=*.java   # 实体 → 表
grep "@FeignClient" --include=*.java  # 跨服务调用
grep "@RequestMapping" --include=*.java  # 路由前缀
```

坑：`@TableName` 有实体不等于有 Dao；mapper xml 的 namespace 指向的接口可能不存在。

## Node / TypeScript

```
glob **/*.controller.ts  |  grep "router\.(get|post)"
glob **/*.service.ts
glob **/migrations/**  |  grep "CREATE TABLE"
grep "prisma\.|@Entity|sequelize\.define"   # ORM → 表
```

## Python

```
glob **/urls.py | **/routers/** | **/views.py
glob **/services/**  |  glob **/repositories/**
grep "__tablename__|class .*Base\)"       # SQLAlchemy → 表
glob **/migrations/**versions/**           # Alembic
```

## Go

```
glob **/handler/**  |  grep "func.*Handler"
glob **/service/**  |  glob **/repository/**
grep "TableName\(\)"                      # GORM → 表
glob **/*.sql  |  glob **/migrations/**
```

## 前端项目（无后端）

如果只有前端：第 3~8 列改成 页面组件 → 状态/Store → API 封装 → 请求方法 → 本地存储/缓存 → 数据结构。
连线语义不变（谁调谁、数据怎么流）。

## 单体项目（无网关）

省略「网关」列，把「接入层」写成 Nginx / 反向代理 / 直接入口；或者把前两列合并成「入口」。

## 找不到代码时

不要编。标 `status: gap`，在 `gaps[]` 写否定证据：查了哪些 glob/grep、返回什么、为什么判定缺失。
