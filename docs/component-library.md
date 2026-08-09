# 公共组件库使用规范

本文档说明 HTA 项目中公共组件库的使用方式。

## 已提供的公共组件

### Vue Mixins

| 组件 | 引用方式 | 说明 |
|------|----------|------|
| `ToastMixin` | `mixins: [HTAComponents.ToastMixin]` | Toast 通知，提供 `showToast(msg, duration)` 方法 |
| `LoadingMixin` | `mixins: [HTAComponents.LoadingMixin]` | 加载状态，提供 `loading` 数据属性 |

### Vue 指令

| 指令 | 引用方式 | 说明 |
|------|----------|------|
| `FocusDirective` | `Vue.directive('focus', HTAComponents.FocusDirective)` | 自动聚焦指令 |

### 工具函数

| 函数 | 说明 |
|------|------|
| `HTAComponents.writeLog(msg)` | 写入日志到 `logs/error.log` |
| `HTAComponents.sleep(ms)` | 阻塞等待（毫秒） |

## 使用方式

### HTML 引用顺序

每个 app 的 `main.hta` 中必须按以下顺序引用：

```html
<script language="javascript" src="../vue/vue.js"></script>
<script language="javascript" src="../components/js/com.js"></script>
<script language="javascript" src="../components/js/common.js"></script>
<link rel="stylesheet" type="text/css" href="../components/css/common.css" />
<link rel="stylesheet" type="text/css" href="css/style.css" />
```

### JavaScript 使用

```javascript
var writeLog = HTAComponents.writeLog;
var sleep = HTAComponents.sleep;

Vue.directive('focus', HTAComponents.FocusDirective);

new Vue({
    el: '#app',
    mixins: [HTAComponents.ToastMixin, HTAComponents.LoadingMixin],
    methods: {
        doSomething: function() {
            var self = this;
            this.loading = true;
            setTimeout(function() {
                self.loading = false;
                self.showToast('操作完成');
            }, 1000);
        }
    }
});
```

## 公共组件 CSS 说明

`components/css/common.css` 包含以下共享样式：

### Toast 通知

```html
<div class="toast" :class="{ show: toastVisible }">{{ toastMessage }}</div>
```

- `.toast` — 基础样式（隐藏状态）
- `.toast.show` — 显示状态

### 模态对话框

```html
<div class="modal-mask" :class="{ show: showModal }" @click.self="showModal = false">
    <div class="modal">
        <div class="modal-title">标题</div>
        <div class="modal-body">内容</div>
        <div class="modal-footer">
            <button class="btn-cancel" @click="showModal = false">取消</button>
            <button class="btn-confirm" @click="confirm">确认</button>
        </div>
    </div>
</div>
```

- `.modal-mask` — 遮罩层
- `.modal-mask.show` — 显示遮罩
- `.modal` — 对话框容器
- `.modal-title` — 标题区域
- `.modal-body` — 内容区域
- `.modal-footer` — 底部按钮区域

### 加载遮罩

```html
<div class="loading-overlay" v-if="loading">
    <div class="loading-spinner"></div>
</div>
```

- `.loading-overlay` — 全屏遮罩
- `.loading-spinner` — 旋转动画

### 按钮样式

- `.btn-confirm` — 确认按钮（蓝色）
- `.btn-cancel` — 取消按钮（灰色）

## 新增公共组件的流程

1. 当多个 app 出现相同功能时，抽取到 `components/` 中
2. JS 组件写入 `components/js/common.js` 或 `com.js`（COM 相关）
3. 对应样式写入 `components/css/common.css`
4. 在 `components/types/common.d.ts` 中添加对应的类型定义（命名空间 `CommonComponents`）
5. 更新 AGENTS.md 的表格
6. 各 app 移除重复代码，改为引用公共组件
