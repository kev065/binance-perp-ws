import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import useWebSocket from 'react-use-websocket';

const CHART_OPTIONS = {
  width: 800,
  height: 600,
  layout: {
    backgroundColor: '#ffffff',
    textColor: 'rgba(33, 56, 77, 1)',
  },
  grid: {
    horzLines: {
      color: '#F0F3FA',
    },
    vertLines: {
      color: '#F0F3FA',
    },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
  priceScale: {
    position: 'right',
    mode: 1,
    autoScale: true,
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
    timezone: 'UTC',
  },
};

const INTERVALS = {
  '1m': 'wss://fstream.binance.com/ws/btcusdt@kline_1m',
  '3m': 'wss://fstream.binance.com/ws/btcusdt@kline_3m',
  '5m': 'wss://fstream.binance.com/ws/btcusdt@kline_5m',
  '15m': 'wss://fstream.binance.com/ws/btcusdt@kline_15m',
  '1h': 'wss://fstream.binance.com/ws/btcusdt@kline_1h',
};

const INTERVAL_DURATIONS = {
  '1m': 60 * 1000,
  '3m': 3 * 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
};

function ChartWS() {
  const [interval, setInterval] = useState('1m');
  const chartContainerRef = useRef();
  const chart = useRef();
  const series = useRef();
  const { lastMessage } = useWebSocket(INTERVALS[interval]);

  const currentCandleStart = useRef(null);
  const currentCandle = useRef(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      // Remove the existing chart and series before creating a new one
      if (chart.current) {
        chart.current.remove();
        chart.current = null;
        series.current = null;
      }
  
      chart.current = createChart(chartContainerRef.current, CHART_OPTIONS);
      series.current = chart.current.addCandlestickSeries();
    }
  }, [interval]); // Added interval as a dependency

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      const kline = data.k;
      const tradeTime = kline.t;
      const open = parseFloat(kline.o);
      const high = parseFloat(kline.h);
      const low = parseFloat(kline.l);
      const close = parseFloat(kline.c);
  
      if (currentCandle.current === null || tradeTime - currentCandleStart.current >= INTERVAL_DURATIONS[interval]) {
        // Start a new candle
        if (currentCandle.current !== null) {
          series.current.update(currentCandle.current);
        }
        currentCandleStart.current = tradeTime;
        currentCandle.current = {
          time: Math.floor(tradeTime / 1000),
          open: open,
          high: high,
          low: low,
          close: close,
        };
      } else {
        // Update the current candle
        currentCandle.current.high = Math.max(currentCandle.current.high, high);
        currentCandle.current.low = Math.min(currentCandle.current.low, low);
        currentCandle.current.close = close;
      }
      // Update the chart with the current candle data
      series.current.update(currentCandle.current);
    }
  }, [lastMessage, interval]);

  return (
    <div>
      {Object.keys(INTERVALS).map((intervalKey) => (
        <button key={intervalKey} onClick={() => setInterval(intervalKey)}>
          {intervalKey}
        </button>
      ))}
      <div ref={chartContainerRef} />
    </div>
  );
}

export default ChartWS;
