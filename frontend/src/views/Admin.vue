<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">管理员控制面板</h1>

        <!-- 系统数据概览 -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-card class="mb-4" color="primary" theme="dark">
              <v-card-text class="d-flex flex-column align-center">
                <div class="text-h3 mb-2">{{ stats.attractions || 0 }}</div>
                <div class="text-subtitle-1">景点数量</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="mb-4" color="success" theme="dark">
              <v-card-text class="d-flex flex-column align-center">
                <div class="text-h3 mb-2">{{ stats.users || 0 }}</div>
                <div class="text-subtitle-1">用户数量</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="mb-4" color="info" theme="dark">
              <v-card-text class="d-flex flex-column align-center">
                <div class="text-h3 mb-2">{{ stats.feedback || 0 }}</div>
                <div class="text-subtitle-1">反馈数量</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="mb-4" color="warning" theme="dark">
              <v-card-text class="d-flex flex-column align-center">
                <div class="text-h3 mb-2">{{ stats.avgScore || 0 }}</div>
                <div class="text-subtitle-1">平均评分</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 功能导航 -->
        <v-card class="mb-6" rounded="lg" elevation="1">
          <v-card-title class="text-md-h6">系统管理</v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="(item, index) in adminMenus"
                :key="index"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  :to="item.link"
                  variant="outlined"
                  class="h-100"
                  hover
                  rounded="lg"
                  elevation="0"
                >
                  <v-card-text
                    class="d-flex flex-column align-center text-center"
                  >
                    <v-icon
                      :icon="item.icon"
                      size="large"
                      color="primary"
                      class="mb-4"
                    ></v-icon>
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ item.title }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ item.description }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 数据可视化部分 -->
        <v-row>
          <!-- 最近一周访问量 -->
          <v-col cols="12" md="6">
            <v-card class="mb-4" rounded="lg" elevation="1">
              <v-card-title class="text-center text-md-h6"
                >最近一周访问量</v-card-title
              >
              <v-card-text style="height: 300px">
                <v-chart
                  :option="visitorsChartOption"
                  style="height: 100%; width: 100%"
                  :autoresize="true"
                />
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 评分分布 -->
          <v-col cols="12" md="6">
            <v-card class="mb-4" rounded="lg" elevation="1">
              <v-card-title class="text-center text-md-h6"
                >评分分布</v-card-title
              >
              <v-card-text style="height: 300px">
                <v-chart
                  :option="scoreDistributionOption"
                  style="height: 100%; width: 100%"
                  :autoresize="true"
                />
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 热门景点 -->
          <v-col cols="12">
            <v-card class="mb-4" rounded="lg" elevation="1">
              <v-card-title class="text-center text-md-h6"
                >热门景点</v-card-title
              >
              <v-card-text style="height: 300px">
                <v-chart
                  :option="topAttractionsOption"
                  style="height: 100%; width: 100%"
                  :autoresize="true"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 反馈趋势图 -->
        <v-card rounded="lg" elevation="1">
          <v-card-title class="d-flex">
            <span class="text-md-h6">反馈趋势</span>
            <v-spacer></v-spacer>
            <v-select
              v-model="timeRange"
              :items="timeRanges"
              density="comfortable"
              variant="outlined"
              bg-color="surface-variant"
              rounded="lg"
              hide-details
              class="select-md3"
              style="max-width: 150px"
            ></v-select>
          </v-card-title>

          <v-card-text>
            <v-chart
              :option="feedbackTrendOption"
              style="height: 350px"
              autoresize
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- 消息提示条 -->
  <AppSnackbar
    v-model:show="showSnackbar"
    :text="snackbarText"
    :color="snackbarColor"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useUserStore } from '../stores';
import { useRouter } from 'vue-router';
import { feedbackApi, attractionApi, adminApi } from '../utils/api';
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
import VChart from 'vue-echarts';
import dayjs from 'dayjs';
import AppSnackbar from '../components/AppSnackbar.vue';

// 注册必要的ECharts组件
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

// 定义类型接口
interface Attraction {
  id: number;
  name: string;
  description?: string;
  feedbackCount?: number;
}

interface FeedbackStats {
  totalCount: number;
  avgScore: number;
  scoreDistribution: Record<string, number>;
  withCommentCount?: number;
  withCommentPercent?: number;
}

interface AttractionStats {
  total: number;
  attractions: Attraction[];
}

const router = useRouter();
const userStore = useUserStore();
const attractionStats = ref<AttractionStats>({ total: 0, attractions: [] });
const feedbackStats = ref<FeedbackStats | null>(null);

// 添加snackbar状态
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('error');

// 检查管理员权限
onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/login');
    return;
  }

  // 加载统计数据
  loadStats();
});

// 系统统计数据
const stats = reactive({
  attractions: 0,
  users: 0,
  feedback: 0,
  avgScore: 0,
});

// 时间范围选择
const timeRange = ref('最近7天');
const timeRanges = ['最近7天', '最近30天', '最近90天', '全部'];

// 加载统计数据
const loadStats = async () => {
  try {
    // 加载系统统计数据
    const statsResult = await adminApi.getStats();
    if (statsResult.success) {
      // 更新统计数据
      if (statsResult.data && statsResult.data.data) {
        Object.assign(stats, statsResult.data.data);
      }
    } else {
      console.error('获取系统统计数据失败:', statsResult.error);
      // 显示错误消息
      snackbarText.value = `获取系统统计数据失败: ${statsResult.error}`;
      snackbarColor.value = 'error';
      showSnackbar.value = true;
    }

    // 加载景点统计数据
    const attractionResult = await attractionApi.stats();
    if (attractionResult.success) {
      // 更新景点统计数据
      if (attractionResult.data && attractionResult.data.data) {
        attractionStats.value = attractionResult.data.data;
      }
    } else {
      console.error('获取景点统计数据失败:', attractionResult.error);
      // 显示错误消息
      snackbarText.value = `获取景点统计数据失败: ${attractionResult.error}`;
      snackbarColor.value = 'error';
      showSnackbar.value = true;
    }

    // 加载反馈统计数据
    const feedbackResult = await feedbackApi.stats({});
    if (feedbackResult.success) {
      // 更新反馈统计数据
      if (feedbackResult.data && feedbackResult.data.data) {
        feedbackStats.value = feedbackResult.data.data;
      }
    } else {
      console.error('获取反馈统计数据失败:', feedbackResult.error);
      // 显示错误消息
      snackbarText.value = `获取反馈统计数据失败: ${feedbackResult.error}`;
      snackbarColor.value = 'error';
      showSnackbar.value = true;
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
    // 显示错误消息
    snackbarText.value =
      error instanceof Error ? error.message : '获取统计数据失败，请稍后再试';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  }
};

// 管理菜单项
const adminMenus = [
  {
    title: '用户管理',
    description: '查看和管理系统用户',
    icon: 'mdi-account-group',
    link: '/admin/users',
  },
  {
    title: '景点管理',
    description: '添加和编辑景点信息',
    icon: 'mdi-map-marker',
    link: '/admin/attractions',
  },
  {
    title: '反馈管理',
    description: '查看和处理用户反馈',
    icon: 'mdi-message-text',
    link: '/admin/feedback',
  },
  {
    title: '设施管理',
    description: '管理景点设施',
    icon: 'mdi-tools',
    link: '/admin/facilities',
  },
  {
    title: '票务管理',
    description: '管理门票和预定',
    icon: 'mdi-ticket',
    link: '/admin/tickets',
  },
  {
    title: '订单管理',
    description: '查看和管理用户订单',
    icon: 'mdi-cart',
    link: '/admin/orders',
  },
  {
    title: '系统设置',
    description: '配置系统参数',
    icon: 'mdi-cog',
    link: '/admin/settings',
  },
  {
    title: '数据统计',
    description: '查看系统数据报表',
    icon: 'mdi-chart-bar',
    link: '/admin/reports',
  },
  {
    title: '操作日志',
    description: '查看系统操作记录',
    icon: 'mdi-history',
    link: '/admin/logs',
  },
];

// 模拟反馈趋势数据
const generateMockData = (days = 30) => {
  const dates = [];
  const scores = [];
  const counts = [];

  // 生成指定天数的数据
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(
      date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    );

    // 模拟平均分数据 (3.5 - 5.0 之间)
    scores.push((3.5 + Math.random() * 1.5).toFixed(1));

    // 模拟反馈数量 (1-10 之间)
    counts.push(Math.floor(1 + Math.random() * 9));
  }

  return { dates, scores, counts };
};

// 添加主题配置辅助函数
const getChartThemeConfig = () => {
  // 检测是否为深色模式
  const isDarkMode = document.body.getAttribute('data-theme') === 'dark';

  return {
    // 文本颜色配置
    textStyle: {
      color: `var(--chart-text-color)`,
    },
    // 标题颜色配置
    title: {
      textStyle: {
        color: `var(--chart-title-color)`,
      },
    },
    // 图例颜色配置
    legend: {
      textStyle: {
        color: `var(--chart-text-color)`,
      },
    },
    // 坐标轴配置
    xAxis: {
      axisLine: {
        lineStyle: {
          color: `var(--chart-axis-color)`,
        },
      },
      axisLabel: {
        color: `var(--chart-axis-color)`,
      },
      splitLine: {
        lineStyle: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    yAxis: {
      axisLine: {
        lineStyle: {
          color: `var(--chart-axis-color)`,
        },
      },
      axisLabel: {
        color: `var(--chart-axis-color)`,
      },
      splitLine: {
        lineStyle: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    // 提示框配置
    tooltip: {
      backgroundColor: isDarkMode
        ? 'rgba(50, 50, 50, 0.9)'
        : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDarkMode
        ? 'rgba(70, 70, 70, 0.9)'
        : 'rgba(200, 200, 200, 0.9)',
      textStyle: {
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      },
    },
  };
};

// 反馈趋势图表配置
const feedbackTrendOption = computed(() => {
  // 根据选择的时间范围获取对应天数
  let days = 7;
  switch (timeRange.value) {
    case '最近7天':
      days = 7;
      break;
    case '最近30天':
      days = 30;
      break;
    case '最近90天':
      days = 90;
      break;
    case '全部':
      days = 180; // 默认最多显示半年数据
      break;
  }

  const { dates, scores, counts } = generateMockData(days);
  const themeConfig = getChartThemeConfig();
  const avgScore = feedbackStats.value?.avgScore || 0;

  return {
    ...themeConfig,
    tooltip: {
      ...themeConfig.tooltip,
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      ...themeConfig.legend,
      data: ['平均评分', '反馈数量'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true,
    },
    xAxis: [
      {
        ...themeConfig.xAxis,
        type: 'category',
        boundaryGap: false,
        data: dates,
      },
    ],
    yAxis: [
      {
        ...themeConfig.yAxis,
        type: 'value',
        name: '平均评分',
        min: 1,
        max: 5,
        interval: 1,
        position: 'left',
        nameTextStyle: {
          color: 'var(--chart-text-color)',
        },
      },
      {
        ...themeConfig.yAxis,
        type: 'value',
        name: '反馈数量',
        position: 'right',
        nameTextStyle: {
          color: 'var(--chart-text-color)',
        },
      },
    ],
    series: [
      {
        name: '平均评分',
        type: 'line',
        yAxisIndex: 0,
        data: scores,
        smooth: true,
        markLine: {
          silent: true,
          lineStyle: {
            color: '#42b883',
          },
          data: [
            {
              yAxis: avgScore,
              name: '当前平均分',
            },
          ],
          label: {
            formatter: `当前平均: ${avgScore}`,
          },
        },
        lineStyle: {
          width: 3,
          color: '#42b883',
        },
        itemStyle: {
          color: '#42b883',
        },
      },
      {
        name: '反馈数量',
        type: 'bar',
        yAxisIndex: 1,
        data: counts,
        itemStyle: {
          color:
            document.body.getAttribute('data-theme') === 'dark'
              ? '#546E7A'
              : '#35495e',
        },
      },
    ],
  };
});

// 生成过去7天的日期
function getLast7Days() {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push(
      date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    );
  }
  return result;
}

// 生成随机数据(用于示例)
function generateRandomData(length: number, min: number, max: number) {
  return Array.from(
    { length },
    () => Math.floor(Math.random() * (max - min + 1)) + min,
  );
}

// 访问量图表配置
const visitorsChartOption = computed(() => {
  const themeConfig = getChartThemeConfig();
  const days = getLast7Days();

  return {
    ...themeConfig,
    title: {
      ...themeConfig.title,
      text: '最近一周访问量',
      left: 'center',
    },
    tooltip: {
      ...themeConfig.tooltip,
      trigger: 'axis',
      formatter: function (params: any) {
        const date = params[0].name;
        const value = params[0].value;
        return `${date}: ${value} 人次`;
      },
    },
    xAxis: {
      ...themeConfig.xAxis,
      type: 'category',
      data: days,
    },
    yAxis: {
      ...themeConfig.yAxis,
      type: 'value',
      name: '访问量',
      nameLocation: 'end',
      nameGap: 15,
    },
    series: [
      {
        data: generateRandomData(7, 50, 200),
        type: 'line',
        smooth: true,
        name: '访问量',
        areaStyle: {
          opacity: 0.6,
          color:
            document.body.getAttribute('data-theme') === 'dark'
              ? '#4B7BEC'
              : '#4B7BEC',
        },
        itemStyle: {
          color:
            document.body.getAttribute('data-theme') === 'dark'
              ? '#4B7BEC'
              : '#4B7BEC',
        },
        lineStyle: {
          color:
            document.body.getAttribute('data-theme') === 'dark'
              ? '#4B7BEC'
              : '#4B7BEC',
        },
      },
    ],
  };
});

// 评分分布图表配置
const scoreDistributionOption = computed(() => {
  const themeConfig = getChartThemeConfig();

  if (!feedbackStats.value || !feedbackStats.value.scoreDistribution) {
    return {
      ...themeConfig,
      title: {
        ...themeConfig.title,
        text: '评分分布',
        left: 'center',
      },
      tooltip: {
        ...themeConfig.tooltip,
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        ...themeConfig.legend,
        orient: 'horizontal',
        bottom: 10,
        data: ['1星', '2星', '3星', '4星', '5星'],
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: {
            borderRadius: 10,
            borderColor:
              document.body.getAttribute('data-theme') === 'dark'
                ? '#2C2B30'
                : '#fff',
            borderWidth: 2,
          },
          label: {
            color: 'var(--chart-label-color)',
          },
          data: [
            { value: 0, name: '1星' },
            { value: 0, name: '2星' },
            { value: 0, name: '3星' },
            { value: 0, name: '4星' },
            { value: 0, name: '5星' },
          ],
        },
      ],
    };
  }

  const distribution = feedbackStats.value.scoreDistribution;
  const totalCount = feedbackStats.value.totalCount || 0;

  // 转换数据格式为饼图需要的格式
  const pieData = [
    {
      value: distribution['1'] || 0,
      name: '1星',
      percent:
        totalCount > 0
          ? (((distribution['1'] || 0) / totalCount) * 100).toFixed(1)
          : '0.0',
    },
    {
      value: distribution['2'] || 0,
      name: '2星',
      percent:
        totalCount > 0
          ? (((distribution['2'] || 0) / totalCount) * 100).toFixed(1)
          : '0.0',
    },
    {
      value: distribution['3'] || 0,
      name: '3星',
      percent:
        totalCount > 0
          ? (((distribution['3'] || 0) / totalCount) * 100).toFixed(1)
          : '0.0',
    },
    {
      value: distribution['4'] || 0,
      name: '4星',
      percent:
        totalCount > 0
          ? (((distribution['4'] || 0) / totalCount) * 100).toFixed(1)
          : '0.0',
    },
    {
      value: distribution['5'] || 0,
      name: '5星',
      percent:
        totalCount > 0
          ? (((distribution['5'] || 0) / totalCount) * 100).toFixed(1)
          : '0.0',
    },
  ];

  return {
    ...themeConfig,
    title: {
      ...themeConfig.title,
      text: '评分分布',
      left: 'center',
    },
    tooltip: {
      ...themeConfig.tooltip,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      ...themeConfig.legend,
      orient: 'horizontal',
      bottom: 10,
      data: ['1星', '2星', '3星', '4星', '5星'],
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        itemStyle: {
          borderRadius: 10,
          borderColor:
            document.body.getAttribute('data-theme') === 'dark'
              ? '#2C2B30'
              : '#fff',
          borderWidth: 2,
        },
        label: {
          formatter: '{b}: {c} ({d}%)',
          color: 'var(--chart-label-color)',
        },
        emphasis: {
          label: {
            color: 'var(--chart-label-color)',
            fontWeight: 'bold',
            fontSize: 14,
          },
        },
        data: pieData,
      },
    ],
  };
});

// 热门景点图表配置
const topAttractionsOption = computed(() => {
  const themeConfig = getChartThemeConfig();

  // 确保attractions是数组并且有数据
  const attractions = Array.isArray(attractionStats.value?.attractions)
    ? attractionStats.value.attractions.slice(0, 5)
    : [];

  // 如果没有数据，显示提示信息
  if (attractions.length === 0) {
    return {
      ...themeConfig,
      title: {
        ...themeConfig.title,
        text: '热门景点',
        left: 'center',
      },
      tooltip: {
        ...themeConfig.tooltip,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        ...themeConfig.xAxis,
        type: 'value',
      },
      yAxis: {
        ...themeConfig.yAxis,
        type: 'category',
        data: ['暂无数据'],
      },
      series: [
        {
          type: 'bar',
          data: [0],
          itemStyle: {
            color:
              document.body.getAttribute('data-theme') === 'dark'
                ? '#5C6BC0'
                : '#3949AB',
          },
        },
      ],
    };
  }

  // 安全地获取景点名称
  const names = attractions.map((a) => a?.name || `景点${a?.id || '未知'}`);

  // 安全地获取反馈数量
  const counts = attractions.map((a) => Number(a?.feedbackCount) || 0);

  return {
    ...themeConfig,
    title: {
      ...themeConfig.title,
      text: '热门景点',
      left: 'center',
    },
    tooltip: {
      ...themeConfig.tooltip,
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params: any) {
        const name = params[0].name;
        const value = params[0].value;
        const attraction = attractions.find((a) => a.name === name);
        let tooltipText = `${name}: ${value} 条反馈`;
        if (attraction && attraction.description) {
          tooltipText += `<br/>${attraction.description}`;
        }
        return tooltipText;
      },
    },
    xAxis: {
      ...themeConfig.xAxis,
      type: 'value',
      name: '反馈数量',
      nameLocation: 'end',
      nameGap: 15,
    },
    yAxis: {
      ...themeConfig.yAxis,
      type: 'category',
      data: names,
      axisLabel: {
        ...themeConfig.yAxis.axisLabel,
        formatter: function (value: string) {
          // 景点名称可能很长，截断显示
          if (value.length > 10) {
            return value.substring(0, 10) + '...';
          }
          return value;
        },
      },
    },
    series: [
      {
        type: 'bar',
        data: counts,
        itemStyle: {
          color:
            document.body.getAttribute('data-theme') === 'dark'
              ? '#5C6BC0'
              : '#3949AB',
        },
        // 设置最小宽度，避免数据太少时条形过窄
        barWidth: '40%',
      },
    ],
  };
});
</script>

<style scoped>
.v-card {
  overflow: hidden;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  border: 1px solid var(--card-border);
  background: var(--md-surface);
}

.v-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

/* 嵌套卡片样式 */
.v-card .v-card {
  /* 内部卡片使用略微不同的背景色，增强对比度 */
  background: var(--md-surface-variant);
  border: 1px solid var(--card-border);
}

.v-card[variant='outlined'] {
  background: var(--md-background);
  border: 1px dashed var(--card-border);
}

.v-card[variant='outlined']:hover {
  background: var(--md-surface-variant);
  border: 1px solid var(--card-border);
}

.select-md3 :deep(.v-field__outline) {
  opacity: 0.8;
}

.select-md3 :deep(.v-field--focused .v-field__outline) {
  opacity: 1;
}
</style>
