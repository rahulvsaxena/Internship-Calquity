// TypeScript interfaces for type definitions
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
 * @property {string} [ISIN]
 * @property {string} icon
 * @property {string} weeklyClose
 * @property {string} weeklyChange
 * @property {string} ytdChange
 * @property {KeyMetrics} [keyMetrics]
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

/**
 * Generates HTML report from financial data configuration
 * @param {Config} config - The configuration object containing financial data
 * @returns {string} The generated HTML string
 */
import fs from 'fs';
import dotenv from 'dotenv';
import getFinancialConfig from './get_config_cqnow.js';

dotenv.config();
const generateHtml = (config) => {
  let headerHtml = `
      <header class="text-primary-foreground p-6 rounded-t-2xl mb-8 avoid-break" style="background-color: #0b4177;">
          <div class="flex items-center gap-4">${config.header.logo}
              <div>
                  <h1 class="text-3xl font-bold text-left">${config.header.title}</h1>
                  <p class="text-sm opacity-90 text-left">${config.header.date}</p>
              </div>
          </div>
      </header>
  `;

  if (config.header.logo.startsWith('http')) {
      headerHtml = `
        <header class="text-primary-foreground p-6 rounded-t-2xl mb-8 avoid-break" style="background-color: #0b4177;">
            <div class="flex items-center gap-4"><img src=${config.header.logo} class="h-12 rounded-sm">
                <div>
                    <h1 class="text-3xl font-bold text-left">${config.header.title}</h1>
                    <p class="text-sm opacity-90 text-left">${config.header.date}</p>
                </div>
            </div>
        </header>
      `;
  }

  const marketOverviewRows = config.companies.map(company => {
      const weeklyChangeIcon = company.weeklyChange.includes('+') 
          ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';
      
      const weeklyChangeColor = company.weeklyChange.includes('+') ? "text-green-600" : "text-red-600";
      const ytdChangeIcon = company.ytdChange.includes('+') 
          ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';
      
      const ytdChangeColor = company.ytdChange.includes('+') ? "text-green-600" : "text-red-600";

      return `
          <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td class="p-2 align-middle font-medium">
                  <div class="flex items-center gap-2"><img src="${company.icon}" class="h-4 rounded-sm"><span>${company.name} (${company.symbol})</span></div>
              </td>
              <td class="p-2 align-middle text-center">${company.weeklyClose}</td>
              <td class="p-2 align-middle text-center py-3">
                  <div class="flex items-center justify-center gap-1 font-medium ${weeklyChangeColor}">${weeklyChangeIcon}${company.weeklyChange}</div>
              </td>
              <td class="p-2 align-middle text-center">
                  <div class="flex items-center justify-center gap-1 font-medium ${ytdChangeColor}">${ytdChangeIcon}${company.ytdChange}</div>
              </td>
          </tr>
      `;
  }).join('');

  const generateGeneralInsights = () => {
      if (!config.generalInsights?.length) return '';

      const insightsItems = config.generalInsights.map(insight => `
          <div class="p-3 bg-muted rounded-lg">
              <h4 class="font-semibold mb-1 text-left">${insight.title}</h4>
              <p class="text-left">${insight.description}</p>
          </div>
      `).join('');

      return `
          <section class="mb-8 avoid-break">
              <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">General Insights</h2>
              <div class="space-y-4">
                  ${insightsItems}
              </div>
          </section>
      `;
  };

  const generateGeneralAnalystReports = () => {
      if (!config.generalAnalystReports?.length) return '';

      const reportsItems = config.generalAnalystReports.map(report => `
          <div class="p-3 bg-muted rounded-lg">
              <h4 class="font-semibold mb-1 text-left"><a href="${report.link}" target="_blank">${report.title}</a></h4>
          </div>
      `).join('');

      return `
          <section class="mb-8 avoid-break">
              <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">Reports from the Analysts' Desk</h2>
              <div class="space-y-4">
                  ${reportsItems}
              </div>
          </section>
      `;
  };

  const generateCompanyUpdates = () => {
      return config.companies.map(company => {
          const keyMetricsHtml = company.keyMetrics ? `
              <div class="grid grid-cols-${Object.keys(company.keyMetrics).length} gap-4 mb-4 p-3 rounded-lg justify-center avoid-break key-metric">
                  ${Object.entries(company.keyMetrics).map(([k, v]) => `
                      <div class="flex flex-col justify-center flex-1 gap-2 p-2 bg-secondary rounded-md">
                          <p class="text-sm text-muted-foreground">${k.replace("_", " ")}</p>
                          <p class="font-semibold">${v}</p>
                      </div>
                  `).join('')}
              </div>
          ` : '';

          const generateTechnicalTriggers = () => {
              if (!company.technicalSignals) return '';

              const signalsInfo = {
                  fiftyTwoWeekHigh: ["52 Week High", "green"],
                  fiftyTwoWeekLow: ["52 Week Low", "red"],
                  rsiOverbought: ["RSI Overbought", "yellow"],
                  rsiOversold: ["RSI Oversold", "yellow"],
                  macdBullish: ["MACD Bullish", "green"],
                  macdBearish: ["MACD Bearish", "red"]
              };

              const trueSignals = Object.entries(company.technicalSignals)
                  .filter(([_, value]) => value)
                  .map(([key]) => {
                      const [text, color] = signalsInfo[key];
                      return `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold border-transparent bg-${color}-100 text-${color}-700">${text}</span>`;
                  })
                  .join('');

              return trueSignals ? `<div class="flex flex-wrap gap-1">${trueSignals}</div>` : '';
          };

          const generateNewsHtml = () => {
              if (!company.news?.length) return '';

              const newsItems = company.news.map(news => {
                  const sentimentColors = {
                      positive: ['green', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'],
                      neutral: ['gray', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'],
                      negative: ['red', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>']
                  };

                  const [color, icon] = sentimentColors[news.sentiment];

                  return `
                      <li class="flex items-start gap-2 text-left">
                          <div class="inline-flex items-center justify-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-${color}-100 text-${color}-700 shrink-0 mt-half">
                              ${icon}
                          </div>
                          <span class="text-${color}-700 text-left">
                              <a href="${news.link}" style="text-decoration: none; color: inherit;" target="_blank">${news.text}</a>
                          </span>
                      </li>
                  `;
              }).join('');

              return `
                  <div>
                      <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>
                      <ul class="space-y-3">
                          ${newsItems}
                      </ul>
                  </div>
              `;
          };

          const generateBlockDealsHtml = () => {
              if (!company.blockDeals?.length) return '';

              return `
                  <div class="bg-muted p-3 rounded-lg">
                      <h4 class="font-semibold mb-2 text-left">Block Deals</h4>
                      <ul class="list-disc list-inside space-y-1 text-left ml-2">
                          ${company.blockDeals.map(deal => `<li>${deal}</li>`).join('')}
                      </ul>
                  </div>
              `;
          };

          const generateInsightsHtml = () => {
              if (!company.insights?.length) return '';

              const insightsItems = company.insights.map(insight => `
                  <div class="p-3 bg-muted rounded-lg">
                      <h4 class="font-semibold mb-1 text-left">${insight.title}</h4>
                      <p class="text-left">${insight.description}</p>
                  </div>
              `).join('');

              return `
                  <div class="mb-4">
                      <h4 class="font-semibold mb-2 text-left">Insights from the Analysts' Desk</h4>
                      <div class="space-y-3">
                          ${insightsItems}
                      </div>
                  </div>
              `;
          };

          const generateAnalystReportsHtml = () => {
              if (!company.analystReports?.length) return '';

              const reportsItems = company.analystReports.map(report => `
                  <div class="p-3 bg-muted rounded-lg">
                      <h4 class="font-semibold mb-1 text-left"><a href="${report.link}" target="_blank">${report.title}</a></h4>
                  </div>
              `).join('');

              return `
                  <div class="mb-4">
                      <h4 class="font-semibold mb-2 text-left">Reports from the Analysts' Desk</h4>
                      <div class="space-y-3">
                          ${reportsItems}
                      </div>
                  </div>
              `;
          };

          return `
              <div class="rounded-xl border bg-card text-card-foreground avoid-break">
<div class="flex flex-col space-y-1.5 p-6 bg-secondary rounded-t-xl company-update">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 font-semibold text-xl text-left">
                                <img src="${company.icon}" class="h-6 rounded-sm">${company.name} (${company.symbol})
                            </div>
                            <div>
                                ${generateTechnicalTriggers()}
                                <div class="text-base mt-1 font-semibold ${company.weeklyChange.includes('+') ? 'text-green-600' : 'text-red-600'}">${company.weeklyClose}</div>
                            </div>
                        </div>
                    </div>
                    <div class="p-4">
                        ${keyMetricsHtml}
                        <div class="space-y-4">
                            ${generateInsightsHtml()}
                            ${generateAnalystReportsHtml()}
                            ${generateNewsHtml()}
                            ${generateBlockDealsHtml()}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CQNowReport</title>
    <style>
        ${fs.readFileSync('styles.css', 'utf8')}
    </style>
</head>
<body>
    <div id="root">
        <div class="min-h-screen bg-background p-4 w-screen">
            <div class="max-w-7xl mx-auto">
                <div class="bg-white w-full relative">
                    <div class="px-4">
                        ${headerHtml}
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
                                            ${marketOverviewRows}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                        ${generateGeneralInsights()}
                        ${generateGeneralAnalystReports()}
                        <section>
                            <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">Company Updates</h2>
                            <div class="grid grid-cols-1 gap-6">
                                ${generateCompanyUpdates()}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
};


async function generateCleanedHtml(userId, brokerId, brokerLogo) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    const config = await getFinancialConfig(userId, brokerId, brokerLogo, SUPABASE_URL, SUPABASE_KEY);
    const htmlOutput = generateHtml(config);

    // Remove any backtick content
    const cleanedHtml = htmlOutput.replace(/`.*?`/g, '');
    return {
        html: cleanedHtml,
        brokerName: config.header.brokerName
    }
}

export default generateCleanedHtml;

