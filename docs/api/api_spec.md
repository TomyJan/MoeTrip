---
title: MoeTrip
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# MoeTrip

Base URLs:

* <a href="http://127.0.0.1:5200/api/v1">开发: http://127.0.0.1:5200/api/v1</a>

* <a href="http://trip.amoe.cc/api/v1">线上: http://trip.amoe.cc/api/v1</a>

# Authentication

# 景区管理

## POST 查询景点列表

POST /attraction/query

获取景点列表，支持分页和搜索

> Body 请求参数

```json
{
  "page": 1,
  "pageSize": 10,
  "keyword": ""
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» page|body|number¦null| 否 | 页码|none|
|» pageSize|body|number¦null| 否 | 每页数量|none|
|» keyword|body|string¦null| 否 | 搜索关键字|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "total": 3,
    "attractions": [
      {
        "id": 1,
        "name": "樱花谷",
        "description": "春季赏樱胜地",
        "open_time": "09:00-18:00",
        "image_url": "/images/sakura.jpg"
      }
    ]
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|number|true|none|状态码|0 表示成功，1001 表示参数无效（如 page < 1），非 0 表示其他错误|
|» message|string|true|none|信息|成功为空, 错误为错误信息|
|» data|object|true|none|数据|none|
|»» total|number|true|none|结果数量|none|
|»» attractions|[object]|true|none|景点信息|none|
|»»» id|number|true|none|景点ID|ID 编号|
|»»» name|string|true|none|景点名称|名称|
|»»» description|string|true|none|景点描述|none|
|»»» open_time|string|true|none|开放时间|none|
|»»» image_url|string|true|none|图片链接|none|

## POST 添加景点

POST /attraction/add

管理员添加新景点

> Body 请求参数

```json
{
  "name": "新景点",
  "description": "景点描述",
  "open_time": "09:00-18:00",
  "image_url": "/images/new.jpg"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» name|body|string| 是 | 景点名称|名称|
|» description|body|string| 是 | 景点描述|none|
|» open_time|body|string| 是 | 开放时间|none|
|» image_url|body|string| 是 | 图片链接|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "attraction": {
      "id": 1,
      "name": "樱花谷",
      "description": "春季赏樱胜地",
      "open_time": "open_time",
      "image_url": "/images/sakura.jpg"
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|number|true|none|状态码|0 表示成功，1002 表示名称重复，2001表示无管理员权限，其他非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object|true|none|景点信息|none|
|»» attraction|object|true|none|景点信息|none|
|»»» id|number|true|none|景点ID|ID 编号|
|»»» name|string|true|none|景点名称|名称|
|»»» description|string|true|none|景点描述|none|
|»»» open_time|string|true|none|开放时间|none|
|»»» image_url|string|true|none|图片链接|none|

## POST 查询设施列表

POST /facility/query

获取设施状态列表

> Body 请求参数

```json
{
  "attraction_id": 1,
  "status": "正常"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» attraction_id|body|number¦null| 否 | 所在景点ID|ID 编号|
|» status|body|string¦null| 否 | 设施状态|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "total": 0,
    "facilities": [
      {
        "id": 1,
        "name": "休息亭",
        "attraction_id": 1,
        "location": "樱花谷入口",
        "status": "正常"
      }
    ]
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|number|true|none|状态码|0 表示成功，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object|true|none|数据|none|
|»» total|number|true|none|设施数量|none|
|»» facilities|[object]|true|none||none|
|»»» id|number|true|none|设施ID|ID 编号|
|»»» name|string|true|none|设施名称|名称|
|»»» attraction_id|number|true|none|所在景点ID|none|
|»»» location|string|true|none|设施位置|none|
|»»» status|string|true|none|设施状态|none|

## POST 添加设施

POST /facility/add

管理员添加新设施

> Body 请求参数

```json
{
  "name": "休息亭",
  "location": "樱花谷入口",
  "status": "正常"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» attraction_id|body|number| 是 | 所在景点ID|ID 编号|
|» name|body|string| 是 | 设施名称|名称|
|» location|body|string| 是 | 设施位置|none|
|» status|body|string| 是 | 设施状态|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "facility": {
      "id": 1,
      "name": "休息亭",
      "attraction_id": 1,
      "location": "樱花谷入口",
      "status": "正常"
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|number|true|none|状态码|0 表示成功，1002 表示名称重复，2001表示无管理员权限，其他非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object|true|none|数据|none|
|»» facility|object|true|none|设施信息|none|
|»»» id|number|true|none|设施ID|ID 编号|
|»»» name|string|true|none|设施名称|名称|
|»»» attraction_id|number|true|none|所在景点ID|none|
|»»» location|string|true|none|设施位置|none|
|»»» status|string|true|none|设施状态|none|

# 用户管理

## POST 用户注册

POST /user/register

新用户注册，注册成功返回 JWT 自动完成登录

> Body 请求参数

```json
{
  "username": "",
  "password": "cd6dcca66cf64a1d9b0f842f9c3bbb18c146a629"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» username|body|string| 是 | 用户名|none|
|» password|body|string| 是 | SHA1的密码|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "user": {
      "id": 1,
      "username": "TomyJan",
      "password": "cd6dcca66cf64a1d9b0f842f9c3bbb18c146a629",
      "role": "user"
    },
    "token": "non"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|number|true|none|状态码|0 表示成功，1003 表示用户名已存在，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object|true|none|数据|none|
|»» user|object|true|none|用户信息|none|
|»»» id|number|true|none|用户ID|ID 编号|
|»»» username|string|true|none|用户名|none|
|»»» password|string|true|none|SHA1的密码|none|
|»»» role|string|true|none|用户组|none|
|»» token|string|true|none|JWT|none|

## POST 用户登录

POST /user/login

用户登录，返回 JWT

> Body 请求参数

```json
{
  "username": "",
  "password": "cd6dcca66cf64a1d9b0f842f9c3bbb18c146a629"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» username|body|string| 是 | 用户名|none|
|» password|body|string| 是 | SHA1的密码|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "user": {
      "id": 1,
      "username": "TomyJan",
      "password": "cd6dcca66cf64a1d9b0f842f9c3bbb18c146a629",
      "role": "user"
    },
    "token": "cillum"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|number|true|none|状态码|0 表示成功，1004 表示用户名或密码错误，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object|true|none|数据|none|
|»» user|object|true|none|用户信息|none|
|»»» id|number|true|none|用户ID|ID 编号|
|»»» username|string|true|none|用户名|none|
|»»» password|string|true|none|SHA1的密码|none|
|»»» role|string|true|none|用户组|none|
|»» token|string|true|none|JWT|none|

# 票务预约

## POST 查询已购门票列表

POST /user/record

管理员或用户获取用户浏览、预定等记录

> Body 请求参数

```json
{
  "user_id": 1
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» user_id|body|number| 否 | 目标用户ID|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "total": 1,
    "records": [
      {
        "id": 1,
        "order_id": 1,
        "ticket_id": 1,
        "quantity": 1,
        "date": "2025-07-15",
        "user_id": 1,
        "created_at": "2025-07-15T10:00:00Z"
      }
    ]
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|number|true|none|状态码|0 表示成功，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object|true|none|数据|none|
|»» total|number|true|none|记录总数|none|
|»» records|[object]|true|none|记录信息|none|
|»»» id|number|true|none|记录ID|ID 编号|
|»»» order_id|number|true|none|订单ID|none|
|»»» ticket_id|number|true|none|票种ID|none|
|»»» quantity|number|true|none|门票数量|none|
|»»» date|string(date)|true|none|门票日期|none|
|»»» user_id|number|true|none|用户ID|none|
|»»» created_at|string(date-time)|true|none|创建时间|none|

## POST 购买门票

POST /ticket/purchase

用户购买门票，生成订单

> Body 请求参数

```json
{
  "ticket_id": 1,
  "quantity": 1,
  "date": "2025-07-15"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» ticket_id|body|number| 是 | 票种ID|none|
|» quantity|body|number| 是 | 门票数量|none|
|» date|body|string(date)| 是 | 门票日期|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "ticket": {
      "id": 1,
      "order_id": 1,
      "ticket_id": 1,
      "quantity": 1,
      "date": "2025-07-15",
      "user_id": 1,
      "created_at": "2025-07-15T10:00:00Z"
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|number|true|none|状态码|0 表示成功，1005 表示票种余量不足，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object|true|none|数据|none|
|»» ticket|object|true|none|门票信息|none|
|»»» id|number|true|none|记录ID|ID 编号|
|»»» order_id|number|true|none|订单ID|none|
|»»» ticket_id|number|true|none|票种ID|none|
|»»» quantity|number|true|none|门票数量|none|
|»»» date|string(date)|true|none|门票日期|none|
|»»» user_id|number|true|none|用户ID|none|
|»»» created_at|string(date-time)|true|none|创建时间|none|

## POST 检查票种余量

POST /ticket/check

检查指定日期的门票余量

> Body 请求参数

```json
{
  "ticket_id": 1,
  "date": "2025-07-15"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» ticket_id|body|number| 是 | 票种ID|none|
|» date|body|string(date)| 是 | 门票日期|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "ticket": {
      "id": 1,
      "attraction_id": 1,
      "name": "单人票",
      "available": 100,
      "date": "2025-07-15"
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|number|true|none|状态码|0 表示成功，1005 表示票种余量不足，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object|true|none|数据|none|
|»» ticket|object|true|none|门票信息|none|
|»»» id|number|true|none|票种ID|ID 编号|
|»»» attraction_id|number|true|none|所在景点ID|none|
|»»» name|string|true|none|票种名称|名称|
|»»» available|number|true|none|当日票种余量|none|
|»»» date|string(date)|true|none|票种日期|none|

## POST 添加票种

POST /ticket/add

用户购买门票，生成订单

> Body 请求参数

```json
{
  "attraction_id": 1,
  "name": "单人票",
  "available": 100
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» attraction_id|body|number| 是 | 所在景点ID|none|
|» name|body|string| 是 | 票种名称|名称|
|» available|body|number| 是 | 当日票种余量|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "ticket": {
      "id": 1,
      "attraction_id": 1,
      "name": "单人票",
      "available": 100
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|number|true|none|状态码|0 表示成功，1005 表示票种余量不足，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object|true|none|数据|none|
|»» ticket|object|true|none|门票信息|none|
|»»» id|number|true|none|票种ID|ID 编号|
|»»» attraction_id|number|true|none|所在景点ID|none|
|»»» name|string|true|none|票种名称|名称|
|»»» available|number|true|none|每日票种余量|none|

# 数据模型

<h2 id="tocS_单个景点信息">单个景点信息</h2>

<a id="schema单个景点信息"></a>
<a id="schema_单个景点信息"></a>
<a id="tocS单个景点信息"></a>
<a id="tocs单个景点信息"></a>

```json
{
  "id": 1,
  "name": "樱花谷",
  "description": "春季赏樱胜地",
  "open_time": "open_time",
  "image_url": "/images/sakura.jpg"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|number|true|none|景点ID|ID 编号|
|name|string|true|none|景点名称|名称|
|description|string|true|none|景点描述|none|
|open_time|string|true|none|开放时间|none|
|image_url|string|true|none|图片链接|none|

<h2 id="tocS_单个设施信息">单个设施信息</h2>

<a id="schema单个设施信息"></a>
<a id="schema_单个设施信息"></a>
<a id="tocS单个设施信息"></a>
<a id="tocs单个设施信息"></a>

```json
{
  "id": 1,
  "name": "休息亭",
  "attraction_id": 1,
  "location": "樱花谷入口",
  "status": "正常"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|number|true|none|设施ID|ID 编号|
|name|string|true|none|设施名称|名称|
|attraction_id|number|true|none|所在景点ID|none|
|location|string|true|none|设施位置|none|
|status|string|true|none|设施状态|none|

<h2 id="tocS_单个用户信息">单个用户信息</h2>

<a id="schema单个用户信息"></a>
<a id="schema_单个用户信息"></a>
<a id="tocS单个用户信息"></a>
<a id="tocs单个用户信息"></a>

```json
{
  "id": 1,
  "username": "TomyJan",
  "password": "cd6dcca66cf64a1d9b0f842f9c3bbb18c146a629",
  "role": "user"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|number|true|none|用户ID|ID 编号|
|username|string|true|none|用户名|none|
|password|string|true|none|SHA1的密码|none|
|role|string|true|none|用户组|none|

<h2 id="tocS_单条门票记录">单条门票记录</h2>

<a id="schema单条门票记录"></a>
<a id="schema_单条门票记录"></a>
<a id="tocS单条门票记录"></a>
<a id="tocs单条门票记录"></a>

```json
{
  "id": 1,
  "order_id": 1,
  "ticket_id": 1,
  "quantity": 1,
  "date": "2025-07-15",
  "user_id": 1,
  "created_at": "2025-07-15T10:00:00Z"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|number|true|none|记录ID|ID 编号|
|order_id|number|true|none|订单ID|none|
|ticket_id|number|true|none|票种ID|none|
|quantity|number|true|none|门票数量|none|
|date|string(date)|true|none|门票日期|none|
|user_id|number|true|none|用户ID|none|
|created_at|string(date-time)|true|none|创建时间|none|

<h2 id="tocS_单日单条票种信息">单日单条票种信息</h2>

<a id="schema单日单条票种信息"></a>
<a id="schema_单日单条票种信息"></a>
<a id="tocS单日单条票种信息"></a>
<a id="tocs单日单条票种信息"></a>

```json
{
  "id": 1,
  "attraction_id": 1,
  "name": "单人票",
  "available": 100,
  "date": "2025-07-15"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|number|true|none|票种ID|ID 编号|
|attraction_id|number|true|none|所在景点ID|none|
|name|string|true|none|票种名称|名称|
|available|number|true|none|当日票种余量|none|
|date|string(date)|true|none|票种日期|none|

<h2 id="tocS_单条票种信息">单条票种信息</h2>

<a id="schema单条票种信息"></a>
<a id="schema_单条票种信息"></a>
<a id="tocS单条票种信息"></a>
<a id="tocs单条票种信息"></a>

```json
{
  "id": 1,
  "attraction_id": 1,
  "name": "单人票",
  "available": 100
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|number|true|none|票种ID|ID 编号|
|attraction_id|number|true|none|所在景点ID|none|
|name|string|true|none|票种名称|名称|
|available|number|true|none|每日票种余量|none|

