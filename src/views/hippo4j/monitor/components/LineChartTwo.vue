<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import resize from './mixins/resize';

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart',
    },
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '450px',
    },
    autoResize: {
      type: Boolean,
      default: true,
    },
    chartData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val);
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    initChart() {
      let echarts = require('echarts');
      this.chart = echarts.init(this.$el, 'macarons');
      this.setOptions(this.chartData);
    },
    setOptions({
      poolSizeList,
      activeSizeList,
      queueSizeList,
      completedTaskCountList,
      rejectCountList,
      dayList,
      queueRemainingCapacityList,
      queueCapacityList,
    } = {}) {
      this.chart.setOption({
        title: {
          text: 'Historical Data Chart',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        legend: {
          data: ['queueSize', 'queueRemainingCapacity', 'queueCapacity', 'completedTaskCount'],
        },
        toolbox: {
          feature: {},
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: dayList,
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            name: 'queueSize',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            label: {
              position: 'top',
            },
            emphasis: {
              focus: 'series',
            },
            data: queueSizeList,
          },
          {
            name: 'queueRemainingCapacity',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series',
            },
            data: queueRemainingCapacityList,
          },
          {
            name: 'queueCapacity',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series',
            },
            data: queueCapacityList,
          },
          {
            name: 'completedTaskCount',
            type: 'line',
            stack: 'Total',
            areaStyle: {},

            emphasis: {
              focus: 'series',
            },
            data: completedTaskCountList,
          },
        ],
      });
    },
  },
};
</script>
