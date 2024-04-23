import React, { useEffect, useRef } from 'react';
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

const SOCKET_URL = 'wss://fstream.binance.com/ws/btcusdt@kline_1m';

function ChartWS() {
  const chartContainerRef = useRef();
  const chart = useRef();
  const series = useRef();
  const { lastMessage, readyState } = useWebSocket(SOCKET_URL);

  const isConnected = readyState === WebSocket.OPEN;

  const INTERVAL = 60 * 1000; // 1 minute in milliseconds
  const currentCandleStart = useRef(null);
  const currentCandle = useRef(null);

  useEffect(() => {
    if (isConnected) {
      chart.current = createChart(chartContainerRef.current, CHART_OPTIONS);
      series.current = chart.current.addCandlestickSeries();
    }
  }, [isConnected]);

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      const kline = data.k;
      const tradeTime = kline.t;
      const open = parseFloat(kline.o);
      const high = parseFloat(kline.h);
      const low = parseFloat(kline.l);
      const close = parseFloat(kline.c);
  
      if (currentCandle.current === null || tradeTime - currentCandleStart.current >= INTERVAL) {
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
  }, [lastMessage, INTERVAL]);

  return (
    <div ref={chartContainerRef} />
  );
}

export default ChartWS;
