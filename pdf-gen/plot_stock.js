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

// Function to generate company bar chart using Plotly
export const generateCompanyBarChart = async (companyData, outputPath) => {
    const data = [{
        x: companyData.dates,
        y: companyData.prices,
        type: 'bar',
        marker: {
            color: companyData.prices.map(price => 
                price >= companyData.prices[0] ? '#22C55E' : '#EF4444'
            )
        }
    }];

    const layout = {
        title: {
            text: `${companyData.symbol} Price Movement`,
            font: {
                size: 16,
                color: '#162F6C'
            }
        },
        xaxis: {
            title: 'Date',
            showgrid: false
        },
        yaxis: {
            title: 'Price (₹)',
            showgrid: true,
            gridcolor: '#E5E7EB'
        },
        plot_bgcolor: '#FFFFFF',
        paper_bgcolor: '#FFFFFF',
        margin: {
            l: 50,
            r: 20,
            t: 50,
            b: 50
        }
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    try {
        await plotly.newPlot(outputPath, data, layout, config);
        console.log(`Bar chart generated for ${companyData.symbol}`);
    } catch (error) {
        console.error(`Error generating bar chart for ${companyData.symbol}:`, error);
    }
};

// Function to generate all company charts
const generateAllCharts = async () => {
    const historicalDataPath = path.join(__dirname, 'historical_data', 'all_companies_historical_data.json');
    const chartsDir = path.join(__dirname, 'charts');
    
    if (!fs.existsSync(chartsDir)) {
        fs.mkdirSync(chartsDir, { recursive: true });
    }

    try {
        const data = JSON.parse(fs.readFileSync(historicalDataPath, 'utf8'));
        
        for (const [symbol, companyData] of Object.entries(data)) {
            const dates = companyData.data.map(d => d.date);
            const prices = companyData.data.map(d => d.close);
            
            const chartData = {
                symbol,
                dates,
                prices
            };
            
            const outputPath = path.join(chartsDir, `${symbol.toLowerCase()}_chart.png`);
            await generateCompanyBarChart(chartData, outputPath);
        }
    } catch (error) {
        console.error('Error generating charts:', error);
    }
};

export { generateStockChart, generateAllCharts };