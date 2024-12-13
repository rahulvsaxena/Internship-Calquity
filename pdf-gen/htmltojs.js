import puppeteer from 'puppeteer';
import generateCleanedHtml from './pdfgen.js';

async function convertHtmlToPdf(htmlContent, outputPath) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-web-security',
    ]
  });

  try {
    const page = await browser.newPage();

    // Add CSS to prevent component breaks and style the footer
    const htmlWithStyles = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    /* Prevent component breaks */
                    h1, h2, h3, h4, h5, h6, img, figure, pre, .company-update, .key-metric {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;

    // Set content and wait for load
    await page.setContent(htmlWithStyles, {
      waitUntil: 'networkidle0'
    });

    // Get the total number of pages
    const pdf = await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '30px',
        right: '10px',
        bottom: '90px', // Increased bottom margin for footer
        left: '10px'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>', // Empty header
      footerTemplate: `
                <style>
                html {
                    -webkit-print-color-adjust: exact;
                }
                </style>
                <footer style="font-size: 14px; padding: 30px 10px 30px 10px; width: 100%;
                        background-color: #f1f5f9;
                        border-top: 1px solid #e2e8f0;
                        font-family: 'Arial', sans-serif;
                        margin-bottom: -20px;
                        color: #475569;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
                        <span>© 2024 Financial News Corp.</span>
                        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                    </div>
                </footer>
            `,
      preferCSSPageSize: false
    });

    console.log(`PDF successfully created at: ${outputPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    await browser.close();
  }
}


// Example usage
const regex = /\/\*([\s\S]*?)\*\//g;

const html = await generateCleanedHtml("pratham@example.com", 1);

// Replace all matches with empty string
const htmlSafe = html.replace(regex, '');

// Execute the conversion
convertHtmlToPdf(htmlSafe, 'output.pdf')
  .catch(err => console.error('Conversion failed:', err));