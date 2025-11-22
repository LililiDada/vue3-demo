// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from 'echarts/core'
import { GraphicComponent,GridComponent,LegendComponent,PolarComponent,TitleComponent,TooltipComponent } from 'echarts/components'
import { BarChart,BoxplotChart,LineChart,PieChart,RadarChart } from 'echarts/charts'
// 全局过渡动画等特性
import { UniversalTransition } from 'echarts/features'
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  GraphicComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  LineChart,
  BarChart,
  PieChart,
  BoxplotChart,
  CanvasRenderer,
  UniversalTransition,
  RadarChart,
  PolarComponent,
])


// 初始化语法糖
const draw= (dom:HTMLElement,option:Record<string,any>) => {
  const chart = echarts.init(dom)
  chart.clear()
  chart.setOption(option)
  return chart
}

export default {
  ...echarts,
  draw
}as any