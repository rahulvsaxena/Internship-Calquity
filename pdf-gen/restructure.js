// Import required dependencies
import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config();

async function restructureCompany(table_data, company) {
const analysis_prompt = `
You are analyzing financial news articles for a specific company. Your task is to:
    1. Organize the information by grouping similar themed articles together in sections
    2. Within each section, create HTML-formatted bullet points describing the points for that section. Bold key terms and numbers using the HTML <b> tag. Only use HTML tags for formatting. Don't use markdown or other formatting languages.
    3. Maintain all source links for each section at the end of the section ONLY
    4. Keep the output focused on financial implications and recommendations
    5. Make sure to include all relevant information from the articles
    6. Each news article also has a sentiment associated with it. Include that with each bullet point as well (positive or negative or neutral)

    <Company>
      ${company}
    </Company>
    <Articles>
      ${table_data}
    </Articles>

    Return JSON format:
    {
        "sections": [
            {
                "heading": "Section Title",
                "html_bullets": [
                    {
                      point: "Point 1",
                      sentiment: "positive"
                    },
                    {
                      point: "Point 2",
                      sentiment: "negative"
                    }
                ],
                "links": ["url1", "url2"]
            }
        ]
    }
  `;
    

  try {

    const response = await axios.post(
      `${process.env.AZURE_ENDPOINT}/openai/deployments/gpt-4o/chat/completions?api-version=${process.env.AZURE_API_VERSION}`,
      {
          messages: [
              { role: 'user', content: analysis_prompt }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
      },
      {
          headers: {
              'Content-Type': 'application/json',
              'api-key': process.env.AZURE_API_KEY
          }
      }
  );

    return JSON.parse(response.data.choices[0].message.content).sections;
  } catch (error) {
    console.error('Error analyzing article:', error);
    throw error;
  }
}

export async function fetchCompanyData(company) {
  try {
    const date = new Date().toISOString().split('T')[0];
    // Check if `${company}-currentdate.json` exists
    if (fs.existsSync(`./${company}-${date}.json`)) {
      // Read file and return JSON data
      const data = fs.readFileSync(`./${company}-${date}.json`);
      return JSON.parse(data);
    }
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data, error } = await supabase.from('articles').select("title, summary, company, link, date, article_type, sentiment").eq('company', company).order('date', { ascending: false });
    ;

    if (error) {
      throw error;
    }

    const filtered_data = data.filter(article => article.article_type !== 'None of the Above from Link' && article.article_type !== 'None of the Above' && article.article_type !== null && article.summary !== null);

    if (filtered_data.length === 0) {
      fs.writeFileSync(`./${company}-${date}.json`, JSON.stringify([], null, 2));
      return [];
    }
    // Create markdown table string
    let table_data = 'title|summary|link|sentiment\n';
    for (let i = 0; i < filtered_data.length; i++) {
      table_data += `${filtered_data[i].title.replace("|", " ")}|${filtered_data[i].summary.replace("|", " ")}|${filtered_data[i].link}|${filtered_data[i].sentiment || 'neutral'}\n`;
    }

    const response = await restructureCompany(table_data, company);
    // Write response to text file "company-currentdate.json"
    fs.writeFileSync(`./${company}-${date}.json`, JSON.stringify(response, null, 2));
    return response;

  } catch (error) {
    console.error('Error fetching company data:', error);
    throw error;
  }
}

// Test fetching company data
// const company = 'Reliance Industries Limited';
// fetchCompanyData(company)
//   .then(section_data => console.log(section_data))
//   .catch(error => console.error(error));
