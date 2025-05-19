//this file test if the symbol images are working or not
//just run this file to test if the symbol images are working or not

//output will be like this:
// Symbol: ETERNAL, Status: 403
// Symbol: TATAMOTORS, Status: 200
// Symbol: TATAPOWER, Status: 200
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testSymbolImages = async () => {
    try {
        // Read the historical data file to get company symbols
        const filePath = path.join(__dirname, 'historical_data', 'all_companies_historical_data.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Get all company symbols
        const companies = Object.keys(data);
        console.log(`Found ${companies.length} companies to test`);

        // Test each company's image URL
        const results = [];
        for (const symbol of companies) {
            const imageUrl = `https://images.dhan.co/symbol/${symbol}.png`;
            try {
                const response = await fetch(imageUrl);
                results.push({
                    symbol: symbol,
                    statusCode: response.status,
                    url: imageUrl
                });
                console.log(`Symbol: ${symbol}, Status: ${response.status}`);
            } catch (error) {
                results.push({
                    symbol: symbol,
                    statusCode: 'Error',
                    url: imageUrl,
                    error: error.message
                });
                console.log(`Symbol: ${symbol}, Error: ${error.message}`);
            }
        }

        // Save results to a file
        const outputPath = path.join(__dirname, 'symbol_image_test_results.json');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        console.log(`\nResults have been saved to: ${outputPath}`);

        // Print summary
        const successCount = results.filter(r => r.statusCode === 200).length;
        const errorCount = results.length - successCount;
        console.log(`\nSummary:`);
        console.log(`Total symbols tested: ${results.length}`);
        console.log(`Successful (200): ${successCount}`);
        console.log(`Failed: ${errorCount}`);

    } catch (error) {
        console.error('Error in testSymbolImages:', error);
    }
};

// Run the test
testSymbolImages(); 