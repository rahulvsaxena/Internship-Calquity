import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def hit_52week_high(ticker_symbol):
    """
    Check if an NSE stock has hit its 52-week high in the last 5 trading days

    Parameters:
    ticker_symbol (str): NSE stock symbol (e.g., 'RELIANCE.NS', 'TCS.NS')

    Returns:
    bool: True if stock hit 52-week high in last 5 days, False otherwise
    """
    try:
        # Append .NS if not already present
        if not ticker_symbol.endswith('.NS'):
            ticker_symbol = f"{ticker_symbol}.NS"

        # Create ticker object
        ticker = yf.Ticker(ticker_symbol)

        # Get end date (today) and start date (1 year ago)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)

        # Get historical data for the past year
        hist_data = ticker.history(start=start_date, end=end_date)

        if hist_data.empty:
            return False

        # Get the last 5 trading days of data
        last_5_days = hist_data.tail(5)

        # Calculate 52-week high
        week52_high = hist_data['High'].max()

        # Check if 52-week high was hit in the last 5 days
        # Using 0.9999 to account for small floating point differences
        return any(last_5_days['High'] >= week52_high * 0.9999)

    except Exception as e:
        print(f"Error processing {ticker_symbol}: {str(e)}")
        return False

def hit_52week_low(ticker_symbol):
    """
    Check if an NSE stock has hit its 52-week low in the last 5 trading days

    Parameters:
    ticker_symbol (str): NSE stock symbol (e.g., 'RELIANCE.NS', 'TCS.NS')

    Returns:
    bool: True if stock hit 52-week low in last 5 days, False otherwise
    """
    try:
        # Append .NS if not already present
        if not ticker_symbol.endswith('.NS'):
            ticker_symbol = f"{ticker_symbol}.NS"

        # Create ticker object
        ticker = yf.Ticker(ticker_symbol)

        # Get end date (today) and start date (1 year ago)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)

        # Get historical data for the past year
        hist_data = ticker.history(start=start_date, end=end_date)

        if hist_data.empty:
            return False

        # Get the last 5 trading days of data
        last_5_days = hist_data.tail(5)

        # Calculate 52-week low
        week52_low = hist_data['Low'].min()

        # Check if 52-week low was hit in the last 5 days
        # Using 1.0001 to account for small floating point differences
        return any(last_5_days['Low'] <= week52_low * 1.0001)

    except Exception as e:
        print(f"Error processing {ticker_symbol}: {str(e)}")
        return False

def is_rsi_overbought(ticker_symbol, period=14, threshold=70):
    """
    Check if a stock's RSI is in overbought territory (>= threshold)

    Parameters:
    ticker_symbol (str): NSE stock symbol
    period (int): RSI period (default: 14)
    threshold (float): Overbought threshold (default: 70)

    Returns:
    bool: True if RSI is overbought, False otherwise
    """
    try:
        # Append .NS if not already present
        if not ticker_symbol.endswith('.NS'):
            ticker_symbol = f"{ticker_symbol}.NS"

        # Get historical data
        ticker = yf.Ticker(ticker_symbol)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=period*2 + 10)
        df = ticker.history(start=start_date, end=end_date)

        if df.empty:
            return False

        # Calculate RSI
        df['Price_Change'] = df['Close'].diff()
        df['Gain'] = df['Price_Change'].clip(lower=0)
        df['Loss'] = -df['Price_Change'].clip(upper=0)

        avg_gain = df['Gain'].rolling(window=period, min_periods=period).mean()
        avg_loss = df['Loss'].rolling(window=period, min_periods=period).mean()

        rs = avg_gain / avg_loss
        df['RSI'] = 100 - (100 / (1 + rs))

        # Check if current RSI is overbought
        current_rsi = df['RSI'].iloc[-1]
        return current_rsi >= threshold

    except Exception as e:
        print(f"Error processing {ticker_symbol}: {str(e)}")
        return False

def is_rsi_oversold(ticker_symbol, period=14, threshold=30):
    """
    Check if a stock's RSI is in oversold territory (<= threshold)

    Parameters:
    ticker_symbol (str): NSE stock symbol
    period (int): RSI period (default: 14)
    threshold (float): Oversold threshold (default: 30)

    Returns:
    bool: True if RSI is oversold, False otherwise
    """
    try:
        # Append .NS if not already present
        if not ticker_symbol.endswith('.NS'):
            ticker_symbol = f"{ticker_symbol}.NS"

        # Get historical data
        ticker = yf.Ticker(ticker_symbol)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=period*2 + 10)
        df = ticker.history(start=start_date, end=end_date)

        if df.empty:
            return False

        # Calculate RSI
        df['Price_Change'] = df['Close'].diff()
        df['Gain'] = df['Price_Change'].clip(lower=0)
        df['Loss'] = -df['Price_Change'].clip(upper=0)

        avg_gain = df['Gain'].rolling(window=period, min_periods=period).mean()
        avg_loss = df['Loss'].rolling(window=period, min_periods=period).mean()

        rs = avg_gain / avg_loss
        df['RSI'] = 100 - (100 / (1 + rs))

        # Check if current RSI is oversold
        current_rsi = df['RSI'].iloc[-1]
        return current_rsi <= threshold

    except Exception as e:
        print(f"Error processing {ticker_symbol}: {str(e)}")
        return False

def is_macd_bullish_crossover(ticker_symbol, fast_period=12, slow_period=26, signal_period=9):
    """
    Check if MACD line has crossed above the signal line (bullish signal)

    Parameters:
    ticker_symbol (str): NSE stock symbol
    fast_period (int): Fast EMA period (default: 12)
    slow_period (int): Slow EMA period (default: 26)
    signal_period (int): Signal line period (default: 9)

    Returns:
    bool: True if bullish crossover occurred in the most recent period
    """
    try:
        # Append .NS if not already present
        if not ticker_symbol.endswith('.NS'):
            ticker_symbol = f"{ticker_symbol}.NS"

        # Get historical data
        ticker = yf.Ticker(ticker_symbol)
        end_date = datetime.now()
        # Get extra days of data to ensure accurate calculation
        start_date = end_date - timedelta(days=slow_period*2 + 20)
        df = ticker.history(start=start_date, end=end_date)

        if df.empty:
            return False

        # Calculate MACD
        exp1 = df['Close'].ewm(span=fast_period, adjust=False).mean()
        exp2 = df['Close'].ewm(span=slow_period, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=signal_period, adjust=False).mean()

        # Check for bullish crossover
        # Current MACD above signal line AND previous MACD below signal line
        if len(macd) >= 2 and len(signal) >= 2:
            current_diff = macd.iloc[-1] - signal.iloc[-1]
            prev_diff = macd.iloc[-2] - signal.iloc[-2]

            # Bullish crossover occurs when previous difference is negative
            # and current difference is positive
            return prev_diff < 0 and current_diff > 0

        return False

    except Exception as e:
        print(f"Error processing {ticker_symbol}: {str(e)}")
        return False

def is_macd_bearish_crossover(ticker_symbol, fast_period=12, slow_period=26, signal_period=9):
    """
    Check if MACD line has crossed below the signal line (bearish signal)

    Parameters:
    ticker_symbol (str): NSE stock symbol
    fast_period (int): Fast EMA period (default: 12)
    slow_period (int): Slow EMA period (default: 26)
    signal_period (int): Signal line period (default: 9)

    Returns:
    bool: True if bearish crossover occurred in the most recent period
    """
    try:
        # Append .NS if not already present
        if not ticker_symbol.endswith('.NS'):
            ticker_symbol = f"{ticker_symbol}.NS"

        # Get historical data
        ticker = yf.Ticker(ticker_symbol)
        end_date = datetime.now()
        # Get extra days of data to ensure accurate calculation
        start_date = end_date - timedelta(days=slow_period*2 + 20)
        df = ticker.history(start=start_date, end=end_date)

        if df.empty:
            return False

        # Calculate MACD
        exp1 = df['Close'].ewm(span=fast_period, adjust=False).mean()
        exp2 = df['Close'].ewm(span=slow_period, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=signal_period, adjust=False).mean()

        # Check for bearish crossover
        # Current MACD below signal line AND previous MACD above signal line
        if len(macd) >= 2 and len(signal) >= 2:
            current_diff = macd.iloc[-1] - signal.iloc[-1]
            prev_diff = macd.iloc[-2] - signal.iloc[-2]

            # Bearish crossover occurs when previous difference is positive
            # and current difference is negative
            return prev_diff > 0 and current_diff < 0

        return False

    except Exception as e:
        print(f"Error processing {ticker_symbol}: {str(e)}")
        return False

def get_stock_metrics(ticker_symbol):
    """
    Get key metrics including moving averages, valuation ratios, and fundamental data for NSE stocks

    Parameters:
    ticker_symbol (str): NSE stock symbol (e.g., 'RELIANCE', 'TCS')

    Returns:
    dict: Dictionary containing all the calculated metrics
    """
    try:
        # Append .NS if not already present
        if not ticker_symbol.endswith('.NS'):
            ticker_symbol = f"{ticker_symbol}.NS"

        # Create ticker object
        ticker = yf.Ticker(ticker_symbol)

        # Get historical data for moving averages calculation
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)  # Get 1 year of data
        hist_data = ticker.history(start=start_date, end=end_date)

        if hist_data.empty:
            return {"error": "No data found for the ticker symbol"}

        # Calculate moving averages
        dma_200 = hist_data['Close'].rolling(window=200).mean().iloc[-1]
        dma_50 = hist_data['Close'].rolling(window=50).mean().iloc[-1]
        current_price = hist_data['Close'].iloc[-1]

        # Get fundamental data
        info = ticker.info

        # Create metrics dictionary
        metrics = {
            "Ticker": ticker_symbol.replace('.NS', ''),
            "Last_Updated": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),

            # Price and Moving Averages
            "Current_Price": round(current_price, 2),
            "DMA_200": round(dma_200, 2),
            "DMA_50": round(dma_50, 2),
            "Price_to_200DMA": round((current_price/dma_200 - 1) * 100, 2),  # % above/below 200 DMA
            "Price_to_50DMA": round((current_price/dma_50 - 1) * 100, 2),    # % above/below 50 DMA

            # Valuation Metrics
            "P_E_Ratio": round(info.get('trailingPE', np.nan), 2),
            "P_B_Ratio": round(info.get('priceToBook', np.nan), 2),
            "Dividend_Yield": round(info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0, 2),

            # Financial Metrics
            "ROE": round(info.get('returnOnEquity', 0) * 100 if info.get('returnOnEquity') else np.nan, 2),

            # Sector Information
            "Sector": info.get('sector', 'N/A'),
            "Industry": info.get('industry', 'N/A'),
        }

        return metrics

    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}

