export const useTheme = () => {
  const htmlDom = document.querySelector('html')
  if(!htmlDom) return{ isDark: ref(false)}

  const isDark = ref(!!htmlDom.classList.contains('dark'))

  // 创建mutationObserver实例
  const observer = new MutationObserver((mutationsList) => {
    for(const mutation of mutationsList) {
      if(mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const currentClass = (mutation.target as any).className
        isDark.value = currentClass.includes('dark')
      }
    }
  })

  // 配置MutationObserver监听的选项
  const observerOptions = {
    attributes: true,
    attributeFilter: ['class'],
  }

  // 开始监听目标节点
  observer.observe(htmlDom,observerOptions)

  return {
    isDark
  }
}
