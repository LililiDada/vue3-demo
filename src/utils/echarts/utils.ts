export const useThemeValue = (styleVariable: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(styleVariable)
}

export function replaceVarStrings(obj:Record<string,any>) {
  const newObj: Record<string,any> = Array.isArray(obj) ? [] : {}
  for(const key in obj) {
    if(typeof obj[key] === 'object') {
      newObj[key] = replaceVarStrings(obj[key]) // 递归处理子对象
    }else if(typeof obj[key] === 'string' && obj[key].startsWith('var(') && obj[key].endsWith(')')){
      const varContent = obj[key].slice(4,-1) // 提取括号内的内容
      newObj[key] = useThemeValue(varContent) // 替换括号内的内容
    }else{
      newObj[key] = obj[key] // 其他情况直接复制
    }
  }
  return newObj
}