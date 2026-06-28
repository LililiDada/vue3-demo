// toast.ts
import { createVNode, render, h } from 'vue';
import Toast from './Toast.vue';

export function showToast(params: {
  message: string;
  autoClose?: boolean;
  duration?: number;
}) {
  const { message, autoClose = true, duration } = params;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const container1 = document.createElement('div');
  document.body.appendChild(container1);

  // 创建 Toast 组件的虚拟节点
  const vnode = createVNode(Toast, {
    message,
    duration,
    autoClose,
    onClose: () => {
      // 卸载并清理 DOM 元素
      render(null, document.body);
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    },
  });

  // 渲染虚拟节点
  render(vnode, container);
  render(h('div', '1111111'), document.body);
  render(h('div', '2222222'), container1);
}
