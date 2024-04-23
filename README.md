# ChartWS

`ChartWS` is the main component that fetches and displays BTCUSDT perpetual futures prices in real-time. It uses the Binance WebSocket API and TradingView's Lightweight Charts library to create an interactive, real-time chart.

## Features

- **Real-time Data:** The component uses the Binance WebSocket API to fetch real-time BTCUSDT perpetual futures prices.
- **Interactive Chart:** The fetched data is displayed using TradingView's Lightweight Charts library. The chart is interactive and updates in real-time as new data is received.
- **Customizable Chart Options:** The chart's appearance can be customized using the `CHART_OPTIONS` object. This includes the chart's layout, grid, crosshair, price scale, and time scale.

## Usage
Run ```npm install && npm start``` to start the application.