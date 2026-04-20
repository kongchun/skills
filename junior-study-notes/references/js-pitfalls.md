# JavaScript 中文引号陷阱

## 问题描述

在 JS 字符串中，中文引号 `""` 和 `''` 会被 JavaScript 引擎解析为字符串边界标识符，导致 SyntaxError。

### 错误示例

```javascript
const content = "声音的"响度"与振幅有关";
// SyntaxError: Unexpected identifier
// JS 将 "声音的" 视为一个字符串，"响度" 视为标识符
```

### 解决方案

| 方法 | 示例 | 推荐 |
|:---|:---|:---:|
| **角括号替换** | `"声音的「响度」与振幅有关"` | ✅ |
| **英文引号替换** | `"声音的\"响度\"与振幅有关"` | ✅ |
| **反引号模板** | `` `声音的"响度"与振幅有关` `` | ✅ |
| **转义** | `"声音的\u201C响度\u201D与振幅有关"` | ❌ 不可读 |

## 批量修复 Python 脚本

```python
import re, sys

def fix_chinese_quotes(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # 左中文引号 → 「  右中文引号 → 」
    content = content.replace('\u201c', '\u300c').replace('\u201d', '\u300d')
    content = content.replace('\u2018', '\u300e').replace('\u2019', '\u300f')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed: {filepath}')

if __name__ == '__main__':
    fix_chinese_quotes(sys.argv[1])
```

## 其他 Windows/GBK 相关陷阱

| 陷阱 | 表现 | 解决 |
|:---|:---|:---|
| **终端 print emoji** | `UnicodeEncodeError: 'gbk'` | 避免在 print 中用 emoji，用 `[OK]` |
| **PowerShell 中文路径** | Python `os.listdir()` 返回空 | 用 PowerShell `Get-ChildItem` 代替 |
| **桌面路径** | `C:\Users\{user}\Desktop` 可能映射到 D 盘 | 先用 PowerShell 确认实际路径 |
| **curl 在 PowerShell** | `curl` 是 `Invoke-WebRequest` 别名 | 用 Python `urllib` 代替 |
| **&& 在 PowerShell** | 不支持 `&&` 连接命令 | 用 `;` 代替，或写 Python 脚本 |
