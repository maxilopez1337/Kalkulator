
import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));

// Reuse a single browser instance for performance
let browserInstance = null;
async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=none',
                '--force-color-profile=srgb',
                '--disable-web-security',            // allow cross-origin font loading
                '--allow-running-insecure-content',
            ],
        });
        // Clear cached instance if browser disconnects unexpectedly
        browserInstance.on('disconnected', () => { browserInstance = null; });
    }
    return browserInstance;
}

app.post('/generate-pdf', async (req, res) => {
    const { html, filename } = req.body;

    if (!html) {
        return res.status(400).json({ error: 'Missing HTML content' });
    }

    let page;
    try {
        const browser = await getBrowser();
        page = await browser.newPage();

        // Viewport matching A4 at 96 dpi so all mm-based layouts render correctly
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

        // Load the HTML; wait until network is fully idle so Google Fonts load
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 45_000,
        });

        // Extra pause for font swap / final layout
        await new Promise(r => setTimeout(r, 800));

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: false,
            printBackground: true,
            preferCSSPageSize: false,
            margin: { top: '0', right: '0', bottom: '0', left: '0' },
        });

        await page.close();

        const safeFilename = (filename || 'oferta-eliton-prime.pdf')
            .replace(/[^a-z0-9\-_.() ]/gi, '_');

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename="${safeFilename}"`,
            'Cache-Control': 'no-store',
        });

        res.send(pdfBuffer);

    } catch (error) {
        if (page) await page.close().catch(() => {});
        console.error('PDF Generation Error:', error);
        res.status(500).json({ error: 'Error generating PDF', detail: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`PDF Server running on http://0.0.0.0:${PORT}`);
    console.log(`Accessible on LAN at http://<this-machine-ip>:${PORT}`);
});
