import { Trend, TextBaseLine, TextAlign, ColorMap } from '../typeof/type'
// import { Trend, TextBaseLine, TextAlign, ColorMap } from '../typeof/type'

const config = {
  margin: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  background: ColorMap.Black,
  xAxis: {
    height: 40,
    textBaseline: TextBaseLine.Bottom,
    textAlign: TextAlign.Center,
    strokeStyle: '#242424',
    fillStyle: '#f0f6f9',
    tickColor: ColorMap.White,
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
    tickColor: ColorMap.White,
    tickWidth: 5,
    textMargin: 5,
    scaleRatio: 0.06,
  },
  crossHair: {
    show: true,
    lineColor: ColorMap.White,
    labelBackground: ColorMap.Gray,
    xLabelColor: ColorMap.White,
    yLabelColor: ColorMap.White,
  },
  candlestick: {
    barWeight: 0.4,
    [Trend.Up]: {
      fillStyle: ColorMap.CandleGreen,
      strokeStyle: ColorMap.CandleGreen,
      lineWidth: 1,
    },
    [Trend.Down]: {
      fillStyle: ColorMap.CandleRed,
      strokeStyle: ColorMap.CandleRed,
      lineWidth: 1,
    },
    grid: {
      strokeStyle: ColorMap.Gray,
      lineWidth: 1,
    },
  },
  timeline: {
    height: 80,
    timeAxisHeight: 30,
    textBaseline: TextBaseLine.Bottom,
    textAlign: TextAlign.Center,
    borderColor: '#474747',
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    sliderColor: 'rgba(54, 61, 82, 0.6)',
    trenLineColor: ColorMap.White,
    tickColor: ColorMap.White,
    tickMarkColor: ColorMap.White,
    tickWidth: 5,
    textMargin: 5,
  },
  indicators: [],
}

export default config
