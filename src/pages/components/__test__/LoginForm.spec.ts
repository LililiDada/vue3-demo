import { mount } from '@vue/test-utils';
import LoginForm from '../LoginForm.vue';


describe('LoginForm',()=>{
  // 测试初始状态
  it('初始渲染正确',()=>{
    const wrapper = mount(LoginForm)

    // 断言:表单元素都存在
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)

    // 断言:初始状态下按钮是禁用状态
    expect(wrapper.find('button').attributes('disabled')).toBe('')

    // 断言:没用错误信息
    expect(wrapper.find('.error-message').exists()).toBe(false)
    expect(wrapper.find('.submit-error').exists()).toBe(false)
  })

  // 测试表单验证
  it('验证邮箱格式', async()=>{
    const wrapper = mount(LoginForm)
    const emailInput = wrapper.find('input[type="email"]')

    // 输入无效邮箱
    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')

    // 断言:应该显示错误信息
    expect(wrapper.find('.error-message').text()).toContain('邮箱格式不正确')

    // 输入有效邮箱
    await emailInput.setValue('test@example.com')
    await emailInput.trigger('blur')

    // 断言:错误信息应该消失
    expect(wrapper.find('.error-message').exists()).toBe(false)
  })

  it('验证密码长度', async()=>{
    const wrapper = mount(LoginForm)
    const passwordInput = wrapper.find('input[type="password"]')

    // 输入过短密码
    await passwordInput.setValue('123')
    await passwordInput.trigger('blur')

    // 断言:应该显示错误信息
    expect(wrapper.find('.error-message').text()).toContain('密码至少6位')

    // 输入有效密码
    await passwordInput.setValue('123456')
    await passwordInput.trigger('blur')

    // 断言:错误信息应该消失
    expect(wrapper.find('.error-message').exists()).toBe(false)
  })

  // 测试表单提交-成功情况
  it('成功提交表单', async()=>{
    // 模拟定时器
    vi.useFakeTimers()

    // 模拟math.random返回较大值以确保成功
    const mockMath = Object.create(global.Math)
    mockMath.random = () => 0.9
    global.Math = mockMath

    const wrapper = mount(LoginForm)

    // 填写有效表单
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('123456')

    // 断言:按钮应该可用
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()

    // 提交表单
    await wrapper.find('form').trigger('submit.prevent')

    // 快速推荐定时器
    vi.advanceTimersByTime(1000)

    // 等待vue更新
    await wrapper.vm.$nextTick()

    // 断言:应该触发了success事件

    const successEvents = wrapper.emitted('success')
    console.log(successEvents)
    expect(successEvents).toBeDefined() // 确保事件被触发
    expect(successEvents!.length).toBe(1) // 确保只触发了 1 次
    expect(successEvents![0][0]).toEqual({
      email:'test@example.com'
    })

    global.Math = Object.getPrototypeOf(mockMath)
    vi.useRealTimers()
  })

  // 测试表单提交-失败情况
  it('处理提交失败', async()=>{
    // 模拟定时器
    vi.useFakeTimers()
    // 模拟math.random返回较小值以确保失败
    const mockMath = Object.create(global.Math)
    mockMath.random = () => 0.1
    global.Math = mockMath

    const wrapper = mount(LoginForm)
    
    // 填写有效表单
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('123456')

    // 提交表单
    await wrapper.find('form').trigger('submit.prevent')

     // 快速推进定时器
    vi.advanceTimersByTime(2000)
    await vi.runAllTicks()
    await wrapper.vm.$nextTick()

    // 断言:应该有错误信息
    expect(wrapper.find('.submit-error').text()).toContain('登录失败')

    global.Math = Object.getPrototypeOf(mockMath)
    vi.useRealTimers()
  })

  // 测试加载状态
  it('提交时显示加载状态', async () => {
    const wrapper = mount(LoginForm)
    
    // 填写有效表单
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('123456')
    
    // 提交表单
    wrapper.find('form').trigger('submit.prevent')
    
    // 不需要等待定时器，立即检查加载状态
    await wrapper.vm.$nextTick()
    
    // 断言：按钮应该显示加载文本
    expect(wrapper.find('button').text()).toContain('登录中')
    
    // 断言：按钮应该是禁用状态
    expect(wrapper.find('button').attributes('disabled')).toBe('')
  })
})