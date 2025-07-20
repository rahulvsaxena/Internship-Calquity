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

    const llmNewsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'company_llm_outputs.json'), 'utf8'));

    const getSampleCompanies = () => {
        const csvPath = path.join(__dirname, 'sample_data.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.trim().split(/\r?\n/); // skip header
        return lines
            .map(line => {
                if (!line.trim()) return null;
                const match = line.match(/^(.*?)(?: \((.*?)\))?$/);
                if (!match) return null;
                return {
                    name: match[1] ? match[1].trim() : line.trim(),
                    symbol: match[2] ? match[2].trim() : (match[1] ? match[1].split(' ')[0].toUpperCase() : line.trim().split(' ')[0].toUpperCase()),
                };
            })
            .filter(Boolean);
    };

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

        // For Watchlist Overview, use sample_data.csv companies with random values
        const sampleCompanies = getSampleCompanies();
        const marketOverviewRows = sampleCompanies.map(company => {
            // Generate random values
            const weeklyClose = (Math.random() * 1000 + 100).toFixed(2);
            const weeklyChange = (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 10).toFixed(2) + '%';
            const ytdChange = (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 20).toFixed(2) + '%';
            const weeklyChangeIcon = weeklyChange.includes('+')
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';
            const weeklyChangeColor = weeklyChange.includes('+') ? "text-green-600" : "text-red-600";
            const ytdChangeIcon = ytdChange.includes('+')
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>';
            const ytdChangeColor = ytdChange.includes('+') ? "text-green-600" : "text-red-600";
            // Fallback logo logic
            const logoHtml = `<div class="rounded-full flex items-center justify-center" style="width: 28px; height: 28px; background: ${getPastelColor(company.name)}; color: ${getDarkerColor(company.name)}; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13px;">
                ${company.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
            </div>`;
            return `
            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td class="p-2 align-middle font-medium">
                    <div class="flex items-center gap-2 justify-start">
                        ${logoHtml}
                        <span class="text-left">${company.name} (${company.symbol})</span>
                    </div>
                </td>
                <td class="p-2 align-middle text-center">${weeklyClose}</td>
                <td class="p-2 align-middle text-center py-3">
                    <div class="flex items-center justify-center gap-1 font-medium ${weeklyChangeColor}">${weeklyChangeIcon}${weeklyChange}</div>
                </td>
                <td class="p-2 align-middle text-center">
                    <div class="flex items-center justify-center gap-1 font-medium ${ytdChangeColor}">${ytdChangeIcon}${ytdChange}</div>
                </td>
            </tr>
        `;
        });

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
            // Use companies from llmNewsData only
            const companyUpdates = await Promise.all(llmNewsData.map(async llmEntry => {
                const displayName = llmEntry.company;
                // Fallback logo logic
                const logoHtml = `<div class="rounded-full flex items-center justify-center" style="width: 32px; height: 32px; background: ${getPastelColor(displayName)}; color: ${getDarkerColor(displayName)}; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 14px;">
                    ${displayName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                </div>`;
    
                // News UI (pdfgen.js style, adapted for LLM output)
                const sentimentColors = {
                    positive: ['green', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>'],
                    neutral: ['gray', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'],
                    negative: ['red', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'],
                    mixed: ['gray', '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide gray lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>']
                };
                
                // Filter news
                const newsItems = llmEntry.individual_summaries
                    .filter(item => {
                        if (!item.summary) return false;
                        
                        // Exclude summaries that contain these patterns
                        const excludePatterns = [
                            /no recent financial developments/i,
                            /no recent financial news/i,
                            /contains only a competitor list/i,
                            /request failed with status code/i,
                            /article contains only.*competitor list/i,
                            /with no recent financial/i
                        ];
                        
                        return !excludePatterns.some(pattern => pattern.test(item.summary));
                    });
                
                // Collect unique sources for the bottom row
                const sourcesMap = {};
                newsItems.forEach(item => {
                    let domain = '';
                    try { domain = new URL(item.url).hostname; } catch {}
                    if (domain && !sourcesMap[domain]) {
                        sourcesMap[domain] = { favicon: item.favicon, url: item.url };
                    }
                });
                const sources = Object.entries(sourcesMap);
                
                // Helper function to extract root name from domain
                const getRootName = (domain) => {
                    // Remove www. prefix if present
                    let cleaned = domain.replace(/^www\./, '');
                    
                    // Split by dots and get the main part (before the TLD)
                    const parts = cleaned.split('.');
                    if (parts.length >= 2) {
                        // For domains like economictimes.indiatimes.com, take the second-to-last part
                        // For domains like zerodha.com, take the first part
                        return parts[parts.length - 2];
                    }
                    return parts[0];
                };
                
                // Render news bullets (pdfgen.js style)
                const bulletsHtml = newsItems.map((item, idx) => {
                    let color, icon;
                    if (["positive", "negative", "neutral"].includes(item.news_sentiment)) {
                        [color, icon] = sentimentColors[item.news_sentiment] || sentimentColors["neutral"];
                    } else {
                        [color, icon] = sentimentColors["neutral"];
                    }
                    return `
                        <li class="flex items-start gap-2 text-left">
                            <div class="inline-flex items-center justify-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-${color}-100 text-${color}-700 shrink-0 mt-half">
                                ${icon}
                            </div>
                            <span class="text-${color}-700 text-left">
                                ${item.summary.replace(/<\/?b>/g, '')}
                            </span>
                        </li>
                    `;
                }).join('');
                
                // Render sources row (pdfgen.js style)
                const sourcesHtml = sources.length ? `
                    <div class="grid grid-cols-4 gap-2 w-full mt-2">
                        ${sources.map(([domain, { favicon, url }], i) => `
                            <a href="${url}" target="_blank" class="inline-flex items-center justify-center rounded-full border px-3 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700 shrink-0 mt-half">
                                ${favicon ? `<img src="${favicon}" alt="favicon" style="height: 12px; width: auto; margin-right: 5px" />` : ''}
                                ${getRootName(domain)}
                            </a>
                        `).join('')}
                    </div>
                ` : '';
    
                // Card output
                return `
                  <div class="rounded-xl border bg-card text-card-foreground avoid-break mb-6">
                    <div class="flex flex-col space-y-1.5 p-4 bg-secondary rounded-t-xl company-update">
                      <div class="flex items-center">
                        ${logoHtml}
                        <div style="margin-left: 0.75rem; display: flex; flex-direction: column; align-items: flex-start;">
                          <span style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; color: #1A202C;">${displayName}</span>
                        </div>
                      </div>
                    </div>
                    <div class="p-4">
                      <div class="space-y-4">
                        <div>
                            <h4 class="font-semibold mb-2 flex items-center gap-2">Latest News</h4>
                            <ul class="mb-2 ml-8">
                                ${bulletsHtml}
                            </ul>
                            ${sourcesHtml}
                        </div>
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
        <title>${config.header.title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            ${fs.readFileSync('styles.css', 'utf8')}
            .page-break {
                page-break-after: always;
            }
        </style>
    </head>
    <body>
        <div id="root">
            <div class="min-h-screen bg-background p-4 w-screen">
                <div class="max-w-7xl mx-auto">
                    <div class="bg-white w-full relative">
                        <div class="px-4">
                            <!-- Header and content on the same page -->
                            <div class="page-break">
                                ${headerHtml}
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
                                                            ${(marketOverviewRows).join('')}
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

    export default generateCleanedHtml;