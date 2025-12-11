
import type { Component } from 'vue';
import { defineComponent, h } from 'vue';

/**
 * 将指定组件设置自定义名称
 *
 * @param {String} name 组件自定义名称
 * @param {CustomComponent} component
 * @return {Component}
 */
export default function createCustomComponent(customName:string, asyncComponent:Component) {
    return defineComponent({
        name: customName,
        setup() {
            return () => {
                return h(asyncComponent);
            };
        },
    });
// return defineComponent(
//   (props) => {
//     // 就像在 <script setup> 中一样使用组合式 API
//     const count = ref(0)

//     return () => {
//       // 渲染函数或 JSX
//       return h(asyncComponent)
//     }
//   },
//   // 其他选项，例如声明 props 和 emits。
//   {
//     props: {
//       /* ... */
//     }
//   }
// )
}



