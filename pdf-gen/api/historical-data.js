import yahooFinance from 'yahoo-finance2';
import moment from 'moment';

const handler = async (req, res) => {
    console.log('Historical data API called with query:', req.query);
    
    if (req.method !== 'GET') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { symbol } = req.query;
    if (!symbol) {
        console.log('No symbol provided in query');
        return res.status(400).json({ error: 'Symbol is required' });
    }

    try {
        console.log(`Fetching data for symbol: ${symbol}`);
        
        // Get data for the last 30 days
        const endDate = moment();
        const startDate = moment().subtract(30, 'days');
        
        console.log(`Date range: ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}`);
        
        // Fetch historical data
        const data = await yahooFinance.historical(symbol, {
            period1: startDate.format('YYYY-MM-DD'),
            period2: endDate.format('YYYY-MM-DD'),
            interval: '1d'
        });
        
        console.log(`Successfully fetched ${data.length} days of data for ${symbol}`);
        
        // Convert to required format
        const historicalData = data.map(row => ({
            date: moment(row.date).format('YYYY-MM-DD'),
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close
        }));

        console.log(`Returning processed data for ${symbol}`);
        res.status(200).json(historicalData);
    } catch (error) {
        console.error('Error in historical data API:', error);
        res.status(500).json({ error: 'Failed to fetch historical data' });
    }
};

export default handler; 