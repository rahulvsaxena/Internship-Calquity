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

const companyJsonDir = path.join(__dirname, 'company_json');
if (!fs.existsSync(companyJsonDir)) {
    fs.mkdirSync(companyJsonDir, { recursive: true });
}

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

    // Function to read corporate actions from JSON file
    const getCorporateActions = () => {
        try {
            const corporateActionsPath = path.join(__dirname, '..', 'corporate_actions', 'corporate_actions_latest.json');
            
            if (fs.existsSync(corporateActionsPath)) {
                const data = fs.readFileSync(corporateActionsPath, 'utf8');
                return JSON.parse(data);
            }
            return [];
        } catch (error) {
            console.error('Error reading corporate actions:', error);
            return [];
        }
    };

    // Debug function to show all corporate actions (for testing)
    const generateAllCorporateActionsDebug = () => {
        const corporateActions = getCorporateActions();
        if (!corporateActions.length) return '';

        console.log(`Total corporate actions found: ${corporateActions.length}`);
        corporateActions.forEach((action, index) => {
            console.log(`${index + 1}. ${action.short_name} (${action.NSE_Symbol}) - ${action.Purpose} - ${action.Ex_date}`);
        });

        // Show ALL actions without date filtering for debugging
        const allActions = corporateActions;

        if (!allActions.length) return '';

        const actionsHtml = allActions.map(action => {
            const actionType = action.Purpose.includes('Dividend') ? 'Dividend' : 
                             action.Purpose.includes('Bonus') ? 'Bonus' : 
                             action.Purpose.includes('Split') ? 'Stock Split' : 
                             action.Purpose.includes('Rights') ? 'Rights Issue' : 'Corporate Action';
            
            // Check if this action is in your portfolio
            const isInPortfolio = config.companies.some(company => 
                company.symbol === action.NSE_Symbol || 
                company.symbol === action.short_name ||
                company.name === action.long_name
            );
            
            const portfolioBadge = isInPortfolio ? 
                '<span class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">In Portfolio</span>' : 
                '<span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">Not in Portfolio</span>';

            return `
                <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-gray-800">${action.short_name}</span>
                            <span class="text-sm text-gray-600">(${action.NSE_Symbol})</span>
                            ${portfolioBadge}
                        </div>
                        <span class="text-sm text-gray-600 font-medium">${action.Ex_date}</span>
                    </div>
                    <div class="text-sm text-gray-700 mb-2">
                        <strong>Type:</strong> ${actionType}
                    </div>
                    <div class="text-sm text-gray-700">
                        <strong>Purpose:</strong> ${action.Purpose}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <section class="mb-8 avoid-break">
                <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">All Corporate Actions (Debug - Including Non-Portfolio)</h2>
                <div class="space-y-3">
                    ${actionsHtml}
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
                ? `<div style="width: 100%; max-width: 700px;">
                    <img src="data:image/png;base64,${fs.readFileSync(chartImagePath).toString('base64')}" 
                         alt="${company.name} Price Chart" 
                         style="width: 100%; max-width: 700px; height: auto; border-radius: 0.5rem;" />
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

            const generateCorporateActionsHtml = () => {
                const corporateActions = getCorporateActions();
                if (!corporateActions.length) return '<div class="p-3 bg-blue-50 rounded-lg border border-blue-200 text-gray-600"><span style="font-size: 1rem; font-weight: 600;">no recent corporate actions in the past month</span></div>';

                // Debug: Log all corporate actions for this company
                console.log(`Checking corporate actions for company: ${company.name} (${company.symbol})`);

                // Filter corporate actions for this company
                const companyActions = corporateActions.filter(action => 
                    action.NSE_Symbol === company.symbol || 
                    action.short_name === company.symbol ||
                    action.long_name === company.name
                );
                // Debug: Log matched actions
                if (companyActions.length > 0) {
                    console.log(`Found ${companyActions.length} corporate actions for ${company.name}:`, 
                        companyActions.map(a => `${a.short_name} - ${a.Purpose} (${a.Ex_date})`));
                }

                // Filter for recent/future actions (within last 36 months or next 36 months)
                const now = new Date();
                const sixMonthsAgo = new Date(now.getTime() - (72 * 30 * 24 * 60 * 60 * 1000));
                const sixMonthsFromNow = new Date(now.getTime() + (72 * 30 * 24 * 60 * 60 * 1000));

                const recentActions = companyActions.filter(action => {
                    try {
                        const exDate = new Date(action.Ex_date);
                        const isRecent = exDate >= sixMonthsAgo && exDate <= sixMonthsFromNow;
                        if (!isRecent) {
                            console.log(`Filtered out old action for ${company.name}: ${action.Purpose} (${action.Ex_date})`);
                        }
                        return isRecent;
                    } catch (error) {
                        // If date parsing fails, include the action
                        console.log(`Date parsing failed for ${company.name}: ${action.Ex_date}`);
                        return true;
                    }
                });

                // Debug: Log recent actions
                if (recentActions.length > 0) {
                    console.log(`Found ${recentActions.length} recent corporate actions for ${company.name}`);
                }

                if (!recentActions.length) {
                    return '<div class="p-3 bg-blue-50 rounded-lg border border-blue-200 text-gray-600"><span style="font-size: 0.9rem; font-weight: 200;">no recent corporate actions in the past month</span></div>';
                }

                const actionsHtml = recentActions.map(action => {
                    const actionType = action.Purpose.includes('Dividend') ? 'Dividend' : 
                                     action.Purpose.includes('Bonus') ? 'Bonus' : 
                                     action.Purpose.includes('Split') ? 'Stock Split' : 
                                     action.Purpose.includes('Rights') ? 'Rights Issue' : 'Corporate Action';
                    
                    const actionIcon = actionType === 'Dividend' ? 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dollar-sign"><line x1="12" x2="12" y1="1" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' :
                        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';

                    return `
                        <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    <div class="text-blue-600">
                                        ${actionIcon}
                                    </div>
                                    <span class="font-semibold text-blue-800">${actionType}</span>
                                </div>
                                <span class="text-sm text-blue-600 font-medium">${action.Ex_date}</span>
                            </div>
                            <div class="text-sm text-gray-700 mb-2">
                                <strong>Purpose:</strong> ${action.Purpose}
                            </div>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="mb-4">
                        <div class="space-y-3">
                            ${actionsHtml}
                        </div>
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

            // Generate Corporate Actions HTML and check if there are actions
            const corporateActionsHtml = generateCorporateActionsHtml();
            const hasCorporateActions = corporateActionsHtml && corporateActionsHtml.trim() !== '';

            // Flex row for chart and corporate actions
            const chartAndActionsHtml = hasCorporateActions ? `
                <div style="display: flex; gap: 2rem; align-items: flex-start; width: 100%;">
                    <div style="flex: 1 1 0; min-width: 0;">${chartImageHtml}</div>
                    <div style="flex: 1 1 0; min-width: 0;">${corporateActionsHtml}</div>
                </div>
            ` : chartImageHtml;

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
                    ${chartAndActionsHtml}
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

    // Portfolio vs Benchmark section
    const portfolioChange = await getPortfolioWeeklyChange();
    const niftyChange = await getBenchmarkWeeklyChange('^NSEI');
    const sensexChange = await getBenchmarkWeeklyChange('^BSESN');
    const nextNiftyChange = await getBenchmarkWeeklyChange('^NSMIDCP');
    const portfolioTotalValue = await getPortfolioTotalValue();

    // Get initial portfolio value using weighted average from securities_data.csv
    const getInitialPortfolioValue = () => {
        const records = parseSimpleCSV(path.join(__dirname, 'securities_data.csv'));
        const stockMap = {};
        
        // Calculate weighted average price for each stock
        for (const row of records) {
            const symbol = row.Securities.trim();
            const qty = parseFloat(row.Quantity);
            const rate = parseFloat(row.Rate);
            
            if (!stockMap[symbol]) {
                stockMap[symbol] = {
                    totalQty: 0,
                    totalValue: 0
                };
            }
            
            stockMap[symbol].totalQty += qty;
            stockMap[symbol].totalValue += qty * rate;
        }
        
        // Calculate initial portfolio value using weighted average prices
        let initialValue = 0;
        for (const symbol in stockMap) {
            const weightedAvgPrice = stockMap[symbol].totalValue / stockMap[symbol].totalQty;
            initialValue += stockMap[symbol].totalQty * weightedAvgPrice;
        }
        
        return initialValue;
    };

    const initialPortfolioValue = getInitialPortfolioValue();
    const portfolioValueChange = ((portfolioTotalValue - initialPortfolioValue) / initialPortfolioValue) * 100;

    // Generate chart data
    const chartData = {
        labels: ['Your Portfolio', 'Nifty 50', 'Sensex', 'Next Nifty'],
        datasets: [{
            label: 'Change (%)',
            data: [
                Number(portfolioChange.toFixed(2)),
                Number(niftyChange.toFixed(2)),
                Number(sensexChange.toFixed(2)),
                Number(nextNiftyChange.toFixed(2))
            ],
            backgroundColor: [
                '#0A2463', // Deep navy for portfolio
                '#1E40AF', // Blue-800
                '#2563EB', // Blue-600
                '#3B82F6', // Blue-500
            ],
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 1,
        }]
    };

    // Generate chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 2,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw}%`;
                    }
                }
            },
            datalabels: {
                color: function(context) {
                    return context.dataset.backgroundColor[context.dataIndex];
                },
                anchor: 'end',
                align: 'top',
                formatter: function(value) {
                    return value + '%';
                },
                font: {
                    weight: 'bold',
                    size: 12
                },
                padding: {
                    top: -14,
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(10, 36, 99, 0.1)',
                    lineWidth: 1,
                },
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    },
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            }
        },
        elements: {
            bar: {
                borderWidth: 0,
                borderRadius: 4,
            }
        },
        layout: {
            padding: {
                top: 20
            }
        }
    };

    // Generate chart HTML
    const chartHtml = `
        <div class="p-4 rounded-lg" style="background-color: white; border: 1px solid #E5E7EB; border-radius: 8px; height: 305px;">
            <h2 class="text-lg font-semibold mb-3 text-left" style="color: #162F6C;">Portfolio vs Benchmarks</h2>
            <div class="h-36" style="position: relative;">
                <canvas id="portfolioComparisonChart" style="width: 100% !important; height: 100% !important;"></canvas>
            </div>
            <div class="mt-4 p-3 rounded-lg text-center" style="background-color: #0A2463;">
                <p class="text-sm" style="color: #B6D4F5;">Total Portfolio Value</p>
                <div class="flex items-center justify-center gap-2">
                    <p class="text-xl font-bold mt-1" style="color: white;">₹${portfolioTotalValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                    <p class="text-sm font-bold mt-1 px-2 py-0.5 rounded-xl" style="background-color: ${portfolioValueChange >= 0 ? '#15803d' : '#b91c1c'}; color: white; font-weight: 700;">
                        ${portfolioValueChange >= 0 ? '+' : ''}${portfolioValueChange.toFixed(2)}%
                    </p>
                </div>
            </div>
        </div>
    `;

    // Add Chart.js script to the HTML
    const chartScript = `
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                Chart.register(ChartDataLabels);
                const ctx = document.getElementById('portfolioComparisonChart');
                new Chart(ctx, {
                    type: 'bar',
                    data: ${JSON.stringify(chartData)},
                    options: ${JSON.stringify(chartOptions)}
                });
            });
        </script>
    `;

    const portfolioVsBenchmarkHtml = chartHtml + chartScript;

    const { topMovers, topLosers } = await getTopMoversAndLosers();
    const topMoversHtml = `
        <div class="p-4 rounded-lg" style="background-color: white; border: 1px solid #E5E7EB; border-radius: 8px; height: 220px; width: 348px; margin-top: -240px;">
            <h2 class="text-lg font-semibold mb-4 text-left" style="color: #162F6C;">Top Movers / Losers</h2>
            
            <div class="grid grid-cols-2 gap-4 w-full">
                <div class="w-full">
                <div class="space-y-3">
                    ${topMovers.map(m => `
                        <div class="flex flex-col bg-white py-1.5 px-2 rounded-lg w-full" style="border: 1px solid #E5E7EB; border-left: 4px solid #22C55E; padding: 0.28rem">
                            <div class="font-medium text-xs" style="color: #162F6C;">${m.symbol}</div>
                            <div class="text-green-600 text-xs mt-0.5">+${Math.abs(m.pctChange).toFixed(2)}%</div>
                        </div>
                    `).join('')}
                </div>
                </div>
                
                <div class="w-full">
                    <div class="space-y-3">
                        ${topLosers.map(m => `
                            <div class="flex flex-col bg-white py-1.5 px-2 rounded-lg w-full" style="border: 1px solid #E5E7EB; border-left: 4px solid #EF4444; padding: 0.28rem">
                                <div class="font-medium text-xs" style="color: #162F6C;">${m.symbol}</div>
                                <div class="text-red-600 text-xs mt-0.5">-${Math.abs(m.pctChange).toFixed(2)}%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ensure chartsDir is defined and created before any usage
    const chartsDir = path.join(__dirname, 'charts');
    if (!fs.existsSync(chartsDir)) fs.mkdirSync(chartsDir, { recursive: true });

    // Prepare heatmap data before HTML generation (fetch weekly change live)
    const records = parseSimpleCSV(path.join(__dirname, 'securities_data.csv'));
    const stockMap = {};
    let totalPortfolioValue = 0;

    // First pass: Calculate total portfolio value
    for (const row of records) {
        const symbol = row.Securities.trim();
        const qty = parseFloat(row.Quantity);
        const rate = parseFloat(row.Rate);
        if (!stockMap[symbol]) stockMap[symbol] = { totalQty: 0, totalCost: 0 };
        stockMap[symbol].totalQty += qty;
        stockMap[symbol].totalCost += qty * rate;
        totalPortfolioValue += qty * rate;
    }

    // Get weekly change for each stock and calculate weighted values
    const heatmapData = [];
    for (const symbol in stockMap) {
        let ticker = symbol.endsWith('.NS') ? symbol : symbol + '.NS';
        try {
            const data = await yahooFinance.historical(ticker, {
                period1: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                period2: new Date(),
                interval: '1d'
            });
            if (!data || data.length < 2) continue;
            const startPrice = data[0].close;
            const endPrice = data[data.length - 1].close;
            const pctChange = ((endPrice - startPrice) / startPrice) * 100;
            const currentValue = stockMap[symbol].totalQty * endPrice;
            const weight = (currentValue / totalPortfolioValue) * 100;
            
            heatmapData.push({ 
                symbol, 
                pctChange,
                value: currentValue,
                weight: weight
            });
        } catch (e) {
            // skip if error
        }
    }

    // Sort heatmap data by absolute monetary change
    heatmapData.sort((a, b) => {
        const monetaryChangeA = Math.abs(a.value * a.pctChange / 100);
        const monetaryChangeB = Math.abs(b.value * b.pctChange / 100);
        return monetaryChangeB - monetaryChangeA;
    });

    // Read image as base64
    function imageToBase64DataUri(imagePath) {
        if (!fs.existsSync(imagePath)) return '';
        const image = fs.readFileSync(imagePath);
        return `data:image/png;base64,${image.toString('base64')}`;
    }

    // Calculate sector percentages and filter small values
    const sectorBreakup = await getSectorBreakupData();
    const totalValue = sectorBreakup.values.reduce((a, b) => a + b, 0);

    // Calculate percentages and round them
    const sectorData = sectorBreakup.labels.map((label, index) => ({
        label,
        value: Math.round((sectorBreakup.values[index] / totalValue) * 100 * 10) / 10
    })).sort((a, b) => b.value - a.value);

    // Separate sectors >= 5% and < 5%
    const largeSectors = sectorData.filter(sector => sector.value >= 5);
    const smallSectors = sectorData.filter(sector => sector.value < 5);

    // Calculate Others
    const othersValue = smallSectors.reduce((sum, sector) => sum + sector.value, 0);

    // Build final array
    const filteredSectors = [...largeSectors];
    if (othersValue > 0) {
        filteredSectors.push({
            label: 'Others',
            value: othersValue
        });
    }

    // CRITICAL: Force exact 100% sum by adjusting the largest sector
    const currentSum = filteredSectors.reduce((sum, sector) => sum + sector.value, 0);
    const difference = 100 - currentSum;

    if (Math.abs(difference) > 0.001) { // Only adjust if difference is significant
        // Find the largest sector and adjust it
        const largestIndex = filteredSectors.reduce((maxIndex, sector, index) => 
            sector.value > filteredSectors[maxIndex].value ? index : maxIndex, 0);
        
        filteredSectors[largestIndex].value = 
            Math.round((filteredSectors[largestIndex].value + difference) * 10) / 10;
    }

    console.log('Final sum:', filteredSectors.reduce((sum, s) => sum + s.value, 0));

        // Generate blue shades for sectors
        const generateBlueShades = (count) => {
            const shades = [];
            for (let i = 0; i < count; i++) {
                const hue = 220;
                const saturation = 85;
                const lightness = Math.max(25, 75 - (i * 50 / count));
                shades.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
            }
            return shades;
        };

    // Generate sector chart HTML
    const sectorChartHtml = `
        <div class="p-4 rounded-lg" style="background-color: white; border: 1px solid #E5E7EB; border-radius: 8px; height: 540px;">
            <h2 class="text-lg font-semibold mb-3 text-left" style="color: #162F6C;">Sectoral Breakup</h2>
            <div style="height: 330px; position: relative; display: flex; justify-content: center; align-items: center; margin-top: 1.5rem;">
                <canvas id="sectorChart"></canvas>
            </div>
            <div class="mt-4">
                <table class="w-full text-xs">
                    <tbody id="sectorLegend">
                        <!-- Legend will be populated by JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Generate stock chart HTML
    const stockChartHtml = `
        <div class="p-4 rounded-lg" style="background-color: white; border: 1px solid #E5E7EB; border-radius: 8px; height: 267px; margin-top: -65px;">
            <h2 class="text-lg font-semibold mb-3 text-left" style="color: #162F6C;">Stock Breakup</h2>
            <div style="height: 200px; position: relative;">
                <canvas id="stockChart"></canvas>
            </div>
        </div>
    `;

    // Generate stock heatmap HTML
    const stockHeatmapHtml = `
        <div class="p-4 rounded-lg" style="background-color: white; border: 1px solid #E5E7EB; border-radius: 8px; height: 280px; margin-top: -13px;">
            <h2 class="text-lg font-semibold mb-2 text-left" style="color: #162F6C;">Stock Heatmap - Past Week Performance</h2>
            <div id="stockHeatmap" style="height: 220px; width: 95%; position: relative; margin: 0 auto;  margin-right: 1.7rem;"></div>
        </div>
    `;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.header.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        ${fs.readFileSync('styles.css', 'utf8')}
        .page-break {
            page-break-after: always;
        }
        .heatmap-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .heatmap-cell {
            transition: all 0.3s ease;
        }
        .heatmap-cell:hover {
            filter: brightness(1.1);
        }
        .js-plotly-plot .plotly .treemap path {
            rx: 20px;
            ry: 20px;
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="min-h-screen bg-background p-4 w-screen">
            <div class="max-w-7xl mx-auto">
                <div class="bg-white w-full relative">
                    <div class="px-4">
                        <!-- First page with header -->
                        <div class="page-break">
                            ${headerHtml}
                            <div class="grid grid-cols-2 gap-4 mt-8">
                                <div>${portfolioVsBenchmarkHtml}</div>
                                <div>${sectorChartHtml}</div>
                            </div>
                            <div style="height: 20px;"></div>
                            <div class="flex flex-col gap-2">
                                <div>${topMoversHtml}</div>
                                ${stockHeatmapHtml}
                            </div>
                        </div>

                        <!-- Second page with general insights and reports -->
                        <div class="page-break">
                            <div class="space-y-8">
                                ${generateGeneralInsights()}
                                ${generateGeneralAnalystReports()}
                                ${config.companies && config.companies.length > 0 ? `
                                    <section class="mb-8 avoid-break">
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
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
    <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            Chart.register(ChartDataLabels);
            
            // Sector Chart
            const sectorCtx = document.getElementById('sectorChart');
            new Chart(sectorCtx, {
                type: 'pie',
                data: {
                    labels: ${JSON.stringify(filteredSectors.map(item => item.label))},
                    datasets: [{
                        data: ${JSON.stringify(filteredSectors.map(item => item.value))}, // Use exact values for calculation
                        backgroundColor: ${JSON.stringify(generateBlueShades(filteredSectors.length))},
                        borderColor: 'transparent',
                        spacing: 0,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    devicePixelRatio: 2,
                    layout: {
                        padding: {
                            top: 5,
                            bottom: 0
                        }
                    },
                    plugins: {
                        legend: {
                            display: false, // Disable default legend
                        },
                        tooltip: {
                            backgroundColor: 'rgba(10, 36, 99, 0.95)',
                            titleFont: {
                                size: 13,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 12
                            },
                            padding: 10,
                            cornerRadius: 6,
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.raw.toFixed(1) + '%';
                                }
                            }
                        },
                        datalabels: {
                            color: '#fff',
                            font: {
                                weight: 'bold',
                                size: 12
                            },
                            formatter: function(value, context) {
                                if (context.chart.data.labels[context.dataIndex] === 'Others') {
                                    return '';
                                }
                                return value.toFixed(1) + '%';
                            }
                        }
                    },
                    elements: {
                        arc: {
                            borderWidth: 0,
                            spacing: 0
                        }
                    }
                }
            });

            // Create custom legend table
            const legendData = ${JSON.stringify(filteredSectors.map((item, index) => ({
                label: item.label,
                value: item.value,
                color: generateBlueShades(filteredSectors.length)[index]
            })))};
            
            const legendTable = document.getElementById('sectorLegend');
            const itemsPerRow = 2;
            
            for (let i = 0; i < legendData.length; i += itemsPerRow) {
                const row = document.createElement('tr');
                
                for (let j = 0; j < itemsPerRow; j++) {
                    const item = legendData[i + j];
                    if (item) {
                        const cell = document.createElement('td');
                        cell.className = 'p-1';
                        cell.innerHTML = 
                            '<div class="flex items-center gap-2">' +
                                '<div class="w-3 h-3 rounded-full" style="background-color: ' + item.color + '"></div>' +
                                '<span class="font-medium">' + item.label + '</span>' +
                            '</div>';
                        row.appendChild(cell);
                    } else {
                        // Add empty cell to maintain table structure
                        const cell = document.createElement('td');
                        row.appendChild(cell);
                    }
                }
                
                legendTable.appendChild(row);
            }

            // Stock Chart
            const stockCtx = document.getElementById('stockChart');
            new Chart(stockCtx, {
                type: 'pie',
                data: {
                    labels: ${JSON.stringify(filteredSectors.map(item => item.label))},
                    datasets: [{
                        data: ${JSON.stringify(filteredSectors.map(item => item.value))},
                        backgroundColor: ${JSON.stringify(generateBlueShades(filteredSectors.length))},
                        borderColor: 'transparent',
                        spacing: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    devicePixelRatio: 1,
                    layout: {
                        padding: {
                            top: 5,
                            bottom: 5
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'right',
                            align: 'center',
                            labels: {
                                boxWidth: 8,
                                padding: 6,
                                font: {
                                    size: 10,
                                    weight: '500'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(10, 36, 99, 0.95)',
                            titleFont: {
                                size: 13,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 12
                            },
                            padding: 10,
                            cornerRadius: 6,
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.raw + '%';
                                }
                            }
                        },
                        datalabels: {
                            color: '#fff',
                            font: {
                                weight: 'bold',
                                size: 12
                            },
                            formatter: function(value, context) {
                                if (context.chart.data.labels[context.dataIndex] === 'Others') {
                                    return '';
                                }
                                return value + '%';
                            }
                        }
                    }
                }
            });

            // Stock Heatmap using Plotly
            const heatmapData = ${JSON.stringify(heatmapData)};
            
            // Define color scales for positive and negative changes
            const getColor = (pctChange, value) => {
                const absChange = Math.abs(pctChange);
                
                if (pctChange >= 0) {
                    if (absChange < 1.6) return '#3da43d';
                    if (absChange < 3.2) return '#208020';
                    if (absChange < 4.8) return '#0d5c0d';
                    if (absChange < 6.4) return '#094109';
                    if (absChange < 8.0) return '#062e06';
                    return '#041b04';
                } else {
                    if (absChange < 1.6) return '#f89494';
                    if (absChange < 3.2) return '#f17171';
                    if (absChange < 4.8) return '#df5454';
                    if (absChange < 6.4) return '#bf3939';
                    if (absChange < 8.0) return '#9f1f1f';
                    return '#7f0000';
                }
            };
            
            const data = [{
                type: 'treemap',
                ids: heatmapData.map(d => d.symbol),
                labels: heatmapData.map(d => {
                    const symbol = d.symbol;
                    const change = d.pctChange >= 0 ? 
                        '+' + d.pctChange.toFixed(2) + '%' : 
                        d.pctChange.toFixed(2) + '%';
                    const value = '₹' + (d.value/100000).toFixed(1) + 'L';
                    return JSON.stringify('<b>' + symbol + '</b><br>' + change + '<br>' + value).slice(1, -1);
                }),
                parents: heatmapData.map(() => ''),
                values: heatmapData.map(d => d.value),
                marker: {
                    colors: heatmapData.map(d => getColor(d.pctChange, d.value)),
                    line: {
                        color: 'transparent',
                        width: 0
                    },
                    pad: {
                        t: 8,
                        b: 8,
                        l: 8,
                        r: 8
                    },
                    cornerradius: 2
                },
                textinfo: 'label',
                textposition: 'middle center',
                textfont: {
                    size: 14,
                    color: 'white',
                    family: 'Inter Black, sans-serif',
                    weight: 'bold',
                },
                uniformtext: {
                    enabled: true,
                    minsize: 6,
                    maxsize: 14,
                    mode: 'show',
                    bold: true
                },
                hovertemplate: 
                    '<b>%{id}</b><br>' +
                    'Change: %{customdata[0]}%<br>' +
                    'Value: ₹%{customdata[1]}L<br>' +
                    'Weight: %{value:.1f}%<extra></extra>',
                customdata: heatmapData.map(d => [
                    d.pctChange.toFixed(2),
                    (d.value/100000).toFixed(1)
                ])
            }];

            const layout = {
                margin: { t: 0, b: 0, l: 0, r: 0 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
            };

            const config = {
                responsive: true,
                displayModeBar: false
            };

            Plotly.newPlot('stockHeatmap', data, layout, config);
        });
    </script>
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

function parseSimpleCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const [headerLine, ...lines] = content.trim().split('\n');
    const headers = headerLine.split(',').map(h => h.trim());
    return lines.map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i]);
        return obj;
    });
}

const getPortfolioWeeklyChange = async () => {
    // Read and parse the CSV
    const records = parseSimpleCSV(path.join(__dirname, 'securities_data.csv'));
    // Aggregate by symbol
    const portfolio = {};
    for (const row of records) {
        const symbol = row.Securities.trim();
        const qty = parseFloat(row.Quantity);
        if (!portfolio[symbol]) {
            portfolio[symbol] = { quantity: 0 };
        }
        portfolio[symbol].quantity += qty;
    }
    // Fetch weekly price change for each stock
    let portfolioStart = 0, portfolioEnd = 0;
    for (const symbol in portfolio) {
        let ticker = symbol.endsWith('.NS') ? symbol : symbol + '.NS';
        try {
            const data = await yahooFinance.historical(ticker, {
                period1: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                period2: new Date(),
                interval: '1d'
            });
            if (data.length < 2) continue;
            const startPrice = data[0].close;
            const endPrice = data[data.length - 1].close;
            portfolioStart += startPrice * portfolio[symbol].quantity;
            portfolioEnd += endPrice * portfolio[symbol].quantity;
        } catch (e) {
            // skip if error
        }
    }
    const portfolioChange = portfolioStart > 0 ? ((portfolioEnd - portfolioStart) / portfolioStart) * 100 : 0;
    return portfolioChange;
};

const getBenchmarkWeeklyChange = async (symbol) => {
    try {
        const data = await yahooFinance.historical(symbol, {
            period1: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            period2: new Date(),
            interval: '1d'
        });
        if (data.length < 2) return 0;
        const startPrice = data[0].close;
        const endPrice = data[data.length - 1].close;
        return ((endPrice - startPrice) / startPrice) * 100;
    } catch (e) {
        return 0;
    }
};

const getTopMoversAndLosers = async () => {
    const records = parseSimpleCSV(path.join(__dirname, 'securities_data.csv'));
    // Aggregate by symbol
    const portfolio = {};
    for (const row of records) {
        const symbol = row.Securities.trim();
        if (!portfolio[symbol]) {
            portfolio[symbol] = true;
        }
    }
    const changes = [];
    for (const symbol in portfolio) {
        let ticker = symbol.endsWith('.NS') ? symbol : symbol + '.NS';
        try {
            const data = await yahooFinance.historical(ticker, {
                period1: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                period2: new Date(),
                interval: '1d'
            });
            if (data.length < 2) continue;
            const startPrice = data[0].close;
            const endPrice = data[data.length - 1].close;
            const pctChange = ((endPrice - startPrice) / startPrice) * 100;
            changes.push({ symbol, pctChange });
        } catch (e) {
            // skip if error
        }
    }
    // Sort for top gainers and losers
    const sorted = changes.sort((a, b) => b.pctChange - a.pctChange);
    const topMovers = sorted.slice(0, 3);
    const topLosers = sorted.slice(-3).reverse();
    return { topMovers, topLosers };
};

const getPortfolioTotalValue = async () => {
    const records = parseSimpleCSV(path.join(__dirname, 'securities_data.csv'));
    const stockMap = {};
    
    // First aggregate quantities for each stock
    for (const row of records) {
        const symbol = row.Securities.trim();
        const qty = parseFloat(row.Quantity);
        if (!stockMap[symbol]) {
            stockMap[symbol] = { totalQty: 0 };
        }
        stockMap[symbol].totalQty += qty;
    }

    // Get current prices and calculate total value
    let totalValue = 0;
    let processedStocks = 0;
    let skippedStocks = [];

    for (const symbol in stockMap) {
        let ticker = symbol.endsWith('.NS') ? symbol : symbol + '.NS';
        try {
            const data = await yahooFinance.historical(ticker, {
                period1: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                period2: new Date(),
                interval: '1d'
            });
            if (data.length > 0) {
                const currentPrice = data[data.length - 1].close;
                totalValue += stockMap[symbol].totalQty * currentPrice;
                processedStocks++;
            } else {
                skippedStocks.push(symbol);
            }
        } catch (e) {
            skippedStocks.push(symbol);
        }
    }

    // Log summary of processed and skipped stocks
    if (skippedStocks.length > 0) {
        console.log(`Skipped ${skippedStocks.length} stocks due to price fetch issues: ${skippedStocks.join(', ')}`);
    }
    console.log(`Successfully processed ${processedStocks} stocks for total value calculation`);

    return totalValue;
};

const getStockBreakupData = () => {
    const records = parseSimpleCSV(path.join(__dirname, 'securities_data.csv'));
    const stockMap = {};
    for (const row of records) {
        const symbol = row.Securities.trim();
        const qty = parseFloat(row.Quantity);
        const rate = parseFloat(row.Rate);
        if (!stockMap[symbol]) stockMap[symbol] = 0;
        stockMap[symbol] += qty * rate;
    }
    const labels = Object.keys(stockMap);
    const values = labels.map(l => stockMap[l]);
    return { labels, values, stockMap };
};

const getSectorBreakupData = async () => {
    const records = parseSimpleCSV(path.join(__dirname, 'securities_data.csv'));
    const sectorMap = {};
    for (const row of records) {
        const symbol = row.Securities.trim();
        const qty = parseFloat(row.Quantity);
        const rate = parseFloat(row.Rate);
        let sector = 'Unknown';
        try {
            const info = await yahooFinance.quoteSummary(symbol + '.NS', { modules: ['summaryProfile'] });
            sector = info.summaryProfile?.sector || 'Unknown';
        } catch (e) {}
        if (!sectorMap[sector]) sectorMap[sector] = 0;
        sectorMap[sector] += qty * rate;
    }
    const labels = Object.keys(sectorMap);
    const values = labels.map(l => sectorMap[l]);
    return { labels, values, sectorMap };
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
        //Import and call plot_stock.js to generate charts
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