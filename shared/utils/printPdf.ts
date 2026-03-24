/**
 * Generates a PDF from HTML content and triggers a download.
 *
 * Primary path  — POST the HTML to the local Puppeteer server (:3002).
 *   Headless Chrome renders the HTML at exact A4 dimensions, returns a
 *   real PDF binary.  Client creates a <a download> link and clicks it.
 *   On iOS this shows the native "Download" sheet → saves to Files directly.
 *   On desktop this saves the file immediately.  No print dialog anywhere.
 *
 * Fallback path — when the server is unreachable, falls back to opening the
 *   HTML in a new browser tab (auto-print via window.onload is embedded in
 *   the HTML). Works on both desktop and mobile.
 */
export async function printHtmlAsPdf(
    html: string,
    desktopUrl: string,
    filename = 'oferta-eliton-prime.pdf'
): Promise<void> {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    // Open the fallback window synchronously BEFORE any async work,
    // so the browser recognises it as triggered by the user gesture.
    // On local dev we keep it as a placeholder; on Vercel we skip the fetch entirely.
    const fallbackWindow = window.open('', '_blank');

    if (isLocal) {
        const serverUrl = `${window.location.protocol}//${window.location.hostname}:3002/generate-pdf`;
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8_000);

            const res = await fetch(serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html }),
                signal: controller.signal,
            });

            clearTimeout(timer);

            if (res.ok) {
                const blob = await res.blob();
                const pdfUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = pdfUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 10_000);
                URL.revokeObjectURL(desktopUrl);
                fallbackWindow?.close();
                return;
            }
        } catch {
            // Server unreachable or timed-out — fall through to browser fallback
        }
    }

    // Fallback: navigate the pre-opened tab to the blob URL
    // (embedded window.onload calls window.print())
    if (fallbackWindow) {
        fallbackWindow.location.href = desktopUrl;
        fallbackWindow.focus();
    } else {
        window.open(desktopUrl, '_blank')?.focus();
    }
}
