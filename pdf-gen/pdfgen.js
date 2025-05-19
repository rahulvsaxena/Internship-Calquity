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
 * @typedef {Object} HistoricalData
 * @property {string} date
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} close
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
 * @property {HistoricalData[]} historicalData
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
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import getFinancialConfig from './get_config_cqnow.js';
import yahooFinance from 'yahoo-finance2';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateHtml = async (config) => {
    // Helper to generate a pastel color from the symbol
    function getPastelColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 70%, 85%)`;
    }

    // Helper to generate a darker color for the text based on the pastel background
    function getDarkerColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 70%, 35%)`;
    }

    //default header
    let headerHtml = `
      <header class="text-primary-foreground p-6 rounded-t-2xl mb-8 avoid-break" style="background-color: #3B697E;">
          <div class="flex items-center gap-4">
              <div>
                  <h1 class="text-3xl font-bold text-left">${config.header.title}</h1>
                  <p class="text-sm opacity-90 text-left">${config.header.date}</p>
              </div>
          </div>
      </header>
  `;

    if (config.header.logo && config.header.logo.startsWith('http')) {
        headerHtml = `
      <header class="text-primary-foreground p-6 rounded-t-2xl mb-8 avoid-break" style="background-color: #3B697E;">
            <div class="flex items-center gap-4">
                <img src="${config.header.logo}" class="h-12 rounded-sm">
                <div>
                    <h1 class="text-3xl font-bold text-left">${config.header.title}</h1>
                    <p class="text-sm opacity-90 text-left">${config.header.date}</p>
                </div>
            </div>
        </header>
      `;
    }

//for a specific broker use this custom header
// let logoBase64 = '';
// try {
//     const logoPath = 'bcb1.png'; // Path to your logo file
//     const logoData = fs.readFileSync(logoPath);
//     logoBase64 = logoData.toString('base64');
// } catch (error) {
//     console.error('Error reading logo file:', error);
// }
// let headerHtml = `
// <header class="p-3 rounded-t-2xl avoid-break" style="background-color: white;">
// <div class="flex justify-between items-end mb-1">
//     <img src="data:image/jpeg;base64,${logoBase64}" style="height: 70px;" class="rounded-sm">
//     <div class="flex flex-col items-end">
//         <h1 class="text-2xl text-black m-0">BCB Weekly</h1>
//         <p class="text-sm opacity-90 text-black mt-1">${config.header.date}</p>
//     </div>
// </div>
// <div class="border-b w-full" style="border-width: 1.5px; border-color: #0066A1;"></div>
// </header>
// `

    const marketOverviewRows = await Promise.all(config.companies.map(async company => {
        const weeklyChangeIcon = company.weeklyChange.includes('+')
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';

        const weeklyChangeColor = company.weeklyChange.includes('+') ? "text-green-600" : "text-red-600";
        const ytdChangeIcon = company.ytdChange.includes('+')
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';

        const ytdChangeColor = company.ytdChange.includes('+') ? "text-green-600" : "text-red-600";

        const getPastelLogoHtml = (symbol, name) => {
            return `<div class="rounded-full flex items-center justify-center">
                <div class="rounded-full flex items-center justify-center"
                    style="
                      width: 24px; height: 24px;
                      background: ${getPastelColor(symbol)};
                      color: ${getDarkerColor(symbol)};
                      font-family: 'Inter', sans-serif;
                      font-weight: 700;
                      font-size: 12px;
                    ">
                    ${name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                </div>
            </div>`;
        };

        let logoHtml;
        if (company.icon && company.icon.startsWith('http')) {
            try {
                const response = await fetch(company.icon);
                logoHtml = response.status === 200 
                    ? `<img src="${company.icon}" class="h-6 w-6 rounded-full object-cover">`
                    : getPastelLogoHtml(company.symbol, company.name);
            } catch (error) {
                logoHtml = getPastelLogoHtml(company.symbol, company.name);
            }
        } else {
            logoHtml = getPastelLogoHtml(company.symbol, company.name);
        }

        return `
          <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td class="p-2 align-middle font-medium">
                  <div class="flex items-center gap-2 justify-start">
                    ${logoHtml}
                    <span class="text-left">${company.name} (${company.symbol})</span>
                  </div>
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
    }));

    const generateGeneralInsights = () => {
        if (!config.generalInsights?.length) return '';

        const insightsItems = config.generalInsights.map(insight => `
          <div class="p-3 bg-muted rounded-lg avoid-break">
            <div class="w-full flex items-center justify-between mb-1">

              <div class="font-semibold">${insight.title}</div>
              <div class="font-semibold" style="color: #3B697E">${insight.category}</div>

              </div>
              <p class="text-left text-sm mt-1">${insight.description}</p>
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
          <div class="p-3 bg-muted rounded-lg avoid-break">
            <div class="w-full flex items-center justify-between mb-1">
              <div class="font-semibold text-blue-700 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <a href="${report.link}" target="_blank">${report.title}</a></div>
              <div class="font-semibold" style="color: #3B697E">${report.category}</div>
            </div>
            <div class="text-sm text-left mt-1">
                ${report.summary}
            </div>
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

    const generateCompanyUpdates = async () => {
        const companyUpdates = await Promise.all(config.companies.map(async company => {
            let logoHtml;
            if (company.icon && company.icon.startsWith('http')) {
                try {
                    // Use the same approach as in the Watchlist Overview for consistency
                    const response = await fetch(company.icon);
                    logoHtml = response.status === 200 
                        ? `<img src="${company.icon}" class="h-10 w-10 rounded-full object-cover">`
                        : `<div class="rounded-full flex items-center justify-center">
                            <div class="rounded-full flex items-center justify-center"
                                style="
                                  width: 32px; height: 32px;
                                  background: ${getPastelColor(company.symbol)};
                                  color: ${getDarkerColor(company.symbol)};
                                  font-family: 'Inter', sans-serif;
                                  font-weight: 700;
                                  font-size: 14px;
                                ">
                                ${company.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                            </div>
                          </div>`;
                } catch (error) {
                    logoHtml = `<div class="rounded-full flex items-center justify-center">
                        <div class="rounded-full flex items-center justify-center"
                            style="
                              width: 32px; height: 32px;
                              background: ${getPastelColor(company.symbol)};
                              color: ${getDarkerColor(company.symbol)};
                              font-family: 'Inter', sans-serif;
                              font-weight: 700;
                              font-size: 14px;
                            ">
                            ${company.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                      </div>`;
                }
            } else {
                logoHtml = `<div class="rounded-full flex items-center justify-center">
                    <div class="rounded-full flex items-center justify-center"
                        style="
                          width: 32px; height: 32px;
                          background: ${getPastelColor(company.symbol)};
                          color: ${getDarkerColor(company.symbol)};
                          font-family: 'Inter', sans-serif;
                          font-weight: 700;
                          font-size: 14px;
                        ">
                        ${company.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                </div>`;
            }

            if (!company.news?.length) {
                return '';
            }

            // Get the chart image path
            const chartImagePath = path.join(__dirname, 'historical_data', `${company.symbol.toLowerCase()}_chart.png`);
            const chartImageHtml = fs.existsSync(chartImagePath) 
                ? `<div class="w-full mb-4">
                    <img src="data:image/png;base64,${fs.readFileSync(chartImagePath).toString('base64')}" 
                         alt="${company.name} Price Chart" 
                         class="w-full h-auto rounded-lg shadow-sm" />
                   </div>`
                : '';

            const keyMetricsHtml = company.keyMetrics && Object.keys(company.keyMetrics).length ? `
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
                if (!company.technicalSignals || !Object.keys(company.technicalSignals).length) return '';

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

            function imageToBase64Html(imagePath) {
                // Read image file
                const image = fs.readFileSync(imagePath);
                // Convert to base64
                const base64 = image.toString('base64');
                // Get image type from file extension
                const ext = path.extname(imagePath).substring(1);
                // Generate HTML
                return `<img src="data:image/${ext};base64,${base64}" alt="Publication" style="height: 12px; width: auto; margin-right: 5px" />`;
            }

            const generateNewsHtml = () => {
                if (!company.news?.length) return '';
            
                const sentimentColors = {
                    positive: ['green', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'],
                    neutral: ['gray', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'],
                    negative: ['red', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'],
                    mixed: ['gray', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>']
                };
            
                const sections = company.news.map((section, sectionIndex) => {
                    const bulletPoints = section.html_bullets.map(bullet => {
                        let color, icon;
                        if (bullet.sentiment === "positive" || bullet.sentiment === "negative" || bullet.sentiment === "neutral") {
                            [color, icon] = sentimentColors[bullet.sentiment] || sentimentColors["neutral"];
                        } else {
                            [color, icon] = sentimentColors["neutral"];
                        }
                        
                        return `
                            <li class="flex items-start gap-2 text-left">
                                <div class="inline-flex items-center justify-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-${color}-100 text-${color}-700 shrink-0 mt-half">
                                    ${icon}
                                </div>
                                <span class="text-${color}-700 text-left">
                                    ${bullet.point.replace(/<\/?b>/g, '')}
                                </span>
                            </li>
                        `;
                    }).join('');

                    const logoMap = {
                        'economictimes.indiatimes.com': 'etlogo.jpg',
                        'moneycontrol.com': 'moneycontrol.png',
                        'business-standard.com': 'businessstandardlogo.webp',
                        'livemint.com': 'livemintlogo.png',
                        'youtube.com': 'youtubelogo.png'
                    };

                    const getSourceIdentifier = (link) => {
                        const domain = Object.keys(logoMap).find(domain => link.includes(domain));
                        if (domain) {
                            return `${imageToBase64Html(logoMap[domain])}`;
                        }
                        if (link.includes('bseindia.com')) return 'BSE';
                        if (link.includes('nsearchives.nseindia.com')) return 'NSE';
                        return ``;
                    };
            
                    const validLinkBadges = [];
                    for (let i = 0; i < section.links.length; i++) {
                        const link = section.links[i];
                        const sourceIdentifier = getSourceIdentifier(link);
                        if (sourceIdentifier) {  // Only add if there is a valid source identifier
                            validLinkBadges.push(`
                                <a href="${link}" target="_blank" class="inline-flex items-center justify-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 shrink-0 mt-half">
                                    ${sourceIdentifier}
                                    Source ${i + 1}
                                </a>
                            `);
                        }
                    }

                    // Only add the container div if there are valid badges
                    const linkBadgesHtml = validLinkBadges.length > 0 
                        ? `<div class="grid grid-cols-6 gap-2 flex-wrap ml-8">${validLinkBadges.join('')}</div>`
                        : '';
            
                    return `
                        <div class="mb-4">
                            <div class="text-left ml-4 font-italic text-gray-700 mb-1"><b>${sectionIndex + 1}. ${section.heading}</b></div>
                            <ul class="mb-2 ml-8">
                                ${bulletPoints}
                            </ul>
                            ${linkBadgesHtml}
                        </div>
                    `;
                }).join('');
            
                return `
                    <div>
                        <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>
                        ${sections}
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
                  <div class="p-3 bg-muted rounded-lg avoid-break">
                    <div class="w-full flex items-center justify-between mb-1">
        
                      <div class="font-semibold">${insight.title}</div>
                      <div class="font-semibold" style="color: #3B697E">${insight.category}</div>
        
                      </div>
                      <p class="text-left text-sm mt-1">${insight.description}</p>
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
                  <div class="p-3 bg-muted rounded-lg avoid-break">
                    <div class="w-full flex items-center justify-between mb-1">
                      <div class="font-semibold text-blue-700 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      <a href="${report.link}" target="_blank">${report.title}</a></div>
                      <div class="font-semibold" style="color: #3B697E">${report.category}</div>
                    </div>
                    <div class="text-sm text-left mt-1">
                        ${report.summary}
                    </div>
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

            const isNumeric = /^\d+$/.test(company.symbol);
            if (isNumeric && company.news.length === 0) {
                return "";
            }

            return `
              <div class="rounded-xl border bg-card text-card-foreground avoid-break">
                <div class="flex flex-col space-y-1.5 p-4 bg-secondary rounded-t-xl company-update">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      ${logoHtml}
                      <div style="margin-left: 0.75rem; display: flex; flex-direction: column; align-items: flex-start;">
                        <span style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; color: #1A202C;">${company.name}</span>
                        <span style="font-family: 'Inter', sans-serif; font-size: 13px; color: #6B7280;">${company.symbol}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      ${generateTechnicalTriggers()}
                      <div class="text-base mt-1 font-semibold ${company.weeklyChange.includes('+') ? 'text-green-600' : 'text-red-600'}">${company.weeklyClose}</div>
                    </div>
                  </div>
                </div>
                <div class="p-4">
                  <div class="space-y-4">
                    ${chartImageHtml}
                    ${generateInsightsHtml()}
                    ${generateAnalystReportsHtml()}
                    ${generateNewsHtml()}
                    ${generateBlockDealsHtml()}
                  </div>
                </div>
              </div>
            `;
        }));
        
        return companyUpdates.join('');
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
                        ${config.companies.length ? `<section class="mb-8 avoid-break">
                            <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">Watchlist Overview</h2>
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
                                            ${(await Promise.all(marketOverviewRows)).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>` : '<section class="mb-8 avoid-break"><h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">Watchlist Overview</h2><div class="rounded-xl border bg-card text-card-foreground"><div class="p-6 text-center">No companies in your watchlist</div></div></section>'}
                        ${generateGeneralInsights()}
                        ${generateGeneralAnalystReports()}
                        <section>
                            <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">Company Updates</h2>
                            <div class="grid grid-cols-1 gap-6">
                                ${await generateCompanyUpdates()}
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

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// Helper function to get date 30 days ago
const getDate30DaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
};

const saveHistoricalDataToFile = async (companies) => {
    try {
        // Use absolute path for the data directory
        const dataDir = path.join(__dirname, 'historical_data');
        console.log('Attempting to create directory at:', dataDir);
        
        if (!fs.existsSync(dataDir)) {
            try {
                fs.mkdirSync(dataDir, { recursive: true });
                console.log('Created directory:', dataDir);
            } catch (mkdirError) {
                console.error('Error creating directory:', mkdirError);
                // Try alternative location
                const altDataDir = path.join(process.cwd(), 'historical_data');
                console.log('Trying alternative directory:', altDataDir);
                fs.mkdirSync(altDataDir, { recursive: true });
                console.log('Created alternative directory:', altDataDir);
            }
        } else {
            console.log('Directory already exists:', dataDir);
        }

        // Create an object to store all companies' data
        const allCompaniesData = {};

        // Get date range for last 30 days
        const endDate = new Date();
        const startDate = getDate30DaysAgo();

        // Fetch and store data for each company
        for (const company of companies) {
            try {
                console.log(`Fetching data for ${company.symbol}...`);
                
                // Add .NS suffix for Indian stocks
                const symbol = company.symbol.includes('.') ? company.symbol : `${company.symbol}.NS`;
                
                const queryOptions = {
                    period1: formatDate(startDate),
                    period2: formatDate(endDate),
                    interval: '1d'
                };

                const data = await yahooFinance.historical(symbol, queryOptions);
                console.log(`Successfully fetched ${data.length} days of data for ${company.symbol}`);

                allCompaniesData[company.symbol] = {
                    name: company.name,
                    data: data.map(row => ({
                        date: formatDate(new Date(row.date)),
                        open: row.open,
                        high: row.high,
                        low: row.low,
                        close: row.close,
                        volume: row.volume
                    }))
                };
            } catch (error) {
                console.error(`Error fetching historical data for ${company.symbol}:`, error);
            }
        }

        // Try both possible file paths
        const filePaths = [
            path.join(dataDir, 'all_companies_historical_data.json'),
            path.join(process.cwd(), 'historical_data', 'all_companies_historical_data.json')
        ];

        let fileWritten = false;
        for (const filePath of filePaths) {
            try {
                console.log('Attempting to write file at:', filePath);
                fs.writeFileSync(filePath, JSON.stringify(allCompaniesData, null, 2));
                console.log('Successfully wrote data to file:', filePath);
                
                // Verify file was created
                if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    console.log('File size:', stats.size, 'bytes');
                    fileWritten = true;
                    break;
                }
            } catch (writeError) {
                console.error(`Failed to write to ${filePath}:`, writeError);
            }
        }

        if (!fileWritten) {
            console.error('Failed to write file to any location');
        }

        return fileWritten;
    } catch (error) {
        console.error('Error in saveHistoricalDataToFile:', error);
        return false;
    }
};

const generateCleanedHtml = async (userId, brokerId, brokerLogo) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    const config = await getFinancialConfig(userId, brokerId, brokerLogo, SUPABASE_URL, SUPABASE_KEY);
    if (!config.companies || !config.companies.length) {
        return {
            html: null,
            brokerName: null
        };
    }

    // Save historical data to a single file for testing
    const dataSaved = await saveHistoricalDataToFile(config.companies);
    
    if (dataSaved) {
        // Import and call plot_stock.js to generate charts
        const { generateAllCharts } = await import('./plot_stock.js');
        await generateAllCharts();
    }

    // Fetch historical data for each company
    const endDate = new Date();
    const startDate = getDate30DaysAgo();

    for (const company of config.companies) {
        try {
            // Add .NS suffix for Indian stocks
            const symbol = company.symbol.includes('.') ? company.symbol : `${company.symbol}.NS`;
            
            const queryOptions = {
                period1: formatDate(startDate),
                period2: formatDate(endDate),
                interval: '1d'
            };

            const data = await yahooFinance.historical(symbol, queryOptions);
            company.historicalData = data.map(row => ({
                date: formatDate(new Date(row.date)),
                open: row.open,
                high: row.high,
                low: row.low,
                close: row.close,
                volume: row.volume
            }));
        } catch (error) {
            console.error(`Error fetching historical data for ${company.symbol}:`, error);
        }
    }

    const htmlOutput = await generateHtml(config);

    // Remove any backtick content
    const cleanedHtml = htmlOutput.replace(/`.*?`/g, '');

    return {
        html: cleanedHtml,
        brokerName: config.header.brokerName
    }
};

export { saveHistoricalDataToFile };
export default generateCleanedHtml;

