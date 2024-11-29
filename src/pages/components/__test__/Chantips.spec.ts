import {mount} from "@vue/test-utils"
import ChanTips from '../ChanTips.vue'

 describe('ChanTip',()=> {
  it('初始化props', ()=> {
    const wrapper = mount(ChanTips, {
      props: {
        content: '爱我中华'
      }
    })
    expect(wrapper.text()).toContain('爱我中华')
  })
 })