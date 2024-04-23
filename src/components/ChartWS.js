import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import useWebSocket from 'react-use-websocket';

const CHART_OPTIONS = {
  width: 800,
  height: 600,
  layout: {
    backgroundColor: '#000',
    textColor: 'rgba(255, 255, 255, 0.9)',
  },
  grid: {
    vertLines: {
      color: 'rgba(197, 203, 206, 0.5)',
    },
    horzLines: {
      color: 'rgba(197, 203, 206, 0.5)',
    },
  },
  crosshair: {
    mode: 1,
  },
  rightPriceScale: {
    borderColor: 'rgba(197, 203, 206, 0.8)',
  },
  timeScale: {
    borderColor: 'rgba(197, 203, 206, 0.8)',
  },
};

const SOCKET_URL = 'wss://fstream.binance.com/ws/btcusdt@kline_1m';

function ChartWS() {
  const chartContainerRef = useRef();
  const chart = useRef();
  const series = useRef();
  const { lastMessage } = useWebSocket(SOCKET_URL);

  const INTERVAL = 60 * 1000; // 1 minute in milliseconds
  const currentCandleStart = useRef(null);
  const currentCandle = useRef(null);

  useEffect(() => {
    chart.current = createChart(chartContainerRef.current, CHART_OPTIONS);
    series.current = chart.current.addCandlestickSeries();
  }, []);

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
