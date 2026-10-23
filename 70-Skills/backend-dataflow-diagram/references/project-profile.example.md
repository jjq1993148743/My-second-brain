# SLHY 支付中台 · 画图前必读（仓库特定知识）

> 适用：`F:``FundCenter``fund-center`（Spring Cloud Alibaba，Java 17，MyBatis Plus + ShardingJDBC）。
> 这些是画数据链路图时反复用到的"地形"，先读这里能省一半检索。

## 1. 进程地图（微服务层用这个切）

| 服务 | 职责 | 画图时的典型角色 |
|---|---|---|
| gateway-service | 统一入口、鉴权前置 | 大多数图可以不画它，从 portal 起笔 |
| portal-service | 对外 HTTP 接口层（53 个 Controller） | 链路的**起点**；它几乎不落库，只做校验+转发 |
| routing-service | 交易路由 + 渠道业务（11 个子模块） | 链路的**主干**；绑卡/签约/支付/退款都在这里 |
| db-service | 数据访问层（订单、商户、通知…） | 链路的**落点**；别的服务不许直连它的库 |
| system-service | 系统管理 + 大量查询报表（mybatis xml 在此） | 报表/查询类链路的落点 |
| auth-service | JWT / SSO | 一般作为旁注 |
| notify-service / job-service / file-service / gen-service / workflow-service | 通知 / XXL-Job / OSS / 代码生成 / 流程 | 异步支线 |
| api-modules | Feign 接口 + Entity/VO 定义（不是服务！） | 画"文件"层时注意：`IXxxService.java` 是接口，实现在别的 service |
| starter-modules | 框架件（biz 框架、security、redis、sharding…） | 分发机制在 starter-biz |

## 2. 路由分发机制（几乎所有交易链路的骨架）

```
portal XxxController.invoke() → IRouteService.invoke(json)   [Feign → routing-service]
  → SmartRouterController.invoke()          # /smartRoute/invoke，DeferredResult 异步
  → SmartRouterService.route()              # 按 msgType + payMethodCode 选渠道 channelFlag
  → ServiceRegistry.getService(msgType)     # msgType → BusinessService 注册表
  → BusinessService: 过滤器链(CompositeFilter) + 业务处理器(XxxServiceHandler.handle)
  → handler 内再 Feign 调 db-service 落库 / HTTP 出网调渠道
```

- msgType 枚举集中在 `SmartRouterConstant.MsgType`（placeOrder / orderPay / binding / umsSign / userInfo…）
- 渠道子模块：routing-umspay（银商）、routing-unionpay（银联/绑卡）、routing-signpay（签约支付）、routing-chinapay、routing-alipay、routing-wxpay、routing-acct、routing-pfpay、routing-umsbank、routing-common、routing-portal
- 所以画交易类链路，"方法"层通常是：`invoke → route → getService → handle → saveXxx`

## 3. 分层与命名（文件层按这个找）

- 包结构：`api → client → biz → service → orm`；类后缀 `Controller / BizImpl / ServiceImpl / Vo / Dto / Entity`
- HTTP：**全部 POST**，路径 `/服务/鉴权位/业务/动作`，动词 get/add/edit/del/audit/cancel
- Feign 接口在 api-modules：`@FeignClient(name = Constant.XXX_SERVICE, url = "``feign.url.xxx:``")` —— url 空则走 nacos

## 4. 数据库口径（表层按这个判真伪）

- 业务表 `tbl_` 前缀（tbl_order、tbl_binding_card_info），系统表 `sys_`，少数例外（MEMBER_BANK_INFO）
- 实体 `@TableName("tbl_x")` 在 api-db；**有实体 ≠ 有表访问**：必须再查 ① 有没有 Dao/Mapper 引用 ② xml 里有没有该表的 insert/update
- 典型假实现陷阱：`BindingCardMapper.xml` 的 namespace 指向 `...db.card.repository.BindingCardDao`，但该接口文件不存在、xml 只有 select —— 写路径是缺的（2026-10 现状）
- 分库分表：starter-shardingjdbc 的 algorithm 包；订单表按时间/商户路由，图上不必展开，标注一句即可

## 5. 前端原型（mgr-ui）怎么识别

- `ui-modules/mgr-ui/src/api/<域>/*.js` 顶部 `const USE_LOCAL_DATA = true` ⇒ 该域**后端未接**，数据走 `api/_local/db.js`（前端版数据库，落盘 `F:``FundCenter``demo-data``<域>.json`，Vite 插件提供 `/__demo-data/<域>`）
- 同文件里 `request({ url: '/xxx/yyy' })` 的分支 = 预留的后端接口契约（画 gap 节点时把它写进 arrowNote，等于替后端把接口定义好了）
- 已知的"纯前端域"：memberManage、member/center、wallet、points、coupon、redpacket（截至 2026-10）
- 真实前后端已通的域：交易/支付/退款（portal OrderController/PayController/RefundController）、绑卡签约（BindCardController + routing-unionpay/signpay）

## 6. 会员域速查（已画过，改图前先对这份底）

- 真实链路只有一条主干：**工行会员档案** `/icbc/member/{apply,query,confirm}`（IcbcMemberController → invoke → IRouteService），渠道侧落库不在本仓库
- **绑卡签约**是会员资金侧真实主干：`BindCardController.bindCardForPersonal:41 → SmartRouter → BindingCardServiceHandler.handle:48 / UmsSignServiceHandler.umsSign:52 → ICardService.saveBindingCardInfo:22 → tbl_binding_card_info`
- 会员档案/注册审核/认证/注销/钱包/积分/等级/徽章 = 全部原型（USE_LOCAL_DATA=true），后端 `/memberManage/**`、`/member/**` 无任何 Controller
- 状态码两套并存：mgr-ui `accountStatus 1/2/3` vs catering `MEMBER_STATUS_N/D`；认证 `realNameStatus/corpStatus 0~3`
- 范例规格：`examples/member.json`（6 链路 84 节点），产物 `F:``FundCenter``链路图``会员-数据链路.html`

## 7. 检索配方（复制即用）

```
# 中文业务词 → 定位域
grep "会员" --include=*.java
# 反查前端契约与 mock 状态
grep "USE_LOCAL_DATA" fund-center/ui-modules/mgr-ui/src/api
grep "request({ url: '/member" fund-center/ui-modules/mgr-ui/src/api
# 表真伪三连
glob **/*<Table>*.java ; grep "@TableName(\"tbl_x\")" ; grep "tbl_x" --include=*.xml
# msgType 找 handler
grep "MsgType.XXX" fund-center/routing-service ; grep "class .*ServiceHandler" <渠道模块>
```
