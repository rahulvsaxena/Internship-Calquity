from typing import List, TypedDict
from datetime import datetime, timedelta
import yfinance as yf
from supabase import create_client, Client
import pandas as pd

class NewsItem(TypedDict):
    sentiment: str
    link: str
    text: str

class KeyMetrics(TypedDict, total=False):
    peRatio: str
    marketCap: str
    volume: str
    dividend: str

class Company(TypedDict, total=False):
    name: str
    symbol: str
    icon: str
    weeklyClose: str
    weeklyChange: str
    ytdChange: str
    keyMetrics: KeyMetrics
    news: List[NewsItem]
    blockDeals: List[str]
    analystUpdates: List[str]

class Header(TypedDict):
    title: str
    date: str
    logo: str

class Config(TypedDict):
    header: Header
    companies: List[Company]

def get_financial_config(email_id: str, supabase_url: str, supabase_key: str) -> Config:
    # Initialize Supabase client
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Get current date and format week ending date
    current_date = datetime.now()
    week_ending = (current_date + timedelta(days=(5 - current_date.weekday()))).strftime("%dth %b %Y")
    
    # Create header
    header: Header = {
        "title": "Weekly Financial Update",
        "date": f"Week ended {week_ending}",
        "logo": """
<svg id="Layer_29" data-name="Layer 29" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 595.28 595.28" width="70" height="70">
  <defs>
    <style>
      .cls-1 {
        filter: url(#drop-shadow-2);
      }

      .cls-1, .cls-2 {
        fill: none;
        stroke: #fff;
        stroke-linejoin: round;
        stroke-width: 15px;
      }

      .cls-2 {
        filter: url(#drop-shadow-1);
      }
    </style>
    <filter id="drop-shadow-1" filterUnits="userSpaceOnUse">
      <feOffset dx="7" dy="7"/>
      <feGaussianBlur result="blur" stdDeviation="2.83"/>
      <feFlood flood-color="#000" flood-opacity=".75"/>
      <feComposite in2="blur" operator="in"/>
      <feComposite in="SourceGraphic"/>
    </filter>
    <filter id="drop-shadow-2" filterUnits="userSpaceOnUse">
      <feOffset dx="7" dy="7"/>
      <feGaussianBlur result="blur-2" stdDeviation="5"/>
      <feFlood flood-color="#000" flood-opacity=".75"/>
      <feComposite in2="blur-2" operator="in"/>
      <feComposite in="SourceGraphic"/>
    </filter>
  </defs>
  <rect y=".04" width="595.28" height="595.28"/>
  <g>
    <polyline class="cls-2" points="285.03 177.91 285.03 142.21 136.59 142.21 136.59 285.02 433.46 285.02 433.45 427.83 285.03 427.83 285.03 249.32"/>
    <line class="cls-1" x1="458.68" y1="453.07" x2="433.45" y2="427.83"/>
  </g>
</svg>"""
    }
    
    # Get companies for the email_id
    companies_query = supabase.table('stocks') \
        .select('companies(name, symbol)') \
        .eq('email_id', email_id) \
        .execute()
    
    companies_data = []
    
    for stock in companies_query.data:
        company_info = stock['companies']
        symbol = company_info['symbol']
        
        # Get articles for the company
        articles_query = supabase.table('articles') \
            .select('title, sentiment, link') \
            .eq('company', company_info['name']) \
            .execute()
        
        # Process articles into NewsItem format
        news_items: List[NewsItem] = [
            {
                "sentiment": article['sentiment'] or 'neutral',
                "text": article['title'],
                "link": article['link']
            }
            for article in articles_query.data
        ]
        
        # Get stock data using yfinance
        stock_symbol = f"{symbol}.NS"
        stock = yf.Ticker(stock_symbol)
        
        # Get historical data
        hist = stock.history(period="1y")
        
        if not hist.empty:
            current_price = hist.iloc[-1]['Close']
            week_ago_price = hist.iloc[-6]['Close'] if len(hist) >= 6 else hist.iloc[0]['Close']
            ytd_price = hist.iloc[0]['Close']
            
            weekly_change = ((current_price - week_ago_price) / week_ago_price) * 100
            ytd_change = ((current_price - ytd_price) / ytd_price) * 100
            
            company_data: Company = {
                "name": company_info['name'],
                "symbol": symbol,
                "icon": f"https://financialmodelingprep.com/image-stock/{symbol}.NS.png?height=30",
                "weeklyClose": f"₹{current_price:.2f}",
                "weeklyChange": f"{'+' if weekly_change >= 0 else ''}{weekly_change:.1f}%",
                "ytdChange": f"{'+' if ytd_change >= 0 else ''}{ytd_change:.1f}%",
                "news": news_items
            }
            
            companies_data.append(company_data)
    
    # Create final config
    config: Config = {
        "header": header,
        "companies": companies_data
    }
    
    return config

SUPABASE_URL="https://zhjgdlyokkzvnziwncsr.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoamdkbHlva2t6dm56aXduY3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2NTg1MzgsImV4cCI6MjA0NjIzNDUzOH0.ZCqkjrb9xO32G2-yOybXAgx2MLYl16rrZUWT-VSdn-Y"

# config = get_financial_config(
#     email_id="pratham31012002@gmail.com",
#     supabase_url=SUPABASE_URL,
#     supabase_key=SUPABASE_KEY
# )

# print(config)