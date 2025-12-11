import { mount } from '@vue/test-utils';
import BaseButton from '../BaseButton.vue';

describe('baseButton', ()=>{
  it('渲染正确的样式',()=>{
    // 挂载组件
    const wrapper = mount(BaseButton,{
      slots: {
        default: '点击我'
      }
    })
    // 断言:按钮应该包含在默认的css类
    expect(wrapper.classes()).toContain('btn')
    expect(wrapper.classes()).toContain('btn-default')

    // 断言:按钮文本内容正确
    expect(wrapper.text()).toBe('点击我')

    // 断言:按钮默认不是禁用状态
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })

  it('根据type属性渲染不同样式', ()=> {
    const types = ['primary','danger']
    types.forEach(type => {
      const wrapper = mount(BaseButton, {
        props: { type },
        slots: { default:'测试按钮' }
      })

      // 断言:按钮应该包含对应类型的css类
      expect(wrapper.classes()).toContain(`btn-${type}`)
    })
  })

  it('禁用状态下不能点击', ()=> {
    const wrapper = mount(BaseButton,{
      props: { disabled:true },
      slots: { default:'禁用按钮' }
    })
    // 断言:按钮应该有disabled属性
    expect(wrapper.attributes('disabled')).toBe('')

    // 断言:按钮应该包含禁用样式类
    expect(wrapper.classes()).toContain('btn')
  })

  it('点击时触发事件', async() => {
    const wrapper = mount(BaseButton,{
      slots: {default: '可点击按钮'}
    })

    // 模拟点击按钮
    await wrapper.trigger('click')

    // 断言:应该触发了click事件
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  // 测试禁用状态下不触发点击
  it('禁用状态下不触发点击事件',async()=>{
    const wrapper = mount(BaseButton,{
      props:{ disabled: true },
      slots: { default: '禁用按钮' }
    })

    // 模拟点击事件
    await wrapper.trigger('click')

    // 断言:不应该触发click事件
    expect(wrapper.emitted('clikc')).toBeUndefined()
  })
})