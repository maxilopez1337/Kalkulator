// Global browser library declarations (XLSX via SheetJS CDN, ExcelJS via CDN)
declare global {
    interface Window {
        XLSX: any;
        ExcelJS: any;
    }
}

export {};
