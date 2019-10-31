import { Trend, TextBaseLine, TextAlign } from '../typeof/type'

const config = {
  marginLeft: 0,
  marginRight: 0,
  marginBottom: 0,
  marginTop: 0,
  background: '#000000',
  showCrossLine: true,
  barWeight: 0.3,
  xAxis: {
    height: 40,
    textBaseline: TextBaseLine.Bottom,
    textAlign: TextAlign.Center,
    strokeStyle: '#242424',
    fillStyle: '#f0f6f9',
    tickColor: '#ffffff',
    tickWidth: 5,
    textMargin: 5,
    scaleRatio: 0.08,
  },
  yAxis: {
    width: 60,
    textBaseline: TextBaseLine.Middle,
    textAlign: TextAlign.Left,
    strokeStyle: '#242424',
    fillStyle: '#f0f6f9',
    tickWidth: 5,
    textMargin: 5,
    scaleRatio: 0.04,
  },
  grid: {
    strokeStyle: '#242424',
    lineWidth: 1,
  },
  crossLine: {
    strokeStyle: '#ffffff',
    fillStyle: '#ffffff',
    background: '#2d2d2d',
    xLabelColor: '#ffffff',
    yLabelColor: '#ffffff',
  },
  candlestick: {
    [Trend.Up]: {
      fillStyle: '#940505',
      strokeStyle: '#c60606',
      lineWidth: 1,
    },
    [Trend.Down]: {
      fillStyle: '#00c582',
      strokeStyle: '#00c582',
      lineWidth: 1,
    },
  },
  timeline: {
    height: 100,
    timeAxisHeight: 30,
    textBaseline: TextBaseLine.Bottom,
    textAlign: TextAlign.Center,
    borderColor: '#474747',
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    sliderColor: 'rgba(54, 61, 82, 0.6)',
    trenLineColor: '#ffffff',
    tickColor: '#ffffff',
    tickMarkColor: '#ffffff',
    tickWidth: 5,
    textMargin: 5,
  },
}

export default config
