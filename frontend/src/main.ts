import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

// ECharts配置
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
} from 'echarts/components';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
]);

import App from './App.vue';
import router from './router';
import './assets/main.css';

const vuetify = createVuetify({
  components,
  directives,
  // 启用 Material Design 3
  theme: {
    defaultTheme: 'light',
    // 配置 MD3 主题
    themes: {
      light: {
        dark: false,
        colors: {
          // MD3 默认主色调
          primary: '#6750A4', // MD3 主色
          secondary: '#625B71', // MD3 次要色
          tertiary: '#7D5260', // MD3 第三色
          error: '#B3261E',
          surface: '#FFFBFE',
          background: '#FFFBFE',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-tertiary': '#FFFFFF',
          'on-error': '#FFFFFF',
          'surface-variant': '#E7E0EC',
          'on-surface-variant': '#49454F',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#D0BCFF', // MD3 暗色主题主色
          secondary: '#CCC2DC', // MD3 暗色主题次要色
          tertiary: '#EFB8C8', // MD3 暗色主题第三色
          error: '#F2B8B5',
          surface: '#1C1B1F',
          background: '#1C1B1F',
          'on-primary': '#381E72',
          'on-secondary': '#332D41',
          'on-tertiary': '#492532',
          'on-error': '#601410',
          'surface-variant': '#49454F',
          'on-surface-variant': '#CAC4D0',
        },
      },
    },
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

// 开发环境启用性能分析
app.config.performance = true;

// 注册ECharts全局组件
app.component('VChart', VChart);

// 挂载应用
app.mount('#app');
