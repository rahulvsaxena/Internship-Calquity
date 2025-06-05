import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import plotly from 'plotly';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to interpolate missing data points
const interpolateData = (dates, values) => {
    const interpolated = [];
    for (let i = 0; i < dates.length; i++) {
        if (i > 0) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff > 1) {
                // Interpolate missing days
                for (let j = 1; j < daysDiff; j++) {
                    const interpDate = new Date(prevDate);
                    interpDate.setDate(prevDate.getDate() + j);
                    
                    // Linear interpolation
                    const ratio = j / daysDiff;
                    const interpValue = values[i - 1] + (values[i] - values[i - 1]) * ratio;
                    
                    interpolated.push({
                        date: interpDate.toISOString().split('T')[0],
                        value: interpValue
                    });
                }
            }
        }
        interpolated.push({
            date: dates[i],
            value: values[i]
        });
    }
    return interpolated;
};

const generateStockChart = async (companySymbol, companyData) => {
    try {
        // Prepare data for plotting
        const dates = companyData.data.map(d => d.date);
        const open = companyData.data.map(d => d.open);
        const high = companyData.data.map(d => d.high);
        const low = companyData.data.map(d => d.low);
        const close = companyData.data.map(d => d.close);

        // Interpolate missing data points
        const interpolatedOpen = interpolateData(dates, open);
        const interpolatedHigh = interpolateData(dates, high);
        const interpolatedLow = interpolateData(dates, low);
        const interpolatedClose = interpolateData(dates, close);

        // Create candlestick chart with interpolated data
        const candlestick = {
            x: interpolatedOpen.map(d => d.date),
            open: interpolatedOpen.map(d => d.value),
            high: interpolatedHigh.map(d => d.value),
            low: interpolatedLow.map(d => d.value),
            close: interpolatedClose.map(d => d.value),
            type: 'candlestick',
            increasing: {line: {color: 'green'}},
            decreasing: {line: {color: 'red'}}
        };

        // Create layout with reduced spacing and thicker grid
        const layout = {
            yaxis: {
                title: {
                    text: 'Price (INR)',
                    font: {
                        size: 16, 
                        family: 'Arial, sans-serif',
                        color: '#000',
                        weight: 'bold'
                    },
                    standoff: 10
                },
                autorange: true,
                fixedrange: false,
                gridwidth: 2,
                gridcolor: 'rgba(200, 200, 200, 0.8)',
                automargin: true
            },
            xaxis: {
                title: {
                    text: 'Date',
                    font: {
                        size: 16,
                        family: 'Arial, sans-serif',
                        color: '#000',
                        weight: 'bold'
                    },
                    standoff: 10
                },
                rangeslider: {
                    visible: false
                },
                gridwidth: 2,
                gridcolor: 'rgba(200, 200, 200, 0.8)',
                // Change date format to dd-mm-yy
                tickformat: '%d-%m-%y',
                tickangle: -45
            },
            margin: {
                l: 20,
                r: 20,
                t: 20,
                b: 20
            },
            paper_bgcolor: 'white',
            plot_bgcolor: 'white'
        };

        // Create temporary HTML file
        const tempHtmlPath = path.join(__dirname, 'temp_chart.html');
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        body { margin: 0; padding: 0; }
        #chart {
            width: 100%;
            height: 60vh;
            background-color: white;
        }
        .ytitle, .xtitle {
            font-size: 16px !important;
            font-weight: bold !important;
        }
    </style>
</head>
<body>
    <div id="chart"></div>
    <script>
        const data = ${JSON.stringify([candlestick])};
        const layout = ${JSON.stringify(layout)};
        Plotly.newPlot('chart', data, layout).then(() => {
            window.chartReady = true;
        });
    </script>
</body>
</html>`;

        fs.writeFileSync(tempHtmlPath, htmlContent);

        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: 'new'
        });
        const page = await browser.newPage();

        // Set viewport size
        await page.setViewport({
            width: 1200,
            height: 800
        });

        // Load the HTML file
        await page.goto(`file://${tempHtmlPath}`);

        // Wait for the chart to be rendered
        await page.waitForFunction(() => {
            return window.chartReady === true;
        }, { timeout: 10000 });
        
        // Add a small delay to ensure rendering completes
        await new Promise(resolve => setTimeout(resolve, 500));

        // Take screenshot of the chart
        const chartElement = await page.$('#chart');
        const outputPath = path.join(__dirname, 'historical_data', `${companySymbol.toLowerCase()}_chart.png`);
        
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await chartElement.screenshot({
            path: outputPath,
            omitBackground: true
        });

        // Clean up
        await browser.close();
        fs.unlinkSync(tempHtmlPath);

        console.log(`Chart has been generated at: ${outputPath}`);
        return outputPath;

    } catch (error) {
        console.error(`Error creating plot for ${companySymbol}:`, error);
        throw error;
    }
};

const generateCompanyBarChart = async (companyData, symbol) => {
    let browser;
    let tempHtmlPath;
    
    try {
        // Ensure we have valid data for this specific company
        if (!companyData || !companyData.data || !Array.isArray(companyData.data)) {
            console.error(`Invalid data for ${symbol}`);
            return;
        }

        const dates = companyData.data.map(d => d.date);
        const opens = companyData.data.map(d => d.open);
        const highs = companyData.data.map(d => d.high);
        const lows = companyData.data.map(d => d.low);
        const closes = companyData.data.map(d => d.close);

        const data = [{
            x: dates,
            open: opens,
            high: highs,
            low: lows,
            close: closes,
            type: 'candlestick',
            increasing: {line: {color: 'green'}},
            decreasing: {line: {color: 'red'}}
    }];

    const layout = {
            yaxis: {
        title: {
                    text: 'Price (INR)',
            font: {
                size: 16,
                        family: 'Arial, sans-serif',
                        color: '#000',
                        weight: 'bold'
                    },
                    standoff: 10
                },
                autorange: true,
                fixedrange: false,
                gridwidth: 2,
                gridcolor: 'rgba(200, 200, 200, 0.8)',
                automargin: true
        },
        xaxis: {
                title: {
                    text: 'Date',
                    font: {
                        size: 16,
                        family: 'Arial, sans-serif',
                        color: '#000',
                        weight: 'bold'
                    },
                    standoff: 10
                },
                rangeslider: {
                    visible: false
        },
                gridwidth: 2,
                gridcolor: 'rgba(200, 200, 200, 0.8)',
                tickformat: '%d-%m-%y',
                tickangle: -45,
                tickfont: {
                    size: 12
                }
            },
        margin: {
                l: 20,
            r: 20,
                t: 10,
                b: 80  // Increased bottom margin for dates
            },
            paper_bgcolor: 'white',
            plot_bgcolor: 'white'
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

        // Create a temporary HTML file for the chart
        const tempHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
                <style>
                    body { 
                        margin: 0; 
                        padding: 0; 
                        background: white;
                    }
                    #chart {
                        width: 100%;
                        height: 550px;  // Increased height to accommodate dates
                        background-color: white;
                    }
                    .ytitle, .xtitle {
                        font-size: 16px !important;
                        font-weight: bold !important;
                    }
                </style>
            </head>
            <body>
                <div id="chart"></div>
                <script>
                    const data = ${JSON.stringify(data)};
                    const layout = ${JSON.stringify(layout)};
                    const config = ${JSON.stringify(config)};
                    Plotly.newPlot('chart', data, layout, config).then(() => {
                        window.chartReady = true;
                    });
                </script>
            </body>
            </html>
        `;

        tempHtmlPath = path.join(__dirname, 'temp_chart.html');
        fs.writeFileSync(tempHtmlPath, tempHtml);

        // Use puppeteer to render the chart and save as PNG
        browser = await puppeteer.launch({
            headless: 'new'
        });
        const page = await browser.newPage();
        
        // Set viewport size to match chart size
        await page.setViewport({
            width: 1200,
            height: 650  // Increased height to accommodate dates
        });

        await page.goto(`file://${tempHtmlPath}`);
        
        // Wait for the chart to be rendered
        await page.waitForFunction(() => {
            return window.chartReady === true;
        }, { timeout: 10000 });

        // Add a small delay to ensure rendering completes
        await new Promise(resolve => setTimeout(resolve, 500));

        const outputPath = path.join(__dirname, 'historical_data', `${symbol.toLowerCase()}_chart.png`);
        
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Take screenshot of just the chart element
        const chartElement = await page.$('#chart');
        await chartElement.screenshot({
            path: outputPath,
            omitBackground: true
        });

        console.log(`Successfully generated chart for ${symbol}`);
    } catch (error) {
        console.error(`Error generating bar chart for ${symbol}:`, error);
    } finally {
        // Clean up resources
        if (browser) {
            await browser.close();
        }
        if (tempHtmlPath && fs.existsSync(tempHtmlPath)) {
            try {
                fs.unlinkSync(tempHtmlPath);
            } catch (error) {
                console.error(`Error cleaning up temporary file for ${symbol}:`, error);
            }
        }
    }
};

const generateAllCharts = async () => {
    try {
        const dataPath = path.join(__dirname, 'historical_data', 'all_companies_historical_data.json');
        if (!fs.existsSync(dataPath)) {
            console.error('Historical data file not found');
            return;
    }

        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        // Process each company's data separately
        for (const [symbol, companyData] of Object.entries(data)) {
            console.log(`Generating chart for ${symbol}...`);
            await generateCompanyBarChart(companyData, symbol);
        }
        
        console.log('All charts generated successfully');
    } catch (error) {
        console.error('Error generating charts:', error);
    }
};

export { generateStockChart, generateAllCharts };