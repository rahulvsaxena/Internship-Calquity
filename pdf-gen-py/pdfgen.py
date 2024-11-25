from typing import List, TypedDict, Optional
import json
from get_config import get_financial_config

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


# def generate_html(config: Config) -> str:
#     header_html = f"""
#         <header class="bg-primary text-primary-foreground p-6 rounded-t-2xl mb-8 avoid-break">
#           <div class="flex items-center gap-4">{config['header']['logo']}
#             <div>
#               <h1 class="text-3xl font-bold">{config['header']['title']}</h1>
#               <p class="text-sm opacity-90 text-left">{config['header']['date']}</p>
#             </div>
#           </div>
#         </header>
#     """

#     market_overview_rows = ""
#     for company in config['companies']:
#         weekly_change_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>' if "+" in company['weeklyChange'] else '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'
#         weekly_change_color = "text-green-600" if "+" in company['weeklyChange'] else "text-red-600"
#         ytd_change_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>' if "+" in company['ytdChange'] else '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'
#         ytd_change_color = "text-green-600" if "+" in company['ytdChange'] else "text-red-600"

#         market_overview_rows += f"""
#             <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
#                 <td class="p-2 align-middle font-medium">
#                     <div class="flex items-center gap-2"><img src="{company['icon']}" class="h-4 rounded-sm"><span>{company['name']} ({company['symbol']})</span></div>
#                 </td>
#                 <td class="p-2 align-middle text-center">{company['weeklyClose']}</td>
#                 <td class="p-2 align-middle text-center py-3">
#                     <div class="flex items-center justify-center gap-1 font-medium {weekly_change_color}">{weekly_change_icon}{company['weeklyChange']}</div>
#                 </td>
#                 <td class="p-2 align-middle text-center">
#                     <div class="flex items-center justify-center gap-1 font-medium {ytd_change_color}">{ytd_change_icon}{company['ytdChange']}</div>
#                 </td>
#             </tr>
#         """



#     company_updates = ""
#     for company in config['companies']:
#         if len(company['news']) == 0:
#             continue
#         key_metrics_html = ""
#         if 'keyMetrics' in company:
#             key_metrics_html = f"""
#                 <div class="grid grid-cols-4 gap-4 mb-4 p-3 bg-muted rounded-lg">
#                     {' '.join([f'<div><p class="text-sm text-muted-foreground">{k.replace("peRatio", "P/E Ratio").replace("marketCap", "Market Cap")}</p><p class="font-semibold">{v}</p></div>' for k, v in company['keyMetrics'].items()])}
#                 </div>
#             """

#         news_html = ""
#         if 'news' in company:
#             news_items = ""
#             for news_item in company['news']:
#                 sentiment_color = {
#                     'positive': ('green', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide green lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'),
#                     'neutral': ('gray', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'),
#                     'negative': ('red', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide red lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'),
#                 }[news_item['sentiment']]
#                 news_items += f"""
#                     <li class="flex items-start gap-2 text-left">
#                         <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-{sentiment_color[0]}-100 text-{sentiment_color[0]}-700 hover:bg-{sentiment_color[0]}-200 mt-1 shrink-0">
#                             {sentiment_color[1]}
#                         </div><span class="text-{sentiment_color[0]}-700 text-left">
#                         <a href="{news_item['link']}" style="text-decoration: none; color: inherit;" target="_blank">{news_item['text']}</a>
#                         </span>
#                     </li>
#                 """

#             news_html = f"""
#                 <div>
#                     <h4 class="font-semibold mb-2 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-4 h-4 ml-2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>Latest News</h4>
#                     <ul class="space-y-3">
#                        {news_items}
#                     </ul>
#                 </div>
#             """

#         block_deals_html = ""
#         if 'blockDeals' in company:
#             block_deals_html = f"""
#                 <div class="bg-muted p-3 rounded-lg">
#                     <h4 class="font-semibold mb-2 text-left">Block Deals</h4>
#                     <ul class="list-disc list-inside space-y-1 text-left ml-2">
#                         {' '.join([f'<li>{deal}</li>' for deal in company['blockDeals']])}
#                     </ul>
#                 </div>
#             """
#         analyst_updates_html = ""

#         if 'analystUpdates' in company:
#             analyst_updates_html = f"""
#                 <div class="bg-muted p-3 rounded-lg">
#                     <h4 class="font-semibold mb-2 text-left">Analyst Updates</h4>
#                     <ul class="list-disc list-inside space-y-1 text-left ml-2">
#                         {' '.join([f'<li>{update}</li>' for update in company['analystUpdates']])}
#                     </ul>
#                 </div>
#             """


#         company_updates += f"""
#             <div class="rounded-xl border bg-card text-card-foreground avoid-break">
#                 <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">
#                     <div class="font-semibold tracking-tight text-xl flex items-center justify-between"><span class="flex items-center gap-2"><img src="{company['icon']}" class="h-6 rounded-sm">{company['name']} ({company['symbol']})</span><span class="text-base {'text-green-600' if '+' in company['weeklyChange'] else 'text-red-600'}">{company['weeklyClose']}</span></div>
#                 </div>
#                 <div class="p-4">
#                     {key_metrics_html}
#                     <div class="space-y-4">
#                         {news_html}
#                         {block_deals_html}
#                         {analyst_updates_html}
#                     </div>
#                 </div>
#             </div>
#         """



#     html = f"""
# <!DOCTYPE html>
# <html lang="en">
# <head>
#     <meta charset="UTF-8">
#     <meta name="viewport" content="width=device-width, initial-scale=1.0">
#     <title>CQNowReport</title>
#     <style>
#         {open('styles.css', 'r').read()}
#     </style>
# </head>
# <body>
#   <div id="root">
#     <div class="min-h-screen bg-background p-4 w-screen">
#       <div class="max-w-7xl mx-auto">
#         <div class="bg-white w-full relative">
#           <div class="p-4 pb-4">
#             {header_html}
#             <section class="mb-8 avoid-break">
#               <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-column w-6 h-6"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>Market Overview</h2>
#               <div class="rounded-xl border bg-card text-card-foreground">
#                 <div class="relative w-full overflow-auto">
#                   <table class="w-full caption-bottom text-sm">
#                     <thead class="[&_tr]:border-b">
#                       <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
#                         <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">Company</th>
#                         <th class="h-10 px-2 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-center">Weekly Close</th>
#                         <th class="h-10 px-2 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-center">Weekly</th>
#                         <th class="h-10 px-2 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-center">YTD</th>
#                       </tr>
#                     </thead>
#                     <tbody class="[&_tr:last-child]:border-0">
#                       {market_overview_rows}
#                     </tbody>
#                   </table>
#                 </div>
#               </div>
#             </section>
#             <section>
#               <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-newspaper w-6 h-6"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>Company Updates</h2>
#               <div class="grid grid-cols-1 gap-6">
#                 {company_updates}
#               </div>
#             </section>
#           </div>
#         </div>
#       </div>
#     </div>
#   </div>
# </body>
# </html>
#     """
#     return html

def generate_html(config: Config) -> str:  
    header_html = f"""  
        <header class="text-primary-foreground p-6 rounded-t-2xl mb-8 avoid-break" style="background-color: #0b4177;">  
          <div class="flex items-center gap-4"><img src={config['header']['logo']} class="h-12 rounded-sm">  
            <div>  
              <h1 class="text-3xl font-bold">{config['header']['title']}</h1>  
              <p class="text-sm opacity-90 text-left">{config['header']['date']}</p>  
            </div>  
          </div>  
        </header>  
    """  
  
    market_overview_rows = ""  
    for company in config['companies']:  
        weekly_change_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>' if "+" in company['weeklyChange'] else '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'  
        weekly_change_color = "text-green-600" if "+" in company['weeklyChange'] else "text-red-600"  
        ytd_change_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>' if "+" in company['ytdChange'] else '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'  
        ytd_change_color = "text-green-600" if "+" in company['ytdChange'] else "text-red-600"  
  
        market_overview_rows += f"""  
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                <td class="p-2 align-middle font-medium">  
                    <div class="flex items-center gap-2"><img src="{company['icon']}" class="h-4 rounded-sm"><span>{company['name']} ({company['symbol']})</span></div>  
                </td>  
                <td class="p-2 align-middle text-center">{company['weeklyClose']}</td>  
                <td class="p-2 align-middle text-center py-3">  
                    <div class="flex items-center justify-center gap-1 font-medium {weekly_change_color}">{weekly_change_icon}{company['weeklyChange']}</div>  
                </td>  
                <td class="p-2 align-middle text-center">  
                    <div class="flex items-center justify-center gap-1 font-medium {ytd_change_color}">{ytd_change_icon}{company['ytdChange']}</div>  
                </td>  
            </tr>  
        """  
  
    # Process generalInsights  
    general_insights_html = ""  
    if 'generalInsights' in config and config['generalInsights']:  
        insights_items = ""  
        for insight in config['generalInsights']:  
            insights_items += f"""  
            <div class="p-3 bg-muted rounded-lg">  
                <h4 class="font-semibold mb-1 text-left">{insight['title']}</h4>  
                <p class="text-left">{insight['description']}</p>  
            </div>  
            """  
        general_insights_html = f"""  
        <section class="mb-8 avoid-break">  
            <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">General Insights</h2>  
            <div class="space-y-4">  
                {insights_items}  
            </div>  
        </section>  
        """  
  
    # Process generalAnalystReports  
    general_analyst_reports_html = ""  
    if 'generalAnalystReports' in config and config['generalAnalystReports']:  
        reports_items = ""  
        for report in config['generalAnalystReports']:  
            reports_items += f"""  
            <div class="p-3 bg-muted rounded-lg">  
                <h4 class="font-semibold mb-1 text-left"><a href="{report['link']}" target="_blank">{report['title']}</a></h4>  
            </div>  
            """  
        general_analyst_reports_html = f"""  
        <section class="mb-8 avoid-break">  
            <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">Reports from the Analysts' Desk</h2>  
            <div class="space-y-4">  
                {reports_items}  
            </div>  
        </section>  
        """  
  
    # Process company updates  
    company_updates = ""  
    for company in config['companies']:  
        # Key Metrics  
        key_metrics_html = ""  
        if 'keyMetrics' in company:  
            key_metrics_html = f"""  
                <div class="grid grid-cols-{len(company['keyMetrics'])} gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">  
                    {' '.join([f'<div class="flex flex-col justify-center flex-1 gap-2 p-2 bg-secondary rounded-md"><p class="text-sm text-muted-foreground">{k.replace("_", " ")}</p><p class="font-semibold">{v}</p></div>' for k, v in company['keyMetrics'].items()])}  
                </div>  
            """  


  
        # Technical Triggers  
        technical_triggers_html = ''  
        if 'technicalSignals' in company:  
            technical_signals = company['technicalSignals']  
            true_signals = []  
            signals_info = {  
                "fiftyTwoWeekHigh": ("52 Week High", "green"),  
                "fiftyTwoWeekLow": ("52 Week Low", "red"),  
                "rsiOverbought": ("RSI Overbought", "yellow"),  
                "rsiOversold": ("RSI Oversold", "yellow"),  
                "macdBullish": ("MACD Bullish", "green"),  
                "macdBearish": ("MACD Bearish", "red"),  
            }  
            for signal_key, (display_text, color) in signals_info.items():  
                if technical_signals.get(signal_key):  
                    true_signals.append((display_text, color))  
            if true_signals:  
                triggers_html = ' '.join(  
                    [f'<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold border-transparent bg-{color}-100 text-{color}-700">{text}</span>'  
                     for text, color in true_signals])  
                technical_triggers_html = f"""  
                <div class="flex flex-wrap gap-1">  
                    {triggers_html}  
                </div>  
                """  
  
        # News  
        news_html = ""  
        if 'news' in company and company['news']:  
            news_items = ""  
            for news_item in company['news']:  
                sentiment_color = {  
                    'positive': ('green', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'),  
                    'neutral': ('gray', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'),  
                    'negative': ('red', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"     stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'),  
                }[news_item['sentiment']]  
                news_items += f"""  
                    <li class="flex items-start gap-2 text-left">  
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-{sentiment_color[0]}-100 text-{sentiment_color[0]}-700 mt-1 shrink-0">  
                            {sentiment_color[1]}  
                        </div><span class="text-{sentiment_color[0]}-700 text-left">  
                        <a href="{news_item['link']}" style="text-decoration: none; color: inherit;" target="_blank">{news_item['text']}</a>  
                        </span>  
                    </li>  
                """  
  
            news_html = f"""  
                <div>  
                    <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>  
                    <ul class="space-y-3">  
                       {news_items}  
                    </ul>  
                </div>  
            """  
  
        # Block Deals  
        block_deals_html = ""  
        if 'blockDeals' in company and company['blockDeals']:  
            block_deals_html = f"""  
                <div class="bg-muted p-3 rounded-lg">  
                    <h4 class="font-semibold mb-2 text-left">Block Deals</h4>  
                    <ul class="list-disc list-inside space-y-1 text-left ml-2">  
                        {' '.join([f'<li>{deal}</li>' for deal in company['blockDeals']])}  
                    </ul>  
                </div>  
            """  
  
        # Insights  
        insights_html = ""  
        if 'insights' in company and company['insights']:  
            insights_items = ""  
            for insight in company['insights']:  
                insights_items += f"""  
                <div class="p-3 bg-muted rounded-lg">  
                    <h4 class="font-semibold mb-1 text-left">{insight['title']}</h4>  
                    <p class="text-left">{insight['description']}</p>  
                </div>  
                """  
            insights_html = f"""  
                <div class="mb-4">  
                    <h4 class="font-semibold mb-2 text-left">Insights from the Analysts' Desk</h4>  
                    <div class="space-y-3">  
                        {insights_items}  
                    </div>  
                </div>  
            """  
  
        # Analyst Reports  
        analyst_reports_html = ""  
        if 'analystReports' in company and company['analystReports']:  
            reports_items = ""  
            for report in company['analystReports']:  
                reports_items += f"""  
                <div class="p-3 bg-muted rounded-lg">  
                    <h4 class="font-semibold mb-1 text-left"><a href="{report['link']}" target="_blank">{report['title']}</a></h4>  
                </div>  
                """  
            analyst_reports_html = f"""  
                <div class="mb-4">  
                    <h4 class="font-semibold mb-2 text-left">Reports from the Analysts' Desk</h4>  
                    <div class="space-y-3">  
                        {reports_items}  
                    </div>  
                </div>  
            """  
  
        company_updates += f"""  
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">  
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">  
                    <div class="flex items-center justify-between">  
                        <div class="flex items-center gap-2 font-semibold text-xl">  
                            <img src="{company['icon']}" class="h-6 rounded-sm">{company['name']} ({company['symbol']})  
                        </div>  
                        <div>
                        {technical_triggers_html}  
                        <div class="text-base mt-1 font-semibold {'text-green-600' if '+' in company['weeklyChange'] else 'text-red-600'}">{company['weeklyClose']}</div>  
                        </div>
                    </div>  
                </div>  
                <div class="p-4">  
                    {key_metrics_html}  
                    <div class="space-y-4">  
                        {insights_html}  
                        {analyst_reports_html}  
                        {news_html}  
                        {block_deals_html}  
                    </div>  
                </div>  
            </div>  
        """  
  
    html = f"""  
<!DOCTYPE html>  
<html lang="en">  
<head>  
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <title>CQNowReport</title>  
    <style>  
        {open('styles.css', 'r').read()}  
    </style>  
</head>  
<body>  
  <div id="root">  
    <div class="min-h-screen bg-background p-4 w-screen">  
      <div class="max-w-7xl mx-auto">  
        <div class="bg-white w-full relative">  
          <div class="px-4">  
            {header_html}  
            <section class="mb-8 avoid-break">  
              <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">Market Overview</h2>  
              <div class="rounded-xl border bg-card text-card-foreground">  
                <div class="relative w-full overflow-auto">  
                  <table class="w-full caption-bottom text-sm">  
                    <thead class="[&_tr]:border-b">  
                      <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">  
                        <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Company</th>  
                        <th class="h-10 px-2 align-middle font-medium text-muted-foreground text-center">Weekly Close</th>  
                        <th class="h-10 px-2 align-middle font-medium text-muted-foreground text-center">Weekly</th>  
                        <th class="h-10 px-2 align-middle font-medium text-muted-foreground text-center">YTD</th>  
                      </tr>  
                    </thead>  
                    <tbody class="[&_tr:last-child]:border-0">  
                      {market_overview_rows}  
                    </tbody>  
                  </table>  
                </div>  
              </div>  
            </section>  
            {general_insights_html}  
            {general_analyst_reports_html}  
            <section>  
              <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">Company Updates</h2>  
              <div class="grid grid-cols-1 gap-6">  
                {company_updates}  
              </div>  
            </section>  
          </div>  
        </div>  
      </div>  
    </div>  
  </div>  
</body>  
</html>  
    """  
  
    return html  

import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_KEY=os.getenv("SUPABASE_KEY")

config = get_financial_config("pratham@example.com", 1, SUPABASE_URL, SUPABASE_KEY)

html_output = generate_html(config)
import re
html_output = re.sub(r"`.*?`", "", html_output, flags=re.DOTALL)

with open("output.html", "w") as f:
    f.write(html_output)

