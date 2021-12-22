<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
  import resize from './mixins/resize'

  export default {
    mixins: [resize],
    props: {
      className: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '450px'
      },
      autoResize: {
        type: Boolean,
        default: true
      },
      chartData: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        chart: null
      }
    },
    watch: {
      chartData: {
        deep: true,
        handler(val) {
          this.setOptions(val)
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.initChart()
      })
    },
    beforeDestroy() {
      if (!this.chart) {
        return
      }
      this.chart.dispose()
      this.chart = null
    },
    methods: {
      initChart() {
        let echarts = require('echarts')
        this.chart = echarts.init(this.$el, 'macarons')
        this.setOptions(this.chartData)
      },
      // ,
      setOptions({ poolSizeList, activeSizeList, queueSizeList, completedTaskCountList, rejectCountList, dayList, queueRemainingCapacityList, currentLoadList } = {}) {
        this.chart.setOption({
          title: {
            text: 'Historical Data Chart'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          legend: {
            data: ['poolSize', 'activeSize', 'rejectCount', 'currentLoad']
          },
          toolbox: {
            feature: {}
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: dayList
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: 'poolSize',
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: poolSizeList
            },
            {
              name: 'activeSize',
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: activeSizeList
            },
            {
              name: 'rejectCount',
              type: 'line',
              stack: 'Total',
              color: '#f47920',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: rejectCountList
            },
            {
              name: 'currentLoad',
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              label: {
                position: 'top'
              },
              emphasis: {
                focus: 'series'
              },
              data: currentLoadList
            }

          ]
        })
      }
    }
  }
</script>
