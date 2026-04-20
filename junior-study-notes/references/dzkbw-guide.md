# dzkbw.com 电子课本网抓取指南

## URL 规律

```
https://www.dzkbw.com/books/{版本代码}/{科目拼音}/{年级代码}/
```

### 版本代码对照

| 出版社 | 版本代码 | 说明 |
|:---|:---|:---|
| 苏科版（江苏凤凰科学技术出版社） | `skb` | 苏州物理/生物常用 |
| 苏教版（江苏教育出版社） | `sj` | 苏州部分科目 |
| 人教版（人民教育出版社） | `rjb` | 全国通用 |
| 北师大版 | `bsd` | 部分地区数学 |
| 苏科版-生物专用 | `swbw` | 生物科目可能用此代码 |
| 人教版-旧版 | `rjb` | 带年份后缀 |

### 年级代码

| 年级 | 上册 | 下册 |
|:---|:---|:---|
| 七年级 | `7s` | `7x` |
| 八年级 | `8s` | `8x` |
| 九年级 | `9s` | `9x` |

带年份后缀：`7s_2024`、`8s_2024`、`8x_2025`

### 完整 URL 示例

```
苏科版八年级物理上：https://www.dzkbw.com/books/skb/wuli/8s_2024/
苏科版八年级物理下：https://www.dzkbw.com/books/skb/wuli/8x_2025/
苏科版七年级生物上：https://www.dzkbw.com/books/skb/shengwu/7s_2024/
苏科版七年级生物上：https://www.dzkbw.com/books/swbw/shengwu/7s_2024/  (备选)
人教版七年级生物上：https://www.dzkbw.com/books/rjb/shengwu/7s_2024/
```

## 抓取策略

### Python 脚本模板

```python
import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.dzkbw.com/books/skb/wuli/8s_2024/'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Referer': 'https://www.dzkbw.com/',
}
req = urllib.request.Request(url, headers=headers)
resp = urllib.request.urlopen(req, timeout=15, context=ctx)
html = resp.read()

# 编码：dzkbw 使用 GBK
try:
    text = html.decode('gbk')
except:
    text = html.decode('utf-8', errors='replace')

# 提取目录链接
links = re.findall(r'<a[^>]+href=["\']([^"\']*)["\'][^>]*>([^<]+)</a>', text)
for href, title in links:
    if re.search(r'第[一二三四五六七八九十\d]+章|节|单元', title):
        print(f'{href} -> {title}')
```

### 常见问题

| 问题 | 解决方案 |
|:---|:---|
| **403 Forbidden** | 网站 2025 年后加强了反爬，可能需要 Cookie 或真实浏览器。尝试用 `http.cookiejar` 建立 session |
| **SSL 证书错误** | 必须禁用 SSL 验证：`ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE` |
| **GBK 乱码** | `html.decode('gbk')`；若失败 fallback 到 `utf-8` |
| **PowerShell 乱码** | 不要在 PowerShell 中 print 中文内容，写文件后用 `read` 工具查看 |
| **终端 emoji 报错** | `UnicodeEncodeError: 'gbk'` — 避免在 print 中使用 emoji，用 `[OK]` 替代 ✓ |

### 备选方案（dzkbw 不可用时）

1. **学科网 (zxxk.com)**：搜索「{出版社}(2024) {年级}{科目}上册电子课本」
2. **好多电子课本网**：搜索苏教版/苏科版电子课本目录
3. **头条搜索**：`https://so.toutiao.com/search?keyword=...`
4. **Bing 搜索**：`https://cn.bing.com/search?q=...`
5. **直接问用户**：最可靠，请用户拍照教材目录
