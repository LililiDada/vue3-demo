import router, {addRoutes} from '@/router';

import demo from './demo';

addRoutes([...demo]);

router.beforeEach((to) => {
  if(to?.meta?.pageTitle) {
    document.title = to?.meta?.pageTitle as string
  }
})

export default router