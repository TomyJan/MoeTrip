// ECharts相关类型声明
declare module 'echarts/core' {
  export const use: any
  export default use
}

declare module 'echarts/renderers' {
  export const CanvasRenderer: any
}

declare module 'echarts/charts' {
  export const LineChart: any
  export const BarChart: any
  export const PieChart: any
}

declare module 'echarts/components' {
  export const GridComponent: any
  export const TooltipComponent: any
  export const LegendComponent: any
  export const DataZoomComponent: any
  export const ToolboxComponent: any
}

declare module 'vue-echarts' {
  import { DefineComponent } from 'vue'
  const VChart: DefineComponent<any, any, any>
  export default VChart
}
