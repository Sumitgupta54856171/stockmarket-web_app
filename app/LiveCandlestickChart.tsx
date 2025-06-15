'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'

const HistoricalCandlestickChart = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [symbol, setSymbol] = useState('AAPL')
  const [lastFetchTime, setLastFetchTime] = useState(null)
  const [fetchStatus, setFetchStatus] = useState('idle') // 'idle', 'fetching', 'success', 'error'
  // IMPORTANT: For security, use environment variables in production (e.g., process.env.NEXT_PUBLIC_POLYGON_API_KEY)
  const [apiKey, setApiKey] = useState('TLDjpXVvaZ8LV1ofO76xJVkvj2PKuj73') // Initialize as empty for user input

  // Default dates: last 30 days
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  // Format date to YYYY-MM-DD for input fields
  const formatDate = (date) => date.toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(formatDate(thirtyDaysAgo))
  const [endDate, setEndDate] = useState(formatDate(today))

  // Popular stocks for historical data
  const stocks = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 
    'META', 'NVDA', 'NFLX', 'SPY', 'QQQ'
  ]

  /**
   * Transforms raw Polygon.io aggregate data (from REST API) into a consistent format
   * suitable for charting.
   * @param {object} polygonResult - A single aggregate result object (e.g., {c, h, l, o, t, v}).
   * @param {string} currentSymbol - The stock symbol for this aggregate.
   * @returns {object} Transformed data with timestamp, open, high, low, close, volume, and symbol.
   */
  const transformPolygonData = (polygonResult, currentSymbol) => {
    return {
      timestamp: new Date(polygonResult.t).toISOString(), // Unix millisecond timestamp (t) to ISO string
      open: polygonResult.o,    // open price
      high: polygonResult.h,    // high price
      low: polygonResult.l,     // low price
      close: polygonResult.c,   // close price
      volume: polygonResult.v, // volume
      symbol: currentSymbol    // symbol
    }
  }

  /**
   * Fetches historical aggregate data from Polygon.io REST API.
   * Uses useCallback to memoize the function, preventing unnecessary re-creations.
   */
  const fetchHistoricalData = useCallback(async () => {
    if (!apiKey) {
      setError('Please enter your Polygon.io API key to fetch data.')
      setFetchStatus('error')
      setData([])
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
        setError('Start date cannot be after end date.');
        setFetchStatus('error');
        setData([]);
        return;
    }

    setLoading(true)
    setError(null)
    setFetchStatus('fetching')
    setData([]) // Clear previous data

    try {
      // Construct the API URL for daily aggregates
      // Multiplier: 1, Timespan: day, Adjusted: true, Sort: asc, Limit: 50000 (Polygon default is 120, max is 50000)
      const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`

      const response = await fetch(apiUrl)
      if (!response.ok) {
        // Attempt to parse error message from response body
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP error! Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const rawData = await response.json()

      if (rawData.results && rawData.results.length > 0) {
        // Transform and sort the fetched data
        const transformed = rawData.results
          .map(result => transformPolygonData(result, rawData.ticker))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

        setData(transformed)
        setFetchStatus('success')
        setLastFetchTime(new Date())
        console.log('Fetched historical data:', transformed)
      } else {
        setData([])
        setFetchStatus('idle') // No data found, revert to idle or a specific 'no-data' status
        setError('No historical data found for the selected symbol and date range.')
        console.warn('No historical data found.')
      }
    } catch (err) {
      console.error('Error fetching historical data:', err)
      setError(`Failed to fetch data: ${err.message}. Please check your API key and date range.`)
      setFetchStatus('error')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [apiKey, symbol, startDate, endDate]) // Dependencies for useCallback

  // Effect to fetch data when symbol, dates, or API key changes
  useEffect(() => {
    fetchHistoricalData()
  }, [fetchHistoricalData]) // Depend on memoized fetchHistoricalData

  // Chart dimensions and calculations
  const chartWidth = 900
  const chartHeight = 400
  const padding = 50
  // Dynamically calculate candle width and spacing based on number of data points
  // Ensure a minimum width for visibility, but don't let them overlap too much
  const candleWidth = Math.max(4, Math.min(20, (chartWidth - 2 * padding) / (data.length || 1) - 2))
  const candleSpacing = data.length > 1 ? (chartWidth - 2 * padding - candleWidth) / (data.length - 1) : 0;


  // Calculate min/max price for Y-axis scaling to fit data within chart
  const allValues = data.flatMap(d => [d.high, d.low])
  const minPrice = allValues.length > 0 ? Math.min(...allValues) * 0.99 : 0 // 1% buffer below min
  const maxPrice = allValues.length > 0 ? Math.max(...allValues) * 1.01 : 100 // 1% buffer above max
  const priceRange = maxPrice - minPrice

  // Scale function to map price values to Y-axis coordinates
  const scaleY = (price:number) => {
    if (priceRange === 0) return chartHeight / 2 // Prevent division by zero, center price
    return chartHeight - padding - ((price - minPrice) / priceRange) * (chartHeight - 2 * padding)
  }

  // Scale function to map data index to X-axis coordinates
  const scaleX = (index:number) => {
    return padding + index * (candleWidth + candleSpacing) + candleWidth / 2;
  };

  // Generate Y-axis labels for readability
  const yAxisLabels = []
  const labelCount = 8 // Number of labels to display
  for (let i = 0; i <= labelCount; i++) {
    const price = minPrice + (priceRange * i) / labelCount
    yAxisLabels.push(price)
  }

  // Helper function to format timestamp for X-axis labels (shows Month/Day)
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-100 font-sans antialiased">
      {/* Header Section */}
      <div className="mb-6 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
          Historical Stock Candlestick Chart
        </h2>
        <p className="text-lg text-gray-700">Daily market data via Polygon.io REST API</p>
      </div>
       
      {/* Data Load Status & Fetch Control */}
      <div className={`p-5 rounded-xl shadow-md mb-6 border ${
        fetchStatus === 'success' ? 'bg-green-100 border-green-300' :
        fetchStatus === 'fetching' ? 'bg-yellow-100 border-yellow-300' :
        fetchStatus === 'error' ? 'bg-red-100 border-red-300' :
        'bg-gray-100 border-gray-300'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${
              fetchStatus === 'success' ? 'bg-green-600' :
              fetchStatus === 'fetching' ? 'bg-yellow-600 animate-pulse' :
              fetchStatus === 'error' ? 'bg-red-600' :
              'bg-gray-500'
            }`}></div>
            <span className="text-lg font-semibold text-gray-800">
              Status: <span className={
                fetchStatus === 'success' ? 'text-green-700' :
                fetchStatus === 'fetching' ? 'text-yellow-700' :
                fetchStatus === 'error' ? 'text-red-700' :
                'text-gray-700'
              }>
                {loading ? 'Fetching...' : fetchStatus.charAt(0).toUpperCase() + fetchStatus.slice(1)}
              </span>
            </span>
          </div>
          
        </div>
      </div>

      {/* Controls: Symbol, Start Date, End Date */}
      <div className="bg-gray-100 p-5 rounded-xl shadow-md mb-6 border border-gray-300">
        <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <label htmlFor="stockSymbol" className="text-base font-semibold text-gray-700">Stock Symbol:</label>
            <select 
              id="stockSymbol"
              value={symbol} 
              onChange={(e) => setSymbol(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200"
              disabled={loading}
            >
              {stocks.map(stock => (
                <option key={stock} value={stock}>{stock}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <label htmlFor="startDate" className="text-base font-semibold text-gray-700">Start Date:</label>
            <input 
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="endDate" className="text-base font-semibold text-gray-700">End Date:</label>
            <input 
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200"
              disabled={loading}
            />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            {lastFetchTime && (
              <span className="font-medium">
                Last Fetched: <span className="font-bold">{lastFetchTime.toLocaleTimeString('en-US')}</span>
              </span>
            )}
            <span className="font-medium">
              Data points: <span className="font-bold">{data.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-xl mb-6 shadow-md" role="alert">
          <p className="font-bold text-lg mb-1">Error:</p>
          <p className="text-base">{error}</p>
        </div>
      )}

      {/* Chart Container */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-x-auto min-h-[450px] flex items-center justify-center">
        {loading && (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center p-6">
              <div className="text-2xl font-semibold text-gray-600 mb-3">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-t-4 border-blue-500 rounded-full border-t-transparent mr-3"></div>
                Fetching historical data...
              </div>
              <p className="text-base text-gray-500">Please wait while we retrieve the market data.</p>
            </div>
          </div>
        )}
        
        {!loading && data.length === 0 && fetchStatus !== 'error' && (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center p-6">
              <div className="text-2xl font-semibold text-gray-600 mb-3">No data to display</div>
              <p className="text-base text-gray-500">
                Enter your API key, select a stock symbol and date range, then click "Fetch Historical Data".
              </p>
            </div>
          </div>
        )}
        
        {!loading && data.length > 0 && (
          <svg width={chartWidth} height={chartHeight} className="bg-white rounded-lg border border-gray-300 shadow-inner">
            {/* Horizontal Grid lines and Y-axis labels */}
            {yAxisLabels.map((price, index) => (
              <g key={`y-label-${index}`}>
                <line
                  x1={padding}
                  y1={scaleY(price)}
                  x2={chartWidth - padding}
                  y2={scaleY(price)}
                  stroke="#e5e7eb" // Light gray for grid lines
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={scaleY(price) + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500 font-medium"
                >
                  ${price.toFixed(2)}
                </text>
              </g>
            ))}

            {/* Vertical grid lines (less frequent for readability) */}
            {data.map((_, index) => (
              // Show a vertical grid line every N candles, or adjust based on data density
              index % Math.max(1, Math.floor(data.length / 10)) === 0 && (
                <line
                  key={`x-grid-${index}`}
                  x1={scaleX(index)}
                  y1={padding}
                  x2={scaleX(index)}
                  y2={chartHeight - padding}
                  stroke="#f3f4f6" // Even lighter gray for vertical lines
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
              
              const isBullish = candle.close > candle.open // Green candle if close > open
              const bodyHeight = Math.abs(closeY - openY) // Height of the candle body
              const bodyTop = Math.min(openY, closeY) // Top-most point of the candle body

              return (
                <g key={`candle-${index}`}>
                  {/* High-Low line (wick) */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={isBullish ? "#10b981" : "#ef4444"} // Green for bullish, red for bearish
                    strokeWidth="1.5"
                  />
                  
                  {/* Candlestick body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={Math.max(bodyHeight, 1)} // Ensure minimum height for flat candles
                    fill={isBullish ? "#10b981" : "#ef4444"} // Solid fill for bullish, solid for bearish
                    stroke={isBullish ? "#10b981" : "#ef4444"}
                    strokeWidth="1"
                  />
                  
                  {/* Date labels (show every few candles, rotated for space) */}
                  {index % Math.max(1, Math.floor(data.length / 8)) === 0 && (
                    <text
                      x={x}
                      y={chartHeight - padding + 20} // Position below chart area
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                      transform={`rotate(45 ${x} ${chartHeight - padding + 20})`} // Rotate for better fit
                    >
                      {formatTime(candle.timestamp)}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Chart inner border to define drawing area */}
            <rect
              x={padding}
              y={padding}
              width={chartWidth - 2 * padding}
              height={chartHeight - 2 * padding}
              fill="none"
              stroke="#d1d5db" // Border color
              strokeWidth="1"
            />
          </svg>
        )}
      </div>

      {/* Current Price Info Cards (now showing latest fetched data) */}
      {data.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap- h-60">
          {(() => {
            const latest = data[data.length - 1]
            const previous = data[data.length - 2] || latest // Fallback to latest if only one data point
            const change = latest.close - previous.close
            const changePercent = previous.close !== 0 ? ((change / previous.close) * 100) : 0
            const isBullish = change > 0 // Determines color for change values
            
            return (
              <>
              <div className='flex flex-row m-5 py-9 gap-6  '>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
                  <div className="text-sm text-gray-600 mb-1">Latest Close</div>
                  <div className="text-3xl font-extrabold text-gray-900">${latest.close.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
                  <div className="text-sm text-gray-600 mb-1">Change (Prev Day)</div>
                  <div className={`text-3xl font-extrabold ${isBullish ? 'text-green-600' : 'text-red-600'}`}>
                    {isBullish ? '+' : ''}${change.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
                  <div className="text-sm text-gray-600 mb-1">Change % (Prev Day)</div>
                  <div className={`text-3xl font-extrabold ${isBullish ? 'text-green-600' : 'text-red-600'}`}>
                    {isBullish ? '+' : ''}{changePercent.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
                  <div className="text-sm text-gray-600 mb-1">High (Latest Day)</div>
                  <div className="text-3xl font-extrabold text-gray-900">${latest.high.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
                  <div className="text-sm text-gray-600 mb-1">Volume (Latest Day)</div>
                  <div className="text-3xl font-extrabold text-gray-900">{latest.volume.toLocaleString()}</div>
                </div>
                </div>
              </>
            )
          })()}
        </div>
      )}

    
      
    </div>
  )
}

export default HistoricalCandlestickChart
