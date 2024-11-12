from typing import List, TypedDict, Optional

from get_config import get_financial_config

class NewsItem(TypedDict):
    sentiment: str
    text: str
    link: str

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


def generate_html(config: Config) -> str:
    header_html = f"""
        <header class="bg-primary text-primary-foreground p-6 rounded-t-2xl mb-8 avoid-break">
          <div class="flex items-center gap-4">{config['header']['logo']}
            <div>
              <h1 class="text-3xl font-bold">{config['header']['title']}</h1>
              <p class="text-sm opacity-90 text-left">{config['header']['date']}</p>
            </div>
          </div>
        </header>
    """

    market_overview_rows = ""
    for company in config['companies']:
        weekly_change_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>' if "+" in company['weeklyChange'] else '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'
        weekly_change_color = "text-green-600" if "+" in company['weeklyChange'] else "text-red-600"
        ytd_change_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>' if "+" in company['ytdChange'] else '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'
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



    company_updates = ""
    for company in config['companies']:
        if len(company['news']) == 0:
            continue
        key_metrics_html = ""
        if 'keyMetrics' in company:
            key_metrics_html = f"""
                <div class="grid grid-cols-4 gap-4 mb-4 p-3 bg-muted rounded-lg">
                    {' '.join([f'<div><p class="text-sm text-muted-foreground">{k.replace("peRatio", "P/E Ratio").replace("marketCap", "Market Cap")}</p><p class="font-semibold">{v}</p></div>' for k, v in company['keyMetrics'].items()])}
                </div>
            """

        news_html = ""
        if 'news' in company:
            news_items = ""
            for news_item in company['news']:
                sentiment_color = {
                    'positive': ('green', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide green lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'),
                    'neutral': ('gray', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'),
                    'negative': ('red', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide red lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'),
                }[news_item['sentiment']]
                news_items += f"""
                    <li class="flex items-start gap-2 text-left">
                        <div class="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-{sentiment_color[0]}-100 text-{sentiment_color[0]}-700 hover:bg-{sentiment_color[0]}-200 mt-1 shrink-0">
                            {sentiment_color[1]}
                        </div><span class="text-{sentiment_color[0]}-700 text-left">
                        <a href="{news_item['link']}" style="text-decoration: none; color: inherit;" target="_blank">{news_item['text']}</a>
                        </span>
                    </li>
                """

            news_html = f"""
                <div>
                    <h4 class="font-semibold mb-2 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-4 h-4 ml-2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>Latest News</h4>
                    <ul class="space-y-3">
                       {news_items}
                    </ul>
                </div>
            """

        block_deals_html = ""
        if 'blockDeals' in company:
            block_deals_html = f"""
                <div class="bg-muted p-3 rounded-lg">
                    <h4 class="font-semibold mb-2 text-left">Block Deals</h4>
                    <ul class="list-disc list-inside space-y-1 text-left ml-2">
                        {' '.join([f'<li>{deal}</li>' for deal in company['blockDeals']])}
                    </ul>
                </div>
            """
        analyst_updates_html = ""

        if 'analystUpdates' in company:
            analyst_updates_html = f"""
                <div class="bg-muted p-3 rounded-lg">
                    <h4 class="font-semibold mb-2 text-left">Analyst Updates</h4>
                    <ul class="list-disc list-inside space-y-1 text-left ml-2">
                        {' '.join([f'<li>{update}</li>' for update in company['analystUpdates']])}
                    </ul>
                </div>
            """


        company_updates += f"""
            <div class="rounded-xl border bg-card text-card-foreground avoid-break">
                <div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">
                    <div class="font-semibold tracking-tight text-xl flex items-center justify-between"><span class="flex items-center gap-2"><img src="{company['icon']}" class="h-6 rounded-sm">{company['name']} ({company['symbol']})</span><span class="text-base {'text-green-600' if '+' in company['weeklyChange'] else 'text-red-600'}">{company['weeklyClose']}</span></div>
                </div>
                <div class="p-4">
                    {key_metrics_html}
                    <div class="space-y-4">
                        {news_html}
                        {block_deals_html}
                        {analyst_updates_html}
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
          <div class="p-4 pb-4">
            {header_html}
            <section class="mb-8 avoid-break">
              <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-column w-6 h-6"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>Market Overview</h2>
              <div class="rounded-xl border bg-card text-card-foreground">
                <div class="relative w-full overflow-auto">
                  <table class="w-full caption-bottom text-sm">
                    <thead class="[&_tr]:border-b">
                      <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">Company</th>
                        <th class="h-10 px-2 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-center">Weekly Close</th>
                        <th class="h-10 px-2 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-center">Weekly</th>
                        <th class="h-10 px-2 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-center">YTD</th>
                      </tr>
                    </thead>
                    <tbody class="[&_tr:last-child]:border-0">
                      {market_overview_rows}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
            <section>
              <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-newspaper w-6 h-6"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>Company Updates</h2>
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

config = get_financial_config("samarth@calquity.com", SUPABASE_URL, SUPABASE_KEY)
html_output = generate_html(config)
import re
html_output = re.sub(r"`.*?`", "", html_output, flags=re.DOTALL)

with open("output.html", "w") as f:
    f.write(html_output)

