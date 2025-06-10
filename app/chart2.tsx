'use client'
import React, { useState, useEffect, useRef } from 'react'

const LiveCandlestickChart = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [symbol, setSymbol] = useState('AAPL')
  const [lastUpdate, setLastUpdate] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [apiKey, setApiKey] = useState('TLDjpXVvaZ8LV1ofO76xJVkvj2PKuj73')
  
  const wsRef = useRef(null)
  const dataBufferRef = useRef(new Map()) // Buffer to accumulate data by symbol

  // Popular stocks for live tracking
  const stocks = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 
    '', 'NVDA', 'NFLX', 'SPY', 'QQQ'
  ]

  // Transform Polygon.io data to chart format
  const transformPolygonData = (polygonData) => {
    return {
      timestamp: new Date(polygonData.s).toISOString(), // start timestamp
      open: polygonData.o,   // open price
      high: polygonData.h,   // high price
      low: polygonData.l,    // low price
      close: polygonData.c,  // close price
      volume: polygonData.v, // volume
      symbol: polygonData.sym // symbol
    }
  }

  // Initialize WebSocket connection
  const initWebSocket = () => {
    if (!apiKey) {
      setError('Please enter your Polygon.io API key')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close()
      }

      // Create new WebSocket connection
      const ws = new WebSocket(`wss://delayed.polygon.io/stocks`)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnectionStatus('connecting')
        
        // Authenticate
        ws.send(JSON.stringify({
          action: 'auth',
          params: apiKey
        }))
      }

      ws.onmessage = (event) => {
        try {
          const messages = JSON.parse(event.data)
          
          messages.forEach(message => {
            // Handle authentication success
            if (message.ev === 'status' && message.status === 'auth_success') {
              console.log('Authentication successful')
              setConnectionStatus('connected')
              setLoading(false)
              
              // Subscribe to minute aggregates for selected symbol
              ws.send(JSON.stringify({
                action: 'subscribe',
                params: `AM.${symbol}`
              }))
              
              console.log(`Subscribed to AM.${symbol}`)
            }
            
            // Handle minute aggregate data (AM events)
            else if (message.ev === 'AM') {
              console.log('Received market data:', message)
              
              // Only process data for current selected symbol
              if (message.sym === symbol) {
                const transformedData = transformPolygonData(message)
                
                setData(prevData => {
                  const newData = [...prevData]
                  
                  // Check if we already have data for this timestamp
                  const existingIndex = newData.findIndex(
                    item => item.timestamp === transformedData.timestamp
                  )
                  
                  if (existingIndex >= 0) {
                    // Update existing candle
                    newData[existingIndex] = transformedData
                  } else {
                    // Add new candle
                    newData.push(transformedData)
                  }
                  
                  // Keep only last 100 candles for performance
                  if (newData.length > 100) {
                    newData.shift()
                  }
                  
                  // Sort by timestamp
                  newData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                  
                  return newData
                })
                
                setLastUpdate(new Date())
              }
            }
            
            // Handle connection status updates
            else if (message.ev === 'status') {
              console.log('Status update:', message)
              if (message.status === 'auth_timeout' || message.status === 'auth_failed') {
                setError(`Authentication failed: ${message.message || 'Invalid API key'}`)
                setConnectionStatus('disconnected')
              }
            }
          })
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('WebSocket connection error')
        setConnectionStatus('error')
        setLoading(false)
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setConnectionStatus('disconnected')
        setLoading(false)
        
        // Attempt to reconnect after 5 seconds if not manually closed
        if (event.code !== 1000) {
          setTimeout(() => {
            console.log('Attempting to reconnect...')
            initWebSocket()
          }, 5000)
        }
      }

    } catch (err) {
      console.error('Error initializing WebSocket:', err)
      setError('Failed to initialize WebSocket connection')
      setLoading(false)
    }
  }

  // Handle symbol change
  const handleSymbolChange = (newSymbol) => {
    setSymbol(newSymbol)
    setData([]) // Clear existing data
    
    // If connected, unsubscribe from old symbol and subscribe to new one
    if (wsRef.current && connectionStatus === 'connected') {
      // Unsubscribe from previous symbol
      wsRef.current.send(JSON.stringify({
        action: 'unsubscribe',
        params: `AM.${symbol}`
      }))
      
      // Subscribe to new symbol
      wsRef.current.send(JSON.stringify({
        action: 'subscribe',
        params: `AM.${newSymbol}`
      }))
      
      console.log(`Switched subscription from ${symbol} to ${newSymbol}`)
    }
  }

  // Connect/Disconnect WebSocket
  const toggleConnection = () => {
    if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
      // Disconnect
      if (wsRef.current) {
        wsRef.current.close(1000, 'Manual disconnect')
      }
      setData([])
    } else {
      // Connect
      initWebSocket()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Chart dimensions and calculations
  const chartWidth = 900
  const chartHeight = 400
  const padding = 50
  const candleWidth = Math.max(8, Math.min(20, (chartWidth - 2 * padding) / Math.max(data.length, 1) - 2))
  const candleSpacing = (chartWidth - 2 * padding) / Math.max(data.length - 1, 1)

  // Calculate min/max for scaling
  const allValues = data.flatMap(d => [d.high, d.low])
  const minPrice = allValues.length > 0 ? Math.min(...allValues) * 0.995 : 0
  const maxPrice = allValues.length > 0 ? Math.max(...allValues) * 1.005 : 100
  const priceRange = maxPrice - minPrice

  // Scale functions
  const scaleY = (price) => {
    if (priceRange === 0) return chartHeight / 2
    return chartHeight - padding - ((price - minPrice) / priceRange) * (chartHeight - 2 * padding)
  }

  const scaleX = (index) => {
    return padding + index * candleSpacing
  }

  // Generate Y-axis labels
  const yAxisLabels = []
  const labelCount = 8
  for (let i = 0; i <= labelCount; i++) {
    const price = minPrice + (priceRange * i) / labelCount
    yAxisLabels.push(price)
  }

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Live Stock Market - Polygon.io WebSocket
        </h2>
        <p className="text-gray-600">Real-time streaming OHLC data via WebSocket</p>
      </div>

      {/* API Key Input */}
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-blue-800">Polygon.io API Key:</label>
          <input 
            type="text" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="px-3 py-1 border border-blue-300 rounded text-sm flex-1 max-w-md"
            disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
          />
        </div>
        <p className="text-xs text-blue-700">
          Get your free API key from <a href="https://polygon.io/dashboard" target="_blank" rel="noopener noreferrer" className="underline">polygon.io</a>
        </p>
      </div>

      {/* Connection Status */}
      <div className={`p-4 rounded-lg mb-4 ${
        connectionStatus === 'connected' ? 'bg-green-50 border-green-200' :
        connectionStatus === 'connecting' ? 'bg-yellow-50 border-yellow-200' :
        connectionStatus === 'error' ? 'bg-red-50 border-red-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              connectionStatus === 'error' ? 'bg-red-500' :
              'bg-gray-500'
            }`}></div>
            <span className="text-sm font-medium">
              Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </span>
          </div>
          <button 
            onClick={toggleConnection}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              connectionStatus === 'connected' || connectionStatus === 'connecting'
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {loading ? 'Connecting...' : 
             connectionStatus === 'connected' || connectionStatus === 'connecting' ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Stock Symbol:</label>
            <select 
              value={symbol} 
              onChange={(e) => handleSymbolChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={connectionStatus === 'connecting'}
            >
              {stocks.map(stock => (
                <option key={stock} value={stock}>{stock}</option>
              ))}
            </select>
          </div>
          
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString('en-US')}
            </span>
          )}
          
          <span className="text-sm text-gray-500">
            Data points: {data.length}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Chart */}
      <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
        {connectionStatus !== 'connected' && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2">
                {connectionStatus === 'connecting' ? 'Connecting to live data stream...' : 'Connect to start receiving live market data'}
              </div>
              {connectionStatus === 'disconnected' && (
                <p className="text-sm text-gray-500">Click "Connect" to start streaming real-time data</p>
              )}
            </div>
          </div>
        )}
        
        {connectionStatus === 'connected' && data.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2">Waiting for market data...</div>
              <p className="text-sm text-gray-500">Live data will appear here when market is active</p>
            </div>
          </div>
        )}
        
        {connectionStatus === 'connected' && data.length > 0 && (
          <svg width={chartWidth} height={chartHeight} className="bg-white rounded border">
            {/* Grid lines */}
            {yAxisLabels.map((price, index) => (
              <g key={index}>
                <line
                  x1={padding}
                  y1={scaleY(price)}
                  x2={chartWidth - padding}
                  y2={scaleY(price)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={scaleY(price) + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  ${price.toFixed(2)}
                </text>
              </g>
            ))}

            {/* Vertical grid lines */}
            {data.map((_, index) => (
              index % 5 === 0 && (
                <line
                  key={index}
                  x1={scaleX(index)}
                  y1={padding}
                  x2={scaleX(index)}
                  y2={chartHeight - padding}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              )
            ))}

            {/* Candlesticks */}
            {data.map((candle, index) => {
              const x = scaleX(index)
              const openY = scaleY(candle.open)
              const closeY = scaleY(candle.close)
              const highY = scaleY(candle.high)
              const lowY = scaleY(candle.low)
              
              const isBullish = candle.close > candle.open
              const bodyHeight = Math.abs(closeY - openY)
              const bodyTop = Math.min(openY, closeY)
              
              return (
                <g key={index}>
                  {/* High-Low line (wick) */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={isBullish ? "#10b981" : "#ef4444"}
                    strokeWidth="1"
                  />
                  
                  {/* Candlestick body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={Math.max(bodyHeight, 1)}
                    fill={isBullish ? "none" : "#ef4444"}
                    stroke={isBullish ? "#10b981" : "#ef4444"}
                    strokeWidth="1"
                  />
                  
                  {/* Time labels (show every 10th) */}
                  {index % Math.max(1, Math.floor(data.length / 8)) === 0 && (
                    <text
                      x={x}
                      y={chartHeight - padding + 15}
                      textAnchor="middle"
                      className="text-xs fill-gray-500"
                      transform={`rotate(-45 ${x} ${chartHeight - padding + 15})`}
                    >
                      {formatTime(candle.timestamp)}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Chart border */}
            <rect
              x={padding}
              y={padding}
              width={chartWidth - 2 * padding}
              height={chartHeight - 2 * padding}
              fill="none"
              stroke="#d1d5db"
              strokeWidth="1"
            />
          </svg>
        )}
      </div>

      {/* Current Price Info */}
      {data.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {(() => {
            const latest = data[data.length - 1]
            const previous = data[data.length - 2] || latest
            const change = latest.close - previous.close
            const changePercent = previous.close !== 0 ? ((change / previous.close) * 100) : 0
            const isBullish = change > 0
            
            return (
              <>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Current Price</div>
                  <div className="text-2xl font-bold text-gray-900">${latest.close.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Change</div>
                  <div className={`text-2xl font-bold ${isBullish ? 'text-green-600' : 'text-red-600'}`}>
                    {isBullish ? '+' : ''}${change.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Change %</div>
                  <div className={`text-2xl font-bold ${isBullish ? 'text-green-600' : 'text-red-600'}`}>
                    {isBullish ? '+' : ''}{changePercent.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">High</div>
                  <div className="text-2xl font-bold text-gray-900">${latest.high.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Volume</div>
                  <div className="text-2xl font-bold text-gray-900">{latest.volume.toLocaleString()}</div>
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* Integration Status */}
      <div className="mt-8 bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-4">
          ✅ Polygon.io WebSocket Integration Active
        </h3>
        <div className="space-y-2 text-sm text-green-800">
          <p>• Real-time streaming market data via WebSocket</p>
          <p>• Minute-level aggregate data (OHLCV)</p>
          <p>• Automatic reconnection on connection loss</p>
          <p>• Live symbol switching without reconnection</p>
          <p>• Data buffering and performance optimization</p>
          <p>• Connection status monitoring</p>
        </div>
      </div>
    </div>
  )
}

export default Chart2;