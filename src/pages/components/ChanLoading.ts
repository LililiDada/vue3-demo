import {showToast, closeToast } from 'vant';
import type { ToastOptions } from 'vant';
import loading_icon from '@images/avatar.png';
import 'vant/es/toast/style';
import '@/styles/loading.less';
  
const ChanLoading = (config?: ToastOptions) => {
  showToast({
    className: 'chan-loading',
    message:'加载中...',
    icon: loading_icon,
    duration: 0,
    ...config,
  })
};
export { closeToast };
export default ChanLoading;