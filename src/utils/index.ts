type Func = (...args:any[]) => any

/**
 * 防抖函数
 * @param { Function } func 函数
 * @param { Number } delay 防抖时间
 * @param { Boolean } immdiate 是否立即执行
 * @param { Function } resultCallback 
 * @returns 
 */
export function debounce(
  func: Func,
  delay: number = 500,
  immdiate?: boolean,
  resultCallback?: Func
) {
  let timer:null | ReturnType<typeof setTimeout> = null
  let isTnvoke = false
  const _debounce = function(this:unknown,...args:any[]) {
    return new Promise((resolve,reject)=> {
      if(timer) clearTimeout(timer);
      if(immdiate && !isTnvoke) {
        try {
          const result = func.apply(this,args) 
          if(resultCallback) resultCallback(result)
          resolve(result)
        }catch(e) {
          reject(e)
        }

        isTnvoke = true
      }else {
        timer = setTimeout(()=>{
          try{
            const result = func.apply(this,args)
            if(resultCallback) resultCallback(result)
            resolve(reject)
          }catch(e) {
            reject(e)
          }
          isTnvoke = false
          timer = null
        },delay)
      }
    })
  }

  _debounce.cancel = function() {
    if(timer) clearTimeout(timer)
    isTnvoke = false
    timer = null
  }

  return _debounce
}

/**
 * 节流函数
 * @param func 
 * @param interval 
 * @param options 
 * leading:初始 trailing:结尾
 */
export function throttle(
  func: Func,
  interval: number,
  options = {leading: false, trailing: true}
){
  let timer:null | ReturnType<typeof setTimeout> = null
  let lastTime = 0
  const {leading,trailing} = options
  const _throttle = function(this:unknown,...args:any[]) {
    const nowTime = Date.now()
    if(!lastTime && !leading) lastTime = nowTime
    const remainTime = interval - (nowTime - lastTime)

    if(remainTime <= 0) {
      if(timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = nowTime
      func.apply(this,args)
    }

    if(trailing && !timer) {
      timer = setTimeout(() => {
        lastTime = !leading ? 0 : Date.now()
        timer = null
        func.apply(this,args)
      }, remainTime);
    }
  }

  _throttle.cancel = function() {
    if(timer) clearTimeout(timer)
      timer = null
    lastTime = 0
  }

  return _throttle
}

/**
 * 驼峰转换下划线
 * @param name 
 * @returns 
 */
export function toLine(name:string) {
  return name.replace(/([A-Z])/g,'_$1').toLowerCase()
}