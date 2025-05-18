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

- HTTP Authentication, scheme: bearer

# 景区管理

## POST 查询景点列表

POST /attraction/query

获取景点列表，支持分页和搜索

> Body 请求参数

```json
{
  "id": 1,
  "keyword": "",
  "page": 1,
  "pageSize": 10
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» id|body|number| 是 | 景点ID|none|
|» keyword|body|string¦null| 否 | 搜索关键字|none|
|» page|body|number¦null| 否 | 页码|none|
|» pageSize|body|number¦null| 否 | 每页数量|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "total": 1,
    "attractions": [
      {
        "id": "1",
        "name": "樱花谷",
        "description": "春季赏樱胜地，风景优美",
        "open_time": "08:00-18:00",
        "image_url": "/images/sakura.jpg",
        "created_at": "2025-04-19T20:23:00.602Z",
        "updated_at": "2025-04-19T20:23:00.602Z"
      }
    ],
    "page": 1,
    "pageSize": 10
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
|» message|string¦null|true|none|信息|成功为空, 错误为错误信息|
|» data|object|true|none|数据|none|
|»» total|number|true|none|结果数量|none|
|»» attractions|[object]|true|none|景点信息|none|
|»»» id|string|true|none|景点ID|ID 编号|
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
|» data|object¦null|true|none|景点信息|none|
|»» attraction|object|true|none|景点信息|none|
|»»» id|string|true|none|景点ID|ID 编号|
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
  "status": "normal"
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
  "message": null,
  "data": {
    "total": 1,
    "facilities": [
      {
        "id": "1",
        "name": "休息亭",
        "attraction_id": "1",
        "location": "樱花谷入口",
        "status": "normal"
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
|»»» id|string|true|none|设施ID|ID 编号|
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
  "attraction_id": 1,
  "name": "休息亭",
  "location": "樱花谷入口",
  "status": "normal"
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
      "id": "1",
      "name": "休息亭",
      "attraction_id": "1",
      "location": "樱花谷入口",
      "status": "normal"
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
|» data|object¦null|true|none|数据|none|
|»» facility|object|true|none|设施信息|none|
|»»» id|string|true|none|设施ID|ID 编号|
|»»» name|string|true|none|设施名称|名称|
|»»» attraction_id|number|true|none|所在景点ID|none|
|»»» location|string|true|none|设施位置|none|
|»»» status|string|true|none|设施状态|none|

## POST 更新景点

POST /attraction/update

> Body 请求参数

```json
{
  "id": "1",
  "name": "樱花谷",
  "description": "春季赏樱胜地",
  "open_time": "open_time",
  "image_url": "/images/sakura.jpg"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» id|body|string| 是 | 景点ID|ID 编号|
|» name|body|string¦null| 否 | 景点名称|名称|
|» description|body|string¦null| 否 | 景点描述|none|
|» open_time|body|string¦null| 否 | 开放时间|none|
|» image_url|body|string¦null| 否 | 图片链接|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "attraction": {
      "id": "1",
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
|» code|number|true|none|状态码|0 表示成功，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object¦null|true|none|数据|none|
|»» attraction|object|true|none|景点信息|none|
|»»» id|string|true|none|景点ID|ID 编号|
|»»» name|string|true|none|景点名称|名称|
|»»» description|string|true|none|景点描述|none|
|»»» open_time|string|true|none|开放时间|none|
|»»» image_url|string|true|none|图片链接|none|

## POST 删除景点

POST /attraction/delete

> Body 请求参数

```json
{
  "id": 3
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» id|body|number| 是 | 景点ID|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "success": true
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
|» data|object¦null|true|none|数据|none|
|»» success|boolean|true|none|是否成功|none|

## POST 更新设施

POST /facility/update

管理员添加新设施

> Body 请求参数

```json
{
  "id": 1,
  "attraction_id": 1,
  "name": "休息亭",
  "location": "樱花谷入口",
  "status": "normal"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» id|body|number| 是 | 设施ID|ID 编号|
|» attraction_id|body|number| 否 | 所在景点ID|ID 编号|
|» name|body|string| 否 | 设施名称|名称|
|» location|body|string| 否 | 设施位置|none|
|» status|body|string| 否 | 设施状态|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "facility": {
      "id": "1",
      "name": "休息亭",
      "attraction_id": 1,
      "location": "樱花谷入口",
      "status": "normal"
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
|» data|object¦null|true|none|数据|none|
|»» facility|object|true|none|设施信息|none|
|»»» id|string|true|none|设施ID|ID 编号|
|»»» name|string|true|none|设施名称|名称|
|»»» attraction_id|number|true|none|所在景点ID|none|
|»»» location|string|true|none|设施位置|none|
|»»» status|string|true|none|设施状态|none|

## POST 删除设施

POST /facility/delete

管理员添加新设施

> Body 请求参数

```json
{
  "id": 4
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» id|body|number| 是 | 设施ID|ID 编号|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "success": true
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
|» data|object¦null|true|none|数据|none|
|»» success|boolean|true|none|是否成功|none|

# 用户管理

## POST 用户注册

POST /user/register

新用户注册，注册成功返回 JWT 自动完成登录

> Body 请求参数

```json
{
  "username": "TomyJan",
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
|» data|object¦null|true|none|数据|none|
|»» user|object|true|none|用户信息|none|
|»»» id|string|true|none|用户ID|ID 编号|
|»»» username|string|true|none|用户名|none|
|»»» role|string|true|none|用户组|none|
|»» token|string|true|none|JWT|none|

## POST 用户登录

POST /user/login

用户登录，返回 JWT

> Body 请求参数

```json
{
  "username": "TomyJan",
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
|» data|object¦null|true|none|数据|none|
|»» user|object|true|none|用户信息|none|
|»»» id|string|true|none|用户ID|ID 编号|
|»»» username|string|true|none|用户名|none|
|»»» role|string|true|none|用户组|none|
|»» token|string|true|none|JWT|none|

## POST 查询用户列表

POST /admin/users/query

> Body 请求参数

```json
{
  "page": 1,
  "pageSize": 10,
  "keyword": null,
  "role": "user"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» page|body|number¦null| 否 | 页码|none|
|» pageSize|body|number¦null| 否 | 每页数量|none|
|» keyword|body|string¦null| 否 | 搜索关键词|none|
|» role|body|string¦null| 否 | 角色组|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "total": 1,
    "users": [
      {
        "id": "1",
        "username": "TomyJan",
        "role": "user"
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
|» data|object¦null|true|none|数据|none|
|»» total|number|true|none|总数量|none|
|»» users|[object]|true|none|用户信息|none|
|»»» id|string|true|none|用户ID|ID 编号|
|»»» username|string|true|none|用户名|none|
|»»» role|string|true|none|用户组|none|

## POST 添加用户

POST /admin/users/add

> Body 请求参数

```json
{
  "username": "test1",
  "password": "b444ac06613fc8d63795be9ad0beaf55011936ac",
  "role": "user"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» username|body|string| 是 | 用户名|none|
|» password|body|string| 是 | SHA1的密码|none|
|» role|body|string| 是 | 角色组|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "user": {
      "id": "1",
      "username": "TomyJan",
      "role": "user"
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
|» code|number|true|none|状态码|0 表示成功，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object¦null|true|none|数据|none|
|»» user|object|true|none|用户信息|none|
|»»» id|string|true|none|用户ID|ID 编号|
|»»» username|string|true|none|用户名|none|
|»»» role|string|true|none|用户组|none|

## POST 更新用户

POST /admin/users/update

> Body 请求参数

```json
{
  "id": 2,
  "role": "user"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» id|body|number| 是 | 用户ID|ID 编号|
|» role|body|string| 是 | 角色组|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "user": {
      "id": "1",
      "username": "TomyJan",
      "role": "user"
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
|» code|number|true|none|状态码|0 表示成功，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object¦null|true|none|数据|none|
|»» user|object|true|none|用户信息|none|
|»»» id|string|true|none|用户ID|ID 编号|
|»»» username|string|true|none|用户名|none|
|»»» role|string|true|none|用户组|none|

## POST 删除用户

POST /admin/users/delete

> Body 请求参数

```json
{
  "id": 3
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» id|body|number| 是 | 用户ID|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "success": true
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
|» data|object¦null|true|none|数据|none|
|»» success|boolean|true|none|是否成功|none|

# 票务预约

## POST 查询已购门票列表

POST /order/query

管理员或用户获取用户浏览、预定等记录

> Body 请求参数

```json
{
  "user_id": 1,
  "order_id": 1,
  "status": "success",
  "attraction_id": "1",
  "start_date": "2025-07-15",
  "end_date": "2025-07-15",
  "page": 1,
  "pageSize": 10
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» user_id|body|number| 否 | 目标用户ID|none|
|» order_id|body|number| 否 | 订单ID|none|
|» status|body|string| 否 | 订单状态|none|
|» attraction_id|body|string| 否 | 景点ID|none|
|» start_date|body|string(date)| 否 | 开始日期|none|
|» end_date|body|string(date)| 否 | 结束日期|none|
|» page|body|number| 是 | 页码|none|
|» pageSize|body|number| 是 | 每页数量|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "total": 1,
    "orders": [
      {
        "id": "1",
        "order_id": "1",
        "ticket_id": "1",
        "ticket_name": "单人票",
        "quantity": 1,
        "attraction_id": "1",
        "attraction_name": "樱花谷",
        "date": "2025-07-15",
        "total_price": 0,
        "user_id": "1",
        "status": "success",
        "created_at": "2025-07-15T10:00:00Z",
        "updated_at": "2025-07-15T10:00:00Z"
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
|» data|object¦null|true|none|数据|none|
|»» total|number|true|none|记录总数|none|
|»» orders|[object]|true|none|记录信息|none|
|»»» id|string|true|none|记录ID|ID 编号|
|»»» order_id|string|true|none|订单ID|none|
|»»» ticket_id|string|true|none|票种ID|none|
|»»» ticket_name|string|true|none|票种名称|none|
|»»» quantity|number|true|none|门票数量|none|
|»»» attraction_id|string|true|none|景点ID|none|
|»»» attraction_name|string|true|none|景点名称|none|
|»»» date|string(date)|true|none|门票日期|none|
|»»» total_price|string|true|none|总价格|none|
|»»» user_id|string|true|none|用户ID|none|
|»»» status|string|true|none|订单状态|none|
|»»» created_at|string(date-time)|true|none|创建时间|none|
|»»» updated_at|string(date-time)|true|none|更新时间|none|

## POST 购买门票

POST /order/create

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
      "id": "1",
      "order_id": "1",
      "ticket_id": "1",
      "ticket_name": "单人票",
      "quantity": 1,
      "attraction_id": "1",
      "attraction_name": "樱花谷",
      "date": "2025-07-15",
      "total_price": 0,
      "user_id": "1",
      "status": "success",
      "created_at": "2025-07-15T10:00:00Z",
      "updated_at": "2025-07-15T10:00:00Z"
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
|» data|object¦null|true|none|数据|none|
|»» ticket|object|true|none|门票信息|none|
|»»» id|string|true|none|记录ID|ID 编号|
|»»» order_id|string|true|none|订单ID|none|
|»»» ticket_id|string|true|none|票种ID|none|
|»»» ticket_name|string|true|none|票种名称|none|
|»»» quantity|number|true|none|门票数量|none|
|»»» attraction_id|string|true|none|景点ID|none|
|»»» attraction_name|string|true|none|景点名称|none|
|»»» date|string(date)|true|none|门票日期|none|
|»»» total_price|string|true|none|总价格|none|
|»»» user_id|string|true|none|用户ID|none|
|»»» status|string|true|none|订单状态|none|
|»»» created_at|string(date-time)|true|none|创建时间|none|
|»»» updated_at|string(date-time)|true|none|更新时间|none|

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
|» data|object¦null|true|none|数据|none|
|»» ticket|object|true|none|门票信息|none|
|»»» id|string|true|none|票种ID|ID 编号|
|»»» attraction_id|string|true|none|所在景点ID|none|
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
|» data|object¦null|true|none|数据|none|
|»» ticket|object|true|none|门票信息|none|
|»»» id|string|true|none|票种ID|ID 编号|
|»»» attraction_id|string|true|none|所在景点ID|none|
|»»» name|string|true|none|票种名称|名称|
|»»» available|number|true|none|每日票种余量|none|

## POST 修改门票订单

POST /order/update

用户修改已购门票的日期或数量

> Body 请求参数

```json
{
  "order_id": 1,
  "quantity": 1,
  "date": "2025-07-15",
  "status": "success",
  "ticket_id": "1"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» order_id|body|number| 是 | 订单ID|要修改的订单ID|
|» quantity|body|number| 否 | 门票数量|修改后的数量，不填则保持原数量|
|» date|body|string(date)| 否 | 门票日期|修改后的日期，不填则保持原日期|
|» status|body|string| 否 | 订单状态|none|
|» ticket_id|body|string| 否 | 票种ID|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "ticket": {
      "id": "1",
      "order_id": "1",
      "ticket_id": "1",
      "ticket_name": "单人票",
      "quantity": 1,
      "attraction_id": "1",
      "attraction_name": "樱花谷",
      "date": "2025-07-15",
      "total_price": 0,
      "user_id": "1",
      "status": "success",
      "created_at": "2025-07-15T10:00:00Z",
      "updated_at": "2025-07-15T10:00:00Z"
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
|» code|number|true|none|状态码|0 表示成功，1005 表示票种余量不足，1006 表示订单不存在，2001 表示无权限修改，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object¦null|true|none|数据|none|
|»» ticket|object|true|none|门票信息|none|
|»»» id|string|true|none|记录ID|ID 编号|
|»»» order_id|string|true|none|订单ID|none|
|»»» ticket_id|string|true|none|票种ID|none|
|»»» ticket_name|string|true|none|票种名称|none|
|»»» quantity|number|true|none|门票数量|none|
|»»» attraction_id|string|true|none|景点ID|none|
|»»» attraction_name|string|true|none|景点名称|none|
|»»» date|string(date)|true|none|门票日期|none|
|»»» total_price|string|true|none|总价格|none|
|»»» user_id|string|true|none|用户ID|none|
|»»» status|string|true|none|订单状态|none|
|»»» created_at|string(date-time)|true|none|创建时间|none|
|»»» updated_at|string(date-time)|true|none|更新时间|none|

## POST 查询票种列表

POST /ticket/query

> Body 请求参数

```json
{
  "attraction_id": 1
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» attraction_id|body|number| 是 | 景点ID|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "tickets": [
      {
        "id": "1",
        "attraction_id": "1",
        "name": "单人票",
        "available": 100,
        "created_at": "2025-07-15",
        "updated_at": "2025-07-15"
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
|» code|number|true|none|状态码|0 表示成功，1001 表示参数错误, 非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object¦null|true|none|数据|none|
|»» tickets|[object]|true|none|票种信息|none|
|»»» id|string|true|none|票种ID|ID 编号|
|»»» attraction_id|string|true|none|所在景点ID|none|
|»»» name|string|true|none|票种名称|名称|
|»»» available|number|true|none|当日票种余量|none|
|»»» created_at|string(date)|true|none|票种创建日期|none|
|»»» updated_at|string(date)|true|none|票种更新日期|none|

## POST 更新票种

POST /ticket/update

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
|» data|object¦null|true|none|数据|none|
|»» ticket|object|true|none|门票信息|none|
|»»» id|string|true|none|票种ID|ID 编号|
|»»» attraction_id|string|true|none|所在景点ID|none|
|»»» name|string|true|none|票种名称|名称|
|»»» available|number|true|none|每日票种余量|none|

## POST 查询票种列表 Copy

POST /ticket/delete

> Body 请求参数

```json
{
  "attraction_id": 1
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» attraction_id|body|number| 是 | 景点ID|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "tickets": [
      {
        "id": "1",
        "attraction_id": "1",
        "name": "单人票",
        "available": 100,
        "created_at": "2025-07-15",
        "updated_at": "2025-07-15"
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
|» code|number|true|none|状态码|0 表示成功，1001 表示参数错误, 非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object¦null|true|none|数据|none|
|»» tickets|[object]|true|none|票种信息|none|
|»»» id|string|true|none|票种ID|ID 编号|
|»»» attraction_id|string|true|none|所在景点ID|none|
|»»» name|string|true|none|票种名称|名称|
|»»» available|number|true|none|当日票种余量|none|
|»»» created_at|string(date)|true|none|票种创建日期|none|
|»»» updated_at|string(date)|true|none|票种更新日期|none|

# 用户反馈

## POST 添加反馈

POST /feedback/add

用户对景点添加反馈评价

> Body 请求参数

```json
{
  "attraction_id": 1,
  "score": 5,
  "comment": "很好"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» attraction_id|body|number| 是 | 景点ID|要评价的景点ID|
|» score|body|number| 是 | 评分|1-5之间的整数评分|
|» comment|body|string| 否 | 评论内容|评论内容，可选，不超过500字符|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "feedback": {
      "id": 1,
      "user_id": 1,
      "attraction_id": 1,
      "score": 5,
      "comment": "很好",
      "status": "public",
      "created_at": "2025-07-15T10:00:00Z",
      "updated_at": "2025-07-15T10:00:00Z"
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
|» code|number|true|none|状态码|0 表示成功，1001 参数错误，1002 已存在反馈，2001 未登录，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object¦null|true|none|数据|反馈成功时返回数据，错误时为 null|
|»» feedback|object|true|none|反馈信息|包含反馈的详细信息|
|»»» id|string|true|none|反馈ID|反馈记录的ID|
|»»» user_id|string|true|none|用户ID|提交反馈的用户ID|
|»»» attraction_id|number|true|none|景点ID|被评价的景点ID|
|»»» attraction_name|string|true|none|景点名称|none|
|»»» score|number|true|none|评分|用户评分（1-5）|
|»»» comment|string|false|none|评论内容|用户评论，可以为null|
|»»» status|string|true|none|状态|反馈状态，public或deleted|
|»»» created_at|string(date-time)|true|none|创建时间|反馈创建时间|
|»»» updated_at|string(date-time)|true|none|更新时间|反馈更新时间|

## POST 查询反馈

POST /feedback/query

查询用户或景点的反馈信息

> Body 请求参数

```json
{
  "id": 1,
  "attraction_id": 1,
  "user_id": 1,
  "min_score": 1,
  "max_score": 5,
  "has_comment": true,
  "keyword": "好",
  "include_deleted": false,
  "page": 1,
  "pageSize": 10
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» id|body|number| 否 | 反馈ID|获取单个反馈时使用|
|» attraction_id|body|number| 否 | 景点ID|获取指定景点的反馈|
|» user_id|body|number| 否 | 用户ID|获取指定用户的反馈，管理员可查询任何用户|
|» min_score|body|number| 否 | 最小评分|按最小评分筛选|
|» max_score|body|number| 否 | 最大评分|按最大评分筛选|
|» has_comment|body|boolean| 否 | 是否有评论|true筛选有评论的，false筛选无评论的|
|» keyword|body|string| 否 | 关键词|在评论中搜索的关键词|
|» include_deleted|body|boolean| 否 | 包含已删除|none|
|» page|body|number| 否 | 页码|分页参数，默认为1|
|» pageSize|body|number| 否 | 每页数量|分页参数，默认为10，最大50|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "total": 1,
    "feedback": [
      {
        "id": "1",
        "user_id": "1",
        "attraction_id": 1,
        "score": 5,
        "comment": "很好",
        "status": "public",
        "created_at": "2025-07-15T10:00:00Z",
        "updated_at": "2025-07-15T10:00:00Z"
      }
    ],
    "avgScore": 4.9
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
|» code|number|true|none|状态码|0 表示成功，1001 参数错误，1006 反馈不存在，2001 权限错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object¦null|true|none|数据|查询成功时返回数据，错误时为null|
|»» total|number|true|none|总数|符合条件的反馈总数|
|»» feedback|[object]|true|none|反馈列表|反馈记录列表|
|»»» id|string|true|none|反馈ID|反馈记录的ID|
|»»» user_id|string|true|none|用户ID|提交反馈的用户ID|
|»»» attraction_id|number|true|none|景点ID|被评价的景点ID|
|»»» attraction_name|string|true|none|景点名称|none|
|»»» score|number|true|none|评分|用户评分（1-5）|
|»»» comment|string|false|none|评论内容|用户评论，可以为null|
|»»» status|string|true|none|状态|反馈状态，public或deleted|
|»»» created_at|string(date-time)|true|none|创建时间|反馈创建时间|
|»»» updated_at|string(date-time)|true|none|更新时间|反馈更新时间|
|»» avgScore|number|true|none|平均分|指定景点的平均评分|

## POST 更新反馈

POST /feedback/update

> Body 请求参数

```json
{
  "id": 1,
  "score": 5,
  "comment": "很好",
  "status": "public"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» id|body|number| 是 | 反馈ID|要更新的反馈ID|
|» score|body|number| 否 | 评分|更新的评分，1-5之间|
|» comment|body|string| 否 | 评论内容|更新的评论内容，null表示清除评论|
|» status|body|string| 否 | 状态|反馈状态，public正常，deleted表示删除|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "feedback": {
      "id": "1",
      "user_id": "1",
      "attraction_id": 1,
      "attraction_name": "樱花谷",
      "score": 5,
      "comment": "很好",
      "status": "public",
      "created_at": "2025-07-15T10:00:00Z",
      "updated_at": "2025-07-15T10:00:00Z"
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
|» code|number|true|none|状态码|0 表示成功，非 0 表示错误|
|» message|string¦null|true|none|信息|成功为null, 错误为错误信息|
|» data|object¦null|true|none|数据|none|
|»» feedback|object|true|none|反馈信息|更新后的反馈信息|
|»»» id|string|true|none|反馈ID|反馈记录的ID|
|»»» user_id|string|true|none|用户ID|提交反馈的用户ID|
|»»» attraction_id|number|true|none|景点ID|被评价的景点ID|
|»»» attraction_name|string|true|none|景点名称|none|
|»»» score|number|true|none|评分|用户评分（1-5）|
|»»» comment|string|false|none|评论内容|用户评论，可以为null|
|»»» status|string|true|none|状态|反馈状态，public或deleted|
|»»» created_at|string(date-time)|true|none|创建时间|反馈创建时间|
|»»» updated_at|string(date-time)|true|none|更新时间|反馈更新时间|

# 数据分析

## POST 反馈统计

POST /feedback/stats

> Body 请求参数

```json
{
  "attraction_id": 1,
  "include_deleted": false
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» attraction_id|body|number| 否 | 指定景点ID|none|
|» include_deleted|body|boolean| 否 | 包含删除的反馈|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "totalCount": 2,
    "avgScore": 5,
    "scoreDistribution": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 2
    },
    "withCommentCount": 1,
    "withCommentPercent": 50
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
|» data|object¦null|true|none|数据|none|
|»» totalCount|number|true|none|反馈数量|none|
|»» avgScore|number|true|none|平均分|none|
|»» scoreDistribution|object|true|none|评分分布|none|
|»»» 1|number|true|none||none|
|»»» 2|number|true|none||none|
|»»» 3|number|true|none||none|
|»»» 4|number|true|none||none|
|»»» 5|number|true|none||none|
|»» withCommentCount|number|true|none|带评论反馈|none|
|»» withCommentPercent|number|true|none|带评论占比|none|

## POST 管理员统计

POST /admin/stats

> Body 请求参数

```json
{}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": null,
  "data": {
    "attractions": 2,
    "users": 2,
    "feedback": 1,
    "avgScore": 5
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
|» data|object¦null|true|none|数据|none|
|»» attractions|number|true|none|景点数量|none|
|»» users|number|true|none|用户数量|none|
|»» feedback|number|true|none|反馈数量|none|
|»» avgScore|number|true|none|平均评分|none|

## POST 景点统计

POST /attraction/stats

> Body 请求参数

```json
{}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "string",
  "data": {
    "total": 2,
    "attractions": [
      {
        "id": "1",
        "name": "樱花谷",
        "description": "春季赏樱胜地，风景优美",
        "feedbackCount": "1"
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
|» data|object¦null|true|none|数据|none|
|»» total|number|true|none|景点总数|none|
|»» attractions|[object]|true|none|景点信息|none|
|»»» id|string|true|none|景点ID|ID 编号|
|»»» name|string|true|none|景点名称|名称|
|»»» description|string|true|none|景点描述|none|
|»»» feedbackCount|string|true|none|反馈数量|none|

# 数据模型

<h2 id="tocS_单个景点信息">单个景点信息</h2>

<a id="schema单个景点信息"></a>
<a id="schema_单个景点信息"></a>
<a id="tocS单个景点信息"></a>
<a id="tocs单个景点信息"></a>

```json
{
  "id": "1",
  "name": "樱花谷",
  "description": "春季赏樱胜地",
  "open_time": "open_time",
  "image_url": "/images/sakura.jpg"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|true|none|景点ID|ID 编号|
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
  "id": "1",
  "name": "休息亭",
  "attraction_id": 1,
  "location": "樱花谷入口",
  "status": "normal"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|true|none|设施ID|ID 编号|
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
  "id": "1",
  "username": "TomyJan",
  "role": "user"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|true|none|用户ID|ID 编号|
|username|string|true|none|用户名|none|
|role|string|true|none|用户组|none|

<h2 id="tocS_单条门票记录">单条门票记录</h2>

<a id="schema单条门票记录"></a>
<a id="schema_单条门票记录"></a>
<a id="tocS单条门票记录"></a>
<a id="tocs单条门票记录"></a>

```json
{
  "id": "1",
  "order_id": "1",
  "ticket_id": "1",
  "ticket_name": "单人票",
  "quantity": 1,
  "attraction_id": "1",
  "attraction_name": "樱花谷",
  "date": "2025-07-15",
  "total_price": "0.00",
  "user_id": "1",
  "status": "success",
  "created_at": "2025-07-15T10:00:00Z",
  "updated_at": "2025-07-15T10:00:00Z"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|true|none|记录ID|ID 编号|
|order_id|string|true|none|订单ID|none|
|ticket_id|string|true|none|票种ID|none|
|ticket_name|string|true|none|票种名称|none|
|quantity|number|true|none|门票数量|none|
|attraction_id|string|true|none|景点ID|none|
|attraction_name|string|true|none|景点名称|none|
|date|string(date)|true|none|门票日期|none|
|total_price|string|true|none|总价格|none|
|user_id|string|true|none|用户ID|none|
|status|string|true|none|订单状态|none|
|created_at|string(date-time)|true|none|创建时间|none|
|updated_at|string(date-time)|true|none|更新时间|none|

<h2 id="tocS_单日单条票种信息">单日单条票种信息</h2>

<a id="schema单日单条票种信息"></a>
<a id="schema_单日单条票种信息"></a>
<a id="tocS单日单条票种信息"></a>
<a id="tocs单日单条票种信息"></a>

```json
{
  "id": "1",
  "attraction_id": "1",
  "name": "单人票",
  "available": 100,
  "date": "2025-07-15"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|true|none|票种ID|ID 编号|
|attraction_id|string|true|none|所在景点ID|none|
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
  "id": "1",
  "attraction_id": "1",
  "name": "单人票",
  "available": 100
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|true|none|票种ID|ID 编号|
|attraction_id|string|true|none|所在景点ID|none|
|name|string|true|none|票种名称|名称|
|available|number|true|none|每日票种余量|none|

<h2 id="tocS_单条反馈信息">单条反馈信息</h2>

<a id="schema单条反馈信息"></a>
<a id="schema_单条反馈信息"></a>
<a id="tocS单条反馈信息"></a>
<a id="tocs单条反馈信息"></a>

```json
{
  "id": "1",
  "user_id": "1",
  "attraction_id": 1,
  "attraction_name": "樱花谷",
  "score": 5,
  "comment": "很好",
  "status": "public",
  "created_at": "2025-07-15T10:00:00Z",
  "updated_at": "2025-07-15T10:00:00Z"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|true|none|反馈ID|反馈记录的ID|
|user_id|string|true|none|用户ID|提交反馈的用户ID|
|attraction_id|number|true|none|景点ID|被评价的景点ID|
|attraction_name|string|true|none|景点名称|none|
|score|number|true|none|评分|用户评分（1-5）|
|comment|string|false|none|评论内容|用户评论，可以为null|
|status|string|true|none|状态|反馈状态，public或deleted|
|created_at|string(date-time)|true|none|创建时间|反馈创建时间|
|updated_at|string(date-time)|true|none|更新时间|反馈更新时间|

<h2 id="tocS_单条票种信息1">单条票种信息1</h2>

<a id="schema单条票种信息1"></a>
<a id="schema_单条票种信息1"></a>
<a id="tocS单条票种信息1"></a>
<a id="tocs单条票种信息1"></a>

```json
{
  "id": "1",
  "attraction_id": "1",
  "name": "单人票",
  "available": 100,
  "created_at": "2025-07-15",
  "updated_at": "2025-07-15"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|true|none|票种ID|ID 编号|
|attraction_id|string|true|none|所在景点ID|none|
|name|string|true|none|票种名称|名称|
|available|number|true|none|当日票种余量|none|
|created_at|string(date)|true|none|票种创建日期|none|
|updated_at|string(date)|true|none|票种更新日期|none|

<h2 id="tocS_单个景点统计信息">单个景点统计信息</h2>

<a id="schema单个景点统计信息"></a>
<a id="schema_单个景点统计信息"></a>
<a id="tocS单个景点统计信息"></a>
<a id="tocs单个景点统计信息"></a>

```json
{
  "id": "1",
  "name": "樱花谷",
  "description": "春季赏樱胜地，风景优美",
  "feedbackCount": "1"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|true|none|景点ID|ID 编号|
|name|string|true|none|景点名称|名称|
|description|string|true|none|景点描述|none|
|feedbackCount|string|true|none|反馈数量|none|

