import yahooFinance from 'yahoo-finance2';

/**
 * Check if an NSE stock has hit its 52-week high in the last 5 trading days
 * @param {string} tickerSymbol - NSE stock symbol
 * @returns {Promise<boolean>} True if stock hit 52-week high in last 5 days
 */
async function hit52WeekHigh(tickerSymbol) {
  try {
    // Check if ticker symbol is all numeric
    if (/^\d+$/.test(tickerSymbol)) {
      tickerSymbol = `${tickerSymbol}.BO`;
    }
    else if (!tickerSymbol.endsWith('.NS')) {
      tickerSymbol = `${tickerSymbol}.NS`;
    }

    // Get end date (today) and start date (1 year ago)
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 365);

    // Get historical data
    const histData = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate
    });

    if (!histData.length) {
      return false;
    }

    // Get the last 5 trading days of data
    const last5Days = histData.slice(-5);
    
    // Calculate 52-week high
    const week52High = Math.max(...histData.map(day => day.high));

    // Check if 52-week high was hit in the last 5 days
    return last5Days.some(day => day.high >= week52High * 0.9999);

  } catch (error) {
    console.error(`Error processing ${tickerSymbol}: ${error}`);
    return false;
  }
}

/**
 * Check if an NSE stock has hit its 52-week low in the last 5 trading days
 * @param {string} tickerSymbol - NSE stock symbol
 * @returns {Promise<boolean>} True if stock hit 52-week low in last 5 days
 */
async function hit52WeekLow(tickerSymbol) {
  try {
    if (/^\d+$/.test(tickerSymbol)) {
      tickerSymbol = `${tickerSymbol}.BO`;
    }
    else if (!tickerSymbol.endsWith('.NS')) {
      tickerSymbol = `${tickerSymbol}.NS`;
    }

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 365);

    const histData = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate
    });

    if (!histData.length) {
      return false;
    }

    const last5Days = histData.slice(-5);
    const week52Low = Math.min(...histData.map(day => day.low));

    return last5Days.some(day => day.low <= week52Low * 1.0001);

  } catch (error) {
    console.error(`Error processing ${tickerSymbol}: ${error}`);
    return false;
  }
}

/**
 * Calculate RSI for a series of prices
 * @param {Array<{close: number}>} data - Array of price data
 * @param {number} period - RSI period
 * @returns {number[]} Array of RSI values
 */
function calculateRSI(data, period) {
  const changes = data.map((value, index) => 
    index === 0 ? 0 : value.close - data[index - 1].close
  );

  const gains = changes.map(change => Math.max(change, 0));
  const losses = changes.map(change => Math.abs(Math.min(change, 0)));

  // Calculate average gains and losses
  const avgGains = [];
  const avgLosses = [];
  let sumGains = 0;
  let sumLosses = 0;

  // First period
  for (let i = 0; i < period; i++) {
    sumGains += gains[i];
    sumLosses += losses[i];
  }

  avgGains.push(sumGains / period);
  avgLosses.push(sumLosses / period);

  // Rest of the periods
  for (let i = period; i < data.length; i++) {
    const avgGain = (avgGains[i - period] * (period - 1) + gains[i]) / period;
    const avgLoss = (avgLosses[i - period] * (period - 1) + losses[i]) / period;
    avgGains.push(avgGain);
    avgLosses.push(avgLoss);
  }

  // Calculate RSI
  return avgGains.map((gain, i) => {
    const rs = gain / (avgLosses[i] || 1);
    return 100 - (100 / (1 + rs));
  });
}

/**
 * Check if a stock's RSI is in overbought territory
 * @param {string} tickerSymbol - NSE stock symbol
 * @param {number} period - RSI period (default: 14)
 * @param {number} threshold - Overbought threshold (default: 70)
 * @returns {Promise<boolean>} True if RSI is overbought
 */
async function isRsiOverbought(tickerSymbol, period = 14, threshold = 70) {
  try {
    if (/^\d+$/.test(tickerSymbol)) {
      tickerSymbol = `${tickerSymbol}.BO`;
    }
    else if (!tickerSymbol.endsWith('.NS')) {
      tickerSymbol = `${tickerSymbol}.NS`;
    }

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (period * 2 + 10));

    const histData = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate
    });

    if (!histData.length) {
      return false;
    }

    const rsiValues = calculateRSI(histData, period);
    return rsiValues[rsiValues.length - 1] >= threshold;

  } catch (error) {
    console.error(`Error processing ${tickerSymbol}: ${error}`);
    return false;
  }
}

/**
 * Check if a stock's RSI is in oversold territory
 * @param {string} tickerSymbol - NSE stock symbol
 * @param {number} period - RSI period (default: 14)
 * @param {number} threshold - Oversold threshold (default: 30)
 * @returns {Promise<boolean>} True if RSI is oversold
 */
async function isRsiOversold(tickerSymbol, period = 14, threshold = 30) {
  try {
    if (/^\d+$/.test(tickerSymbol)) {
      tickerSymbol = `${tickerSymbol}.BO`;
    }
    else if (!tickerSymbol.endsWith('.NS')) {
      tickerSymbol = `${tickerSymbol}.NS`;
    }

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (period * 2 + 10));

    const histData = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate
    });

    if (!histData.length) {
      return false;
    }

    const rsiValues = calculateRSI(histData, period);
    return rsiValues[rsiValues.length - 1] <= threshold;

  } catch (error) {
    console.error(`Error processing ${tickerSymbol}: ${error}`);
    return false;
  }
}

/**
 * Calculate EMA for a series of values
 * @param {number[]} data - Array of values
 * @param {number} period - EMA period
 * @returns {number[]} Array of EMA values
 */
function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  const emaData = [data[0]];
  
  for (let i = 1; i < data.length; i++) {
    emaData.push(data[i] * k + emaData[i - 1] * (1 - k));
  }
  
  return emaData;
}

/**
 * Check if MACD line has crossed above the signal line
 * @param {string} tickerSymbol - NSE stock symbol
 * @param {number} fastPeriod - Fast EMA period (default: 12)
 * @param {number} slowPeriod - Slow EMA period (default: 26)
 * @param {number} signalPeriod - Signal line period (default: 9)
 * @returns {Promise<boolean>} True if bullish crossover occurred
 */
async function isMacdBullishCrossover(
  tickerSymbol,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) {
  try {
    if (/^\d+$/.test(tickerSymbol)) {
      tickerSymbol = `${tickerSymbol}.BO`;
    }
    else if (!tickerSymbol.endsWith('.NS')) {
      tickerSymbol = `${tickerSymbol}.NS`;
    }

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (slowPeriod * 2 + 20));

    const histData = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate
    });

    if (!histData.length) {
      return false;
    }

    const prices = histData.map(day => day.close);
    const fastEMA = calculateEMA(prices, fastPeriod);
    const slowEMA = calculateEMA(prices, slowPeriod);
    
    const macd = fastEMA.map((fast, i) => fast - slowEMA[i]);
    const signal = calculateEMA(macd, signalPeriod);

    if (macd.length >= 2 && signal.length >= 2) {
      const currentDiff = macd[macd.length - 1] - signal[signal.length - 1];
      const prevDiff = macd[macd.length - 2] - signal[signal.length - 2];
      return prevDiff < 0 && currentDiff > 0;
    }

    return false;

  } catch (error) {
    console.error(`Error processing ${tickerSymbol}: ${error}`);
    return false;
  }
}

/**
 * Check if MACD line has crossed below the signal line
 * @param {string} tickerSymbol - NSE stock symbol
 * @param {number} fastPeriod - Fast EMA period (default: 12)
 * @param {number} slowPeriod - Slow EMA period (default: 26)
 * @param {number} signalPeriod - Signal line period (default: 9)
 * @returns {Promise<boolean>} True if bearish crossover occurred
 */
async function isMacdBearishCrossover(
  tickerSymbol,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) {
  try {
    if (/^\d+$/.test(tickerSymbol)) {
      tickerSymbol = `${tickerSymbol}.BO`;
    }
    else if (!tickerSymbol.endsWith('.NS')) {
      tickerSymbol = `${tickerSymbol}.NS`;
    }

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (slowPeriod * 2 + 20));

    const histData = await yahooFinance.historical(tickerSymbol, {
      period1: startDate,
      period2: endDate
    });

    if (!histData.length) {
      return false;
    }

    const prices = histData.map(day => day.close);
    const fastEMA = calculateEMA(prices, fastPeriod);
    const slowEMA = calculateEMA(prices, slowPeriod);
    
    const macd = fastEMA.map((fast, i) => fast - slowEMA[i]);
    const signal = calculateEMA(macd, signalPeriod);

    if (macd.length >= 2 && signal.length >= 2) {
      const currentDiff = macd[macd.length - 1] - signal[signal.length - 1];
      const prevDiff = macd[macd.length - 2] - signal[signal.length - 2];
      return prevDiff > 0 && currentDiff < 0;
    }

    return false;

  } catch (error) {
    console.error(`Error processing ${tickerSymbol}: ${error}`);
    return false;
  }
}

/**
 * Get key metrics for NSE stocks
 * @param {string} tickerSymbol - NSE stock symbol
 * @returns {Promise<Object>} Object containing calculated metrics
 */
async function getStockMetrics(tickerSymbol) {
  try {
    if (/^\d+$/.test(tickerSymbol)) {
      tickerSymbol = `${tickerSymbol}.BO`;
    }
    else if (!tickerSymbol.endsWith('.NS')) {
      tickerSymbol = `${tickerSymbol}.NS`;
    }

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 365);

    const [histData, quote, info] = await Promise.all([
      yahooFinance.historical(tickerSymbol, {
        period1: startDate,
        period2: endDate
      }),
      yahooFinance.quote(tickerSymbol),
      yahooFinance.quoteSummary(tickerSymbol, {
        modules: ['price', 'financialData', 'defaultKeyStatistics', 'summaryProfile']
      })
    ]);

    if (!histData.length) {
      return { error: "No data found for the ticker symbol" };
    }

    // Calculate moving averages
    const ma200 = histData.slice(-200).reduce((sum, day) => sum + day.close, 0) / 200;
    const ma50 = histData.slice(-50).reduce((sum, day) => sum + day.close, 0) / 50;
    const currentPrice = histData[histData.length - 1].close;

    const metrics = {
      Ticker: tickerSymbol.replace('.NS', '').replace('.BO', ''),
      Last_Updated: new Date().toISOString(),

      // Price and Moving Averages
      Current_Price: Number(currentPrice.toFixed(2)),
      '200_DMA': Number(ma200.toFixed(2)),
      '50_DMA': Number(ma50.toFixed(2)),
      Price_to_200DMA: Number(((currentPrice / ma200 - 1) * 100).toFixed(2)),
      Price_to_50DMA: Number(((currentPrice / ma50 - 1) * 100).toFixed(2)),

      // Valuation Metrics
      P_E_Ratio: Number((quote.trailingPE || NaN).toFixed(2)),
      P_B_Ratio: Number((quote.priceToBook || NaN).toFixed(2)),
      // Dividend_Yield: Number(((quote.dividendYield || 0) * 100).toFixed(2)),

      // Financial Metrics
      ROE: Number(((info.financialData?.returnOnEquity || 0) * 100).toFixed(2)),

      // Sector Information
      Sector: info.summaryProfile?.sector || 'N/A',
      Industry: info.summaryProfile?.industry || 'N/A',
    };

    return metrics;

  } catch (error) {
    return { error: `An error occurred: ${error.message}` };
  }
}

// Example usage
// hit52WeekHigh('540190').then(console.log);

export {
  hit52WeekHigh,
  hit52WeekLow,
  isRsiOverbought,
  isRsiOversold,
  isMacdBullishCrossover,
  isMacdBearishCrossover,
  getStockMetrics
};