import { Trend, TextBaseLine, TextAlign } from '../typeof/type'

const config = {
  marginLeft: 0,
  marginRight: 60,
  marginBottom: 30,
  marginTop: 0,
  background: '#000000',
  showCrossLine: true,
  xAxis: {
    textBaseline: TextBaseLine.Top,
    textAlign: TextAlign.Center,
    strokeStyle: '#f0f6f9',
    fillStyle: '#f0f6f9',
    tickWidth: 5,
    textMargin: 5,
    scaleRatio: 0.05,
  },
  yAxis: {
    textBaseline: TextBaseLine.Middle,
    textAlign: TextAlign.Left,
    strokeStyle: '#f0f6f9',
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
}

export default config
