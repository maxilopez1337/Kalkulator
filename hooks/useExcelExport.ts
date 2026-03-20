
import { useCallback } from 'react';

interface ColumnDef {
    header: string;
    key: string;
    width: number;
    style?: any;
}

interface HeaderGroup {
    title: string;
    span: number;
    style?: any; // Styl dla komórki grupującej
}

interface StyleCallbacks {
    header?: (row: any) => void;
    data?: (row: any, index: number) => void;
    total?: (row: any) => void;
}

interface ExportConfig {
    fileName: string;
    sheetName: string;
    columns: ColumnDef[];
    headerGroups?: HeaderGroup[]; // Nowe pole do definicji grup
    data: any[];
    dataMapper: (item: any, index: number) => Record<string, any>;
    totalData?: Record<string, any>;
    styles?: StyleCallbacks;
}

export const useExcelExport = () => {
    const exportToExcel = useCallback(async ({ 
        fileName, 
        sheetName, 
        columns, 
        headerGroups,
        data, 
        dataMapper, 
        totalData, 
        styles 
    }: ExportConfig) => {
        if (!window.ExcelJS) {
            console.error('ExcelJS not loaded');
            alert('Błąd: Biblioteka ExcelJS nie została załadowana.');
            return;
        }

        try {
            const Workbook = window.ExcelJS.Workbook;
            const workbook = new Workbook();
            const sheet = workbook.addWorksheet(sheetName);

            // 1. Setup Columns (To tworzy wiersz 1 z nagłówkami kolumn)
            sheet.columns = columns;

            // 2. Jeśli mamy grupy nagłówków, musimy przesunąć wszystko w dół i dodać wiersz nadrzędny
            if (headerGroups && headerGroups.length > 0) {
                // Wstaw pusty wiersz na samej górze (indeks 1)
                sheet.spliceRows(1, 0, []); 
                
                // Teraz stare nagłówki są w wierszu 2, a wiersz 1 jest pusty.
                const groupRow = sheet.getRow(1);
                groupRow.height = 25; // Wysokość dla grup

                let currentColumnIndex = 1;
                
                headerGroups.forEach(group => {
                    const startCol = currentColumnIndex;
                    const endCol = currentColumnIndex + group.span - 1;
                    
                    // Ustawienie wartości w pierwszej komórce zakresu
                    const cell = sheet.getCell(1, startCol);
                    cell.value = group.title.toUpperCase();

                    // Łączenie komórek
                    if (group.span > 1) {
                        sheet.mergeCells(1, startCol, 1, endCol);
                    }

                    // Stylizacja grupy
                    if (group.style) {
                        // Aplikuj styl do wszystkich komórek w zakresie (ważne dla obramowania i tła)
                        for (let c = startCol; c <= endCol; c++) {
                            const cCell = sheet.getCell(1, c);
                            // Kopiowanie stylu
                            if (group.style.fill) cCell.fill = group.style.fill;
                            if (group.style.font) cCell.font = group.style.font;
                            if (group.style.alignment) cCell.alignment = group.style.alignment;
                            if (group.style.border) cCell.border = group.style.border;
                        }
                    } else {
                        // Domyślny styl grupy
                        cell.font = { bold: true, size: 10, name: 'Calibri' };
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }

                    currentColumnIndex += group.span;
                });
            }

            // 3. Style Header (Teraz to jest wiersz 2, jeśli były grupy, lub 1 jeśli nie)
            const headerRowIdx = headerGroups ? 2 : 1;
            if (styles?.header) {
                styles.header(sheet.getRow(headerRowIdx));
            }

            // 4. Add Data Rows
            data.forEach((item, index) => {
                const mappedRow = dataMapper(item, index);
                const row = sheet.addRow(mappedRow);
                if (styles?.data) {
                    styles.data(row, index);
                }
            });

            // 5. Add Total Row
            if (totalData) {
                const row = sheet.addRow(totalData);
                if (styles?.total) {
                    styles.total(row);
                }
            }

            // 6. Generate and Download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
            anchor.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Wystąpił błąd podczas generowania pliku Excel.');
        }
    }, []);

    return { exportToExcel };
};
