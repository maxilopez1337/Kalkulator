/**
 * Opens HTML as a printable PDF.
 * Desktop: opens in new tab (auto-print via embedded onload script).
 * Mobile: loads in hidden iframe, strips embedded auto-print, calls
 *         iframe.contentWindow.print() → browser shows "Save as PDF" sheet.
 */
export function printHtmlAsPdf(html: string, desktopUrl: string): void {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!isMobile) {
        const win = window.open(desktopUrl, '_blank');
        if (win) win.focus();
        return;
    }

    // Strip any embedded auto-print scripts so we control timing
    const cleanHtml = html.replace(
        /<script\b[^>]*>[\s\S]*?window\.print\s*\(\s*\)[\s\S]*?<\/script>/gi,
        ''
    );

    const cleanBlob = new Blob([cleanHtml], { type: 'text/html' });
    const cleanUrl = URL.createObjectURL(cleanBlob);
    URL.revokeObjectURL(desktopUrl); // no longer needed

    const iframe = document.createElement('iframe');
    iframe.style.cssText =
        'position:fixed;left:-9999px;top:-9999px;width:0;height:0;border:none;opacity:0;pointer-events:none;';
    document.body.appendChild(iframe);

    iframe.onload = () => {
        // Give fonts/images time to load before printing
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            // Clean up after the print dialog is dismissed
            setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(cleanUrl);
            }, 3000);
        }, 1500);
    };

    iframe.src = cleanUrl;
}
