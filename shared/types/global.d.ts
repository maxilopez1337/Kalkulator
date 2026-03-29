// Global browser library declarations (XLSX via SheetJS CDN, ExcelJS via CDN)

declare global {
  interface Window {
    XLSX: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    ExcelJS: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export {};
