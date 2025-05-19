import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

// 引入dayjs及其中文支持
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 设置dayjs为中文
dayjs.locale('zh-cn');

// 引入vuetify的中文语言包
import { zhHans } from 'vuetify/locale';

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

// 获取初始主题
let initialTheme = 'light';
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('themeMode');
  if (savedTheme === 'dark') {
    initialTheme = 'dark';
  } else if (savedTheme === 'system') {
    initialTheme =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  }
}

const vuetify = createVuetify({
  components,
  directives,
  // Material Design 3 主题配置
  theme: {
    defaultTheme: initialTheme,
    themes: {
      light: {
        dark: false,
        colors: {
          // Material Design 3 官方浅色主题调色板
          primary: '#6750A4', // MD3 Primary
          'on-primary': '#FFFFFF',
          'primary-container': '#EADDFF',
          'on-primary-container': '#21005E',

          secondary: '#625B71', // MD3 Secondary
          'on-secondary': '#FFFFFF',
          'secondary-container': '#E8DEF8',
          'on-secondary-container': '#1E192B',

          tertiary: '#7D5260', // MD3 Tertiary
          'on-tertiary': '#FFFFFF',
          'tertiary-container': '#FFD8E4',
          'on-tertiary-container': '#370B1E',

          error: '#B3261E', // MD3 Error
          'on-error': '#FFFFFF',
          'error-container': '#F9DEDC',
          'on-error-container': '#410E0B',

          surface: '#FFFBFE', // MD3 Surface
          'on-surface': '#1C1B1F',
          'surface-variant': '#E7E0EC',
          'on-surface-variant': '#49454F',

          outline: '#79747E', // MD3 Outline
          'outline-variant': '#CAC4D0',

          background: '#F6F2FA', // MD3 Background
          'on-background': '#1C1B1F',

          // MD3 表面色调
          'surface-1': '#F4EFF4',
          'surface-2': '#E9E3EA',
          'surface-3': '#DED7E0',
          'surface-4': '#D3CCD6',
          'surface-5': '#C8C1CB',
        },
      },
      dark: {
        dark: true,
        colors: {
          // Material Design 3 官方深色主题调色板
          primary: '#D0BCFF', // MD3 Primary (dark)
          'on-primary': '#381E72',
          'primary-container': '#4F378B',
          'on-primary-container': '#EADDFF',

          secondary: '#CCC2DC', // MD3 Secondary (dark)
          'on-secondary': '#332D41',
          'secondary-container': '#4A4458',
          'on-secondary-container': '#E8DEF8',

          tertiary: '#EFB8C8', // MD3 Tertiary (dark)
          'on-tertiary': '#492532',
          'tertiary-container': '#633B48',
          'on-tertiary-container': '#FFD8E4',

          error: '#F2B8B5', // MD3 Error (dark)
          'on-error': '#601410',
          'error-container': '#8C1D18',
          'on-error-container': '#F9DEDC',

          surface: '#1C1B1F', // MD3 Surface (dark)
          'on-surface': '#E6E1E5',
          'surface-variant': '#49454F',
          'on-surface-variant': '#CAC4D0',

          outline: '#938F99', // MD3 Outline (dark)
          'outline-variant': '#444746',

          background: '#141218', // MD3 Background (dark)
          'on-background': '#E6E1E5',

          // MD3 表面色调 (dark)
          'surface-1': '#252329',
          'surface-2': '#2F2B33',
          'surface-3': '#39343D',
          'surface-4': '#423D47',
          'surface-5': '#4C4651',
        },
      },
    },
  },
  // 设置Vuetify的全局语言为中文
  locale: {
    locale: 'zhHans',
    messages: { zhHans },
  },
  // 配置全局默认字体
  defaults: {
    global: {
      ripple: true,
    },
    VBtn: {
      fontFamily: 'MiSans, Roboto, sans-serif',
    },
    VTextField: {
      fontFamily: 'MiSans, Roboto, sans-serif',
    },
    VCard: {
      fontFamily: 'MiSans, Roboto, sans-serif',
    },
    VList: {
      fontFamily: 'MiSans, Roboto, sans-serif',
    },
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(vuetify);

// 开发环境启用性能分析
app.config.performance = true;

// 注册ECharts全局组件
app.component('VChart', VChart);

// 挂载应用
app.mount('#app');
