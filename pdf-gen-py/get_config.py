from typing import List, TypedDict
from datetime import datetime, timedelta
import yfinance as yf
from supabase import create_client, Client
import pandas as pd
import json
import numpy as np
from metrics import get_stock_metrics, hit_52week_high, hit_52week_low, is_rsi_overbought, is_rsi_oversold, is_macd_bullish_crossover, is_macd_bearish_crossover
import os


class NewsItem(TypedDict):
    sentiment: str
    link: str
    text: str
    date: str

class KeyMetrics(TypedDict, total=False):
    P_E_Ratio: str
    P_B_Ratio: str
    ROE: str
    Dividend_Yield: str
    Price_to_200DMA: str
    Price_to_50DMA: str

class TechnicalSignals(TypedDict):
    fiftyTwoWeekHigh: bool
    fiftyTwoWeekLow: bool
    rsiOverbought: bool
    rsiOversold: bool
    macdBullish: bool
    macdBearish: bool

class Insight(TypedDict):
    title: str
    description: str
  
class AnalystReport(TypedDict):
    title: str
    link: str
class Company(TypedDict, total=False):
    name: str
    symbol: str
    ISIN: str
    icon: str
    weeklyClose: str
    weeklyChange: str
    ytdChange: str
    keyMetrics: KeyMetrics
    technicalSignals: TechnicalSignals
    news: List[NewsItem]
    insights: List[Insight]
    analystReports: List[AnalystReport]
    blockDeals: List[str]

class Header(TypedDict):
    title: str
    date: str
    logo: str
    brokerName: str

class Config(TypedDict):
    header: Header
    companies: List[Company]
    generalInsights: List[Insight]
    generalAnalystReports: List[AnalystReport]

def get_financial_config(email: str, report_id: int, supabase_url: str, supabase_key: str) -> Config:
    # Initialize Supabase client
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Get current date and format week ending date
    current_date = datetime.now()
    week_ending = (current_date + timedelta(days=(5 - current_date.weekday()))).strftime("%dth %b %Y")
    
    # Get broker settings
    settings_query = supabase.table('weekly_report_settings') \
        .select('*') \
        .eq('broker_id', report_id) \
        .single() \
        .execute()
    
    if not settings_query.data:
        raise ValueError(f"No settings found for broker_id {report_id}")
    
    settings = settings_query.data
    selected_categories = list(map(lambda x: x.strip(), settings['selected_categories'].split(','))) if settings['selected_categories'] else []
    selected_metrics = list(map(lambda x: x.strip(), settings['selected_metrics'].split(','))) if settings['selected_metrics'] else []
    
    # Get technical trigger settings
    tech_settings_query = supabase.table('technical_trigger_settings') \
        .select('*') \
        .eq('broker_id', report_id) \
        .single() \
        .execute()
    
    tech_settings = tech_settings_query.data if tech_settings_query.data else {}
    
    # Get broker info
    broker_query = supabase.table('brokers') \
        .select('name') \
        .eq('id', report_id) \
        .single() \
        .execute()
    
    broker_name = broker_query.data['name']
    
    # Get client's companies through table
    # Get Client data
    companies_query = supabase.table('clients') \
        .select('id, name') \
        .eq('email', email) \
        .single() \
        .execute()
        
    if not companies_query.data:
        raise ValueError(f"Client not found for email {email}")
    

    # Create header
    header: Header = {
        "title": f"{companies_query.data['name']}'s Weekly Portfolio Update",
        "date": f"Week ended {week_ending}",
        "logo": """https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMQ1smT0Jr19WHt2eec_ezeODfuoT9BRTlGA&s""",
        "brokerName": broker_name
    }
    
    # Left join client_companies table with companies table
    companies_query = supabase.table('client_companies') \
        .select('*, companies(*)') \
        .eq('client_id', companies_query.data['id']) \
        .execute()
    
    
    companies_data = []
    
    # Extract companies from the nested structure
    if companies_query.data:
      for client_company in companies_query.data:
        if 'companies' in client_company:
            company_info = client_company['companies']
            symbol = company_info['symbol']
            
            # TODO: Change according to maximum number of categories
            if len(selected_categories) == 5:
              articles_query = supabase.table('articles') \
                .select('title, sentiment, link, date, article_type') \
                .eq('company', company_info['name']) \
                .order('date', desc=True) \
                .execute()
            
            else:
              # Get articles for the company with selected categories
              articles_query = supabase.table('articles') \
                .select('title, sentiment, link, date, article_type') \
                .eq('company', company_info['name']) \
                .in_('article_type', selected_categories) \
                .order('date', desc=True) \
                .execute()
            
            # Remove duplicate articles using article link
            unique_articles = []
            seen_links = set()
            for article in articles_query.data:
                if article['link'] not in seen_links:
                    unique_articles.append(article)
                    seen_links.add(article['link'])
            
            # Process articles into NewsItem format
            news_items: List[NewsItem] = [
                {
                    "sentiment": article['sentiment'] or 'neutral',
                    "text": article['title'],
                    "link": article['link'],
                    "date": article['date'].split('T')[0]
                }
                for article in unique_articles
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
                
                # Calculate technical signals based on settings
                technical_signals = {}
                if tech_settings:
                    if tech_settings['fifty_two_week_high']:
                        technical_signals['fiftyTwoWeekHigh'] = hit_52week_high(symbol)
                    if tech_settings['fifty_two_week_low']:
                        technical_signals['fiftyTwoWeekLow'] = hit_52week_low(symbol)
                    if tech_settings['rsi_overbought']:
                        technical_signals['rsiOverbought'] = is_rsi_overbought(
                            symbol,
                            period=tech_settings['rsi_overbought_period'],
                            threshold=tech_settings['rsi_overbought_threshold']
                        )
                    if tech_settings['rsi_oversold']:
                        technical_signals['rsiOversold'] = is_rsi_oversold(
                            symbol,
                            period=tech_settings['rsi_oversold_period'],
                            threshold=tech_settings['rsi_oversold_threshold']
                        )
                    if tech_settings['macd_bullish']:
                        technical_signals['macdBullish'] = is_macd_bullish_crossover(
                            symbol,
                            fast_period=tech_settings['macd_bullish_fast'],
                            slow_period=tech_settings['macd_bullish_slow'],
                            signal_period=tech_settings['macd_bullish_signal']
                        )
                    if tech_settings['macd_bearish']:
                        technical_signals['macdBearish'] = is_macd_bearish_crossover(
                            symbol,
                            fast_period=tech_settings['macd_bearish_fast'],
                            slow_period=tech_settings['macd_bearish_slow'],
                            signal_period=tech_settings['macd_bearish_signal']
                        )
                
                # Bool all technical signals
                technical_signals = {k: bool(v) for k, v in technical_signals.items()}
                
                # Get key metrics based on selected metrics
                key_metrics = {}
                metrics_data = get_stock_metrics(symbol)
                # Always include these four metrics
                key_metrics['P/E Ratio'] = metrics_data.get('P_E_Ratio', 'N/A')
                key_metrics['P/B Ratio'] = metrics_data.get('P_B_Ratio', 'N/A')
                key_metrics['50 DMA'] = metrics_data.get('Price_to_50DMA', 'N/A')
                key_metrics['200 DMA'] = metrics_data.get('Price_to_200DMA', 'N/A')
                # Optionally add other selected metrics
                for metric in selected_metrics:
                    metric_key = metric.replace(" ", "_").replace("/", "_")
                    if metric_key in metrics_data and metric not in key_metrics:
                        key_metrics[metric] = metrics_data[metric_key] if metrics_data[metric_key] is not None and not np.isnan(metrics_data[metric_key]) else 'N/A'
                
                # Get insights for the company
                insights_query = supabase.table('weekly_report_insights') \
                    .select('title, description') \
                    .eq('broker_id', report_id) \
                    .eq('company_id', company_info['id']) \
                    .eq('week_window', 'current') \
                    .execute()
                
                insights = [
                    {
                        "title": insight['title'],
                        "description": insight['description']
                    }
                    for insight in insights_query.data
                ]
                
                # Get research reports
                reports_query = supabase.table('research_reports') \
                    .select('title, file_url') \
                    .eq('broker_id', report_id) \
                    .eq('company_id', company_info['id']) \
                    .order('created_at', desc=True) \
                    .execute()
                
                analyst_reports = [
                    {
                        "title": report['title'],
                        "link": report['file_url']
                    }
                    for report in reports_query.data
                ]
                
                company_data: Company = {
                    "name": company_info['name'],
                    "symbol": symbol,
                    "ISIN": company_info['ISIN'],
                    "icon": f"https://financialmodelingprep.com/image-stock/{symbol}.NS.png?height=30",
                    "weeklyClose": f"₹{current_price:.2f}",
                    "weeklyChange": f"{'+' if weekly_change >= 0 else ''}{weekly_change:.1f}%",
                    "ytdChange": f"{'+' if ytd_change >= 0 else ''}{ytd_change:.1f}%",
                    "keyMetrics": key_metrics,
                    "technicalSignals": technical_signals,
                    "news": news_items,
                    "insights": insights,
                    "analystReports": analyst_reports
                }
                
                companies_data.append(company_data)
    
    # Get general insights
    general_insights_query = supabase.table('weekly_report_insights') \
        .select('title, description') \
        .eq('broker_id', report_id) \
        .is_('company_id', None) \
        .eq('week_window', 'current') \
        .execute()
    
    general_insights = [
        {
            "title": insight['title'],
            "description": insight['description']
        }
        for insight in general_insights_query.data
    ]
    
    # Get general research reports
    general_reports_query = supabase.table('research_reports') \
        .select('title, file_url') \
        .eq('broker_id', report_id) \
        .is_('company_id', None) \
        .order('created_at', desc=True) \
        .execute()
    
    general_analyst_reports = [
        {
            "title": report['title'],
            "link": report['file_url']
        }
        for report in general_reports_query.data
    ]
    
    # Create final config
    config: Config = {
        "header": header,
        "companies": companies_data,
        "generalInsights": general_insights,
        "generalAnalystReports": general_analyst_reports
    }
    
    return config

# SUPABASE_URL="https://zhjgdlyokkzvnziwncsr.supabase.co"
# SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoamdkbHlva2t6dm56aXduY3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2NTg1MzgsImV4cCI6MjA0NjIzNDUzOH0.ZCqkjrb9xO32G2-yOybXAgx2MLYl16rrZUWT-VSdn-Y"

# config = get_financial_config(
#     email="pratham@example.com",
#     report_id=1,
#     supabase_url=SUPABASE_URL,
#     supabase_key=SUPABASE_KEY
# )

# with open("config.json", "w") as f:
#     json.dump(config, f, indent=4)