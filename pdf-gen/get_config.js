// Type definitions
/**
 * @typedef {Object} NewsItem
 * @property {string} sentiment
 * @property {string} link
 * @property {string} text
 * @property {string} date
 */

/**
 * @typedef {Object} KeyMetrics
 * @property {string} [P_E_Ratio]
 * @property {string} [P_B_Ratio]
 * @property {string} [ROE]
 * @property {string} [Dividend_Yield]
 * @property {string} [Price_to_200DMA]
 * @property {string} [Price_to_50DMA]
 */

/**
 * @typedef {Object} TechnicalSignals
 * @property {boolean} fiftyTwoWeekHigh
 * @property {boolean} fiftyTwoWeekLow
 * @property {boolean} rsiOverbought
 * @property {boolean} rsiOversold
 * @property {boolean} macdBullish
 * @property {boolean} macdBearish
 */

/**
 * @typedef {Object} Insight
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef {Object} AnalystReport
 * @property {string} title
 * @property {string} link
 */

/**
 * @typedef {Object} Company
 * @property {string} name
 * @property {string} symbol
 * @property {string} ISIN
 * @property {string} icon
 * @property {string} weeklyClose
 * @property {string} weeklyChange
 * @property {string} ytdChange
 * @property {KeyMetrics} keyMetrics
 * @property {TechnicalSignals} technicalSignals
 * @property {NewsItem[]} news
 * @property {Insight[]} insights
 * @property {AnalystReport[]} analystReports
 * @property {string[]} blockDeals
 */

/**
 * @typedef {Object} Header
 * @property {string} title
 * @property {string} date
 * @property {string} logo
 * @property {string} brokerName
 */

/**
 * @typedef {Object} Config
 * @property {Header} header
 * @property {Company[]} companies
 * @property {Insight[]} generalInsights
 * @property {AnalystReport[]} generalAnalystReports
 */

import { createClient } from '@supabase/supabase-js';
import yahooFinance from 'yahoo-finance2';
import {
  getStockMetrics,
  hit52WeekHigh,
  hit52WeekLow,
  isRsiOverbought,
  isRsiOversold,
  isMacdBullishCrossover,
  isMacdBearishCrossover
} from './metrics.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @param {string} emailId
 * @param {number} brokerId
 * @param {string} supabaseUrl
 * @param {string} supabaseKey
 * @returns {Promise<Config>}
 */
async function getFinancialConfig(emailId, brokerId, supabaseUrl, supabaseKey) {
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Get current date and format week ending date
  const currentDate = new Date();
  const weekEnding = new Date(currentDate);
  weekEnding.setDate(currentDate.getDate() + (5 - currentDate.getDay()));
  const weekEndingStr = weekEnding.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).replace(/(\d+)/, '$1th');
  
  // Get broker settings
  const { data: settings, error: settingsError } = await supabase
    .from('weekly_report_settings')
    .select('*')
    .eq('broker_id', brokerId)
    .single();
  
  if (settingsError || !settings) {
    throw new Error(`No settings found for broker_id ${brokerId}`);
  }
  
  const selectedCategories = settings.selected_categories ? 
    settings.selected_categories.split(',').map(x => x.trim()) : [];
  const selectedMetrics = settings.selected_metrics ? 
    settings.selected_metrics.split(',').map(x => x.trim()) : [];
  
  // Get technical trigger settings
  const { data: techSettings } = await supabase
    .from('technical_trigger_settings')
    .select('*')
    .eq('broker_id', brokerId)
    .single();
  
  // Get broker info
  const { data: brokerData } = await supabase
    .from('brokers')
    .select('name')
    .eq('id', brokerId)
    .single();
  
  const brokerName = brokerData.name;
  
  // Get client data
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('id, name')
    .eq('email', emailId)
    .single();
  
  if (clientError || !clientData) {
    throw new Error(`Client not found for email ${emailId}`);
  }
  
  // Create header
  const header = {
    title: `${clientData.name}'s Weekly Portfolio Update`,
    date: `Week ended ${weekEndingStr}`,
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMQ1smT0Jr19WHt2eec_ezeODfuoT9BRTlGA&s",
    brokerName
  };
  
  // Get companies data
  const { data: companiesData } = await supabase
    .from('client_companies')
    .select('*, companies(*)')
    .eq('client_id', clientData.id);
  
  const companies = await Promise.all(companiesData.map(async (clientCompany) => {
    const companyInfo = clientCompany.companies;
    const symbol = companyInfo.symbol;
    
    // Get articles for the company
    let { data: articles } = await supabase
      .from('articles')
      .select('title, sentiment, link, date, article_type')
      .eq('company', companyInfo.name)
      .order('date', { ascending: false });
    
    if (selectedCategories.length !== 5) {
      articles = articles.filter(article => 
        selectedCategories.includes(article.article_type)
      );
    }
    
    // Remove duplicate articles
    const uniqueArticles = Array.from(
      new Map(articles.map(article => [article.link, article])).values()
    );
    
    // Process articles into NewsItem format
    const newsItems = uniqueArticles.map(article => ({
      sentiment: article.sentiment || 'neutral',
      text: article.title,
      link: article.link,
      date: article.date.split('T')[0]
    }));
    
    // Get stock data using yahoo-finance
    const stockSymbol = `${symbol}.NS`;
    const stockData = await yahooFinance.historical(stockSymbol, {
      period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      period2: new Date()
    });
    
    if (stockData.length > 0) {
      const currentPrice = stockData[stockData.length - 1].close;
      const weekAgoPrice = stockData.length >= 6 ? 
        stockData[stockData.length - 6].close : 
        stockData[0].close;
      const ytdPrice = stockData[0].close;
      
      const weeklyChange = ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100;
      const ytdChange = ((currentPrice - ytdPrice) / ytdPrice) * 100;
      
      // Calculate technical signals
      const technicalSignals = {};
      if (techSettings) {
        if (techSettings.fifty_two_week_high) {
          technicalSignals.fiftyTwoWeekHigh = await hit52WeekHigh(symbol);
        }
        if (techSettings.fifty_two_week_low) {
          technicalSignals.fiftyTwoWeekLow = await hit52WeekLow(symbol);
        }
        if (techSettings.rsi_overbought) {
          technicalSignals.rsiOverbought = await isRsiOverbought(
            symbol,
            techSettings.rsi_overbought_period,
            techSettings.rsi_overbought_threshold
          );
        }
        if (techSettings.rsi_oversold) {
          technicalSignals.rsiOversold = await isRsiOversold(
            symbol,
            techSettings.rsi_oversold_period,
            techSettings.rsi_oversold_threshold
          );
        }
        if (techSettings.macd_bullish) {
          technicalSignals.macdBullish = await isMacdBullishCrossover(
            symbol,
            techSettings.macd_bullish_fast,
            techSettings.macd_bullish_slow,
            techSettings.macd_bullish_signal
          );
        }
        if (techSettings.macd_bearish) {
          technicalSignals.macdBearish = await isMacdBearishCrossover(
            symbol,
            techSettings.macd_bearish_fast,
            techSettings.macd_bearish_slow,
            techSettings.macd_bearish_signal
          );
        }
      }
      
      // Convert all technical signals to boolean
      Object.keys(technicalSignals).forEach(key => {
        technicalSignals[key] = Boolean(technicalSignals[key]);
      });
      
      // Get key metrics
      const metricsData = await getStockMetrics(symbol);
      const keyMetrics = {};
      for (const metric of selectedMetrics) {
        const metricKey = metric.replace(/ /g, '_').replace(/\//g, '_');
        if (metricKey in metricsData) {
          const value = metricsData[metricKey];
          keyMetrics[metric] = (value != null && !isNaN(value)) ? value : 'N/A';
        }
      }
      
      // Get insights
      const { data: insights } = await supabase
        .from('weekly_report_insights')
        .select('title, description')
        .eq('broker_id', brokerId)
        .eq('company_id', companyInfo.id)
        .eq('week_window', 'current');
      
      // Get research reports
      const { data: reports } = await supabase
        .from('research_reports')
        .select('title, file_url')
        .eq('broker_id', brokerId)
        .eq('company_id', companyInfo.id)
        .order('created_at', { ascending: false });
      
      return {
        name: companyInfo.name,
        symbol,
        ISIN: companyInfo.ISIN,
        icon: `https://financialmodelingprep.com/image-stock/${symbol}.NS.png?height=30`,
        weeklyClose: `₹${currentPrice.toFixed(2)}`,
        weeklyChange: `${weeklyChange >= 0 ? '+' : ''}${weeklyChange.toFixed(1)}%`,
        ytdChange: `${ytdChange >= 0 ? '+' : ''}${ytdChange.toFixed(1)}%`,
        keyMetrics,
        technicalSignals,
        news: newsItems,
        insights: insights.map(insight => ({
          title: insight.title,
          description: insight.description
        })),
        analystReports: reports.map(report => ({
          title: report.title,
          link: report.file_url
        }))
      };
    }
  }));
  
  // Get general insights
  const { data: generalInsights } = await supabase
    .from('weekly_report_insights')
    .select('title, description')
    .eq('broker_id', brokerId)
    .is('company_id', null)
    .eq('week_window', 'current');
  
  // Get general research reports
  const { data: generalReports } = await supabase
    .from('research_reports')
    .select('title, file_url')
    .eq('broker_id', brokerId)
    .is('company_id', null)
    .order('created_at', { ascending: false });
  
  return {
    header,
    companies: companies.filter(Boolean),
    generalInsights: generalInsights.map(insight => ({
      title: insight.title,
      description: insight.description
    })),
    generalAnalystReports: generalReports.map(report => ({
      title: report.title,
      link: report.file_url
    }))
  };
}

export default getFinancialConfig;
