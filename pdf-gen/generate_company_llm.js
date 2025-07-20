import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { tavily } from '@tavily/core';

dotenv.config();

const companies = [
    "Manjushree Technopack Ltd.",
    "Merino Industries Ltd.",
    "Metropolitan Stock Exchange Ltd. (MSEI)",
    "Mohan Meakin Ltd.",
    "Motilal Oswal Home Finance Ltd.",
    "National Commodity and Derivatives Exchange Ltd. (NCDEX)",
    "National Securities Depository Ltd. (NSDL)",
    "National Stock Exchange Ltd. (NSE)",
    "Nayara Energy Ltd. (ESSAR Oil)",
    "Orbis Financial Corporation Ltd.",
    "Otis Elevator Company",
    "OYO Rooms (Oravel Stays Ltd.)",
    "Pace Digitek Infra Pvt Ltd",
    "Vikram Capital Ltd.",
    "Tata Capital Ltd.",
    "Vivriti Capital Ltd.",
    "Agarwal Bolts Ltd.",
    "Taparia Tools Ltd.",
    "Sterlite Electric Ltd.",
    "Philips India Ltd.",
    "Supermarket Grocery Supplies Pvt Ltd,"
  ];

const client = tavily({ apiKey: "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" });

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

function removeUrls(text) {
  if (typeof text !== 'string') return text;
  const urlRegex = /(https?:\/\/[\S]+)|(www\.[\S]+)|([\S]+\.[\S]+\/[\S]*)/gi;
  return text.replace(urlRegex, '');
}

async function scrapeArticle(url, jinaApiKey) {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await axios.get(jinaUrl, {
      headers: {
        'Authorization': `Bearer ${jinaApiKey}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error scraping article:', error.message);
    return null;
  }
}

async function analyzeCompanyArticles(company, articles, azureConfig) {
  const analysisPrompt = `You are given a set of news articles about the unlisted Indian company: ${company}.
Your task is to extract and synthesize ALL key financial information about this company from the articles.

Guidelines:
- Provide a detailed financial summary.
- Include complete funding history, current valuation, and key investors.
- Report any IPO plans, grey market premium (GMP), and recent financial performance (revenue/profit).
- Synthesize the latest major news from credible financial media.
- Do not include general news about the company eg what they do, who they are, etc.
- Use only the information provided in the articles to generate the summary.
- Do not add any other information thats not present in the articles.

Return your answer as a JSON object with the following structure:
{
  "company": "Company Name",
  "consolidated_summary": "Comprehensive analysis of all financial information, funding history, valuation, key investors, IPO plans, grey market premium, recent performance, and major news"
}`;

  const combinedArticles = articles.filter(Boolean).join('\n\n---\n\n');
  try {
    const response = await axios.post(
      `${azureConfig.endpoint}/openai/deployments/o3-mini/chat/completions?api-version=${azureConfig.version}`,
      {
        messages: [
          { role: 'system', content: analysisPrompt },
          { role: 'user', content: combinedArticles }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureConfig.key
        }
      }
    );
    
    try {
      return JSON.parse(response.data.choices[0].message.content);
    } catch {
      return { summary: response.data.choices[0].message.content };
    }
  } catch (error) {
    console.error('Error analyzing articles for', company, ':', error.message);
    return { error: error.message };
  }
}

async function main() {
  const azureConfig = {
    endpoint: process.env.AZURE_ENDPOINT,
    key: process.env.AZURE_API_KEY,
    version: process.env.AZURE_API_VERSION
  };
  const jinaApiKey = process.env.JINA_API_KEY;
  const output = [];

  for (const company of companies) {
    console.log(`\nProcessing: ${company}`);
    
    // 1. Tavily search
    let urlFaviconPairs = [];
    try {
      const query = `"${company}" latest news funding round valuation IPO announcement financial results earnings revenue profit investment deal acquisition merger`;
      const res = await client.search(query, {
        searchDepth: "advanced",
        maxResults: 10,
        timeRange: "week",
        include_favicon: true,
        chunksPerSource: 1,
        country: "india"
      });
      urlFaviconPairs = (res.results || [])
        .filter(r => r.url)
        .map(r => ({ url: r.url, favicon: r.favicon || null }));
      //console.log(res);
      console.log(`Fetched URLs for ${company}:`);
      urlFaviconPairs.forEach((pair, idx) => console.log(`  [${idx + 1}] ${pair.url} (favicon: ${pair.favicon})`));
    } catch (err) {
      console.error('Tavily error for', company, ':', err.message);
    }

    // 2. Scrape all URLs with Jina and store with URL and favicon
    const articles = [];
    for (let i = 0; i < urlFaviconPairs.length; i++) {
      const { url, favicon } = urlFaviconPairs[i];
      const content = await scrapeArticle(url, jinaApiKey);
      if (content) {
        console.log(`Successfully scraped data from: ${url}`);
        articles.push({ url, favicon, content });
      } else {
        console.log(`Failed to scrape data from: ${url}`);
      }
    }

    // 3. Save raw articles per company (optional, for debugging)
    const rawOutDir = path.join('output', 'raw');
    if (!fs.existsSync('output')) fs.mkdirSync('output');
    if (!fs.existsSync(rawOutDir)) fs.mkdirSync(rawOutDir);
    fs.writeFileSync(
      path.join(rawOutDir, sanitizeFileName(company) + '.json'),
      JSON.stringify({ company, articles }, null, 2)
    );

    // 4. Generate individual LLM summaries for each article
    const individualSummaries = [];
    for (let i = 0; i < articles.length; i++) {
      const { url, favicon, content } = articles[i];
      const cleanedContent = removeUrls(content);
      
      if (typeof cleanedContent !== 'string' || !cleanedContent.trim()) {
        console.log(`Skipped empty or invalid content for ${url}`);
        continue;
      }

      console.log(`Sending scraped data from ${url} to LLM for summary...`);
      
      const summaryPrompt = `You are given a news article about the unlisted Indian company: ${company}. \nYour task is to extract and summarize ONLY the latest financial news and developments about this company from the article.\n\nIMPORTANT GUIDELINES:\n- Focus ONLY on recent financial news, developments, and market updates\n- Do NOT include general company information like what they do, their history, or business description\n- Extract only: funding rounds, valuation changes, IPO announcements, financial results, earnings, revenue, profit, investment deals, acquisitions, mergers, regulatory updates, market performance\n- Include the article publication date if available\n- If the article contains no recent financial news/developments, state \"No recent financial developments found\"\n- Additionally, analyze the overall sentiment of the financial news as either \"positive\", \"negative\", or \"neutral\" and return it as the field \"news_sentiment\"\n\nReturn your answer as a JSON object with the following structure:\n{\n  \"summary\": \"Summary of ONLY the latest financial news and developments, excluding general company information in just 40 words\",\n  \"news_sentiment\": \"positive|negative|neutral\"\n}`;

      let summary = null;
      try {
        const response = await axios.post(
          `${azureConfig.endpoint}/openai/deployments/o3-mini/chat/completions?api-version=${azureConfig.version}`,
          {
            messages: [
              { role: 'system', content: summaryPrompt },
              { role: 'user', content: cleanedContent }
            ],
            response_format: { type: 'json_object' }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-key': azureConfig.key
            }
          }
        );
        
        try {
          summary = JSON.parse(response.data.choices[0].message.content);
        } catch {
          summary = { summary: response.data.choices[0].message.content, news_sentiment: "neutral" };
        }
      } catch (error) {
        console.error(`Error processing individual summary for ${url}:`, error.message);
        summary = { summary: error.message, news_sentiment: "neutral" };
      }
      
      // Flatten and attach url and favicon
      individualSummaries.push({
        url,
        favicon,
        summary: summary.summary,
        news_sentiment: summary.news_sentiment || "neutral"
      });
    }

    // 5. Generate consolidated summary from all individual summaries
    let consolidatedSummary = null;
    if (individualSummaries.length > 0) {
      const consolidationPrompt = `You are given a set of summaries, each containing latest financial news about the unlisted Indian company: ${company}. 
Your task is to synthesize these into one consolidated summary focusing ONLY on the most recent financial developments and market updates.

IMPORTANT GUIDELINES:
- Focus ONLY on recent financial news, developments, and market updates
- Do NOT include general company information like what they do, their history, or business description
- Synthesize only: funding rounds, valuation changes, IPO announcements, financial results, earnings, revenue, profit, investment deals, acquisitions, mergers, regulatory updates, market performance
- Prioritize the most recent developments
- If no recent financial developments are found, state "No recent financial developments found"

Return your answer as a JSON object with the following structure:
{
  "company": "Company Name",
  "consolidated_summary": "Comprehensive summary of ONLY the latest financial news and developments from all sources, excluding general company information"
}`;

      const allSummariesText = individualSummaries.map(s => 
        (typeof s.summary === 'string' ? s.summary : JSON.stringify(s.summary))
      ).join('\n---\n');
      
      if (typeof allSummariesText !== 'string' || !allSummariesText.trim()) {
        consolidatedSummary = { error: 'No valid summaries to consolidate.' };
      } else {
        try {
          const response = await axios.post(
            `${azureConfig.endpoint}/openai/deployments/o3-mini/chat/completions?api-version=${azureConfig.version}`,
            {
              messages: [
                { role: 'system', content: consolidationPrompt },
                { role: 'user', content: allSummariesText }
              ],
              response_format: { type: 'json_object' }
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'api-key': azureConfig.key
              }
            }
          );
          
          try {
            consolidatedSummary = JSON.parse(response.data.choices[0].message.content);
          } catch {
            consolidatedSummary = { summary: response.data.choices[0].message.content };
          }
        } catch (error) {
          console.error(`Error generating consolidated summary for ${company}:`, error.message);
          consolidatedSummary = { error: error.message };
        }
      }
    } else {
      consolidatedSummary = { error: 'No individual summaries available.' };
    }

    // 6. Output: company, all individual summaries, and consolidated summary
    output.push({ 
      company, 
      individual_summaries: individualSummaries, 
      consolidated_summary: consolidatedSummary 
    });

    // 7. Save progress after each company
    fs.writeFileSync(
      path.join('output', 'company_llm_outputs.json'),
      JSON.stringify(output, null, 2)
    );
    
    console.log(`Done: ${company}`);
  }

  console.log('All companies processed. Final output in output/company_llm_outputs.json');
}

main().catch(console.error);

// No export, this is a standalone script