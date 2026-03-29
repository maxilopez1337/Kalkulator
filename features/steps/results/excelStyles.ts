// Helpery do stylów Excela używane przy generowaniu raportów

interface ExcelRow {
  font?: Record<string, unknown>;
  fill?: Record<string, unknown>;
  alignment?: Record<string, unknown>;
  height?: number;
  eachCell: (callback: (cell: ExcelCell) => void) => void;
  getCell: (col: number) => ExcelCell;
}

interface ExcelCell {
  fill?: Record<string, unknown>;
  font?: Record<string, unknown>;
  alignment?: Record<string, unknown>;
  border?: Record<string, unknown>;
  value?: unknown;
  numFmt?: string;
}

export const applyHeaderStyle = (row: ExcelRow) => {
  row.font = { bold: true, color: { argb: 'FF000000' }, size: 10, name: 'Calibri' }; // Czarny tekst
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }; // Slate 100 (Jasne tło dla kolumn)
  row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  row.height = 45;

  row.eachCell((cell: ExcelCell) => {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FF94A3B8' } }, // Ciemniejszy dół
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });
};

// Style dla grup nagłówków (Wiersz 1)
export const groupStyles = {
  base: {
    font: { bold: true, size: 11, name: 'Calibri', color: { argb: 'FF334155' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    },
  },
  gray: {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }, // Slate 50
  },
  blue: {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } }, // Blue 50
    font: { bold: true, size: 11, name: 'Calibri', color: { argb: 'FF1E40AF' } },
    border: {
      top: { style: 'thin', color: { argb: 'FFBFDBFE' } },
      left: { style: 'thin', color: { argb: 'FFBFDBFE' } },
      right: { style: 'thin', color: { argb: 'FFBFDBFE' } },
      bottom: { style: 'thin', color: { argb: 'FFBFDBFE' } },
    },
  },
  indigo: {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } }, // Indigo 50
    font: { bold: true, size: 11, name: 'Calibri', color: { argb: 'FF3730A3' } },
  },
  emerald: {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } }, // Emerald 50
    font: { bold: true, size: 11, name: 'Calibri', color: { argb: 'FF065F46' } },
  },
  amber: {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } }, // Amber 50
    font: { bold: true, size: 11, name: 'Calibri', color: { argb: 'FF92400E' } },
  },
  purple: {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAF5FF' } }, // Purple 50
    font: { bold: true, size: 11, name: 'Calibri', color: { argb: 'FF6B21A8' } },
  },
  rose: {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } }, // Rose 50
    font: { bold: true, size: 11, name: 'Calibri', color: { argb: 'FF9F1239' } },
  },
  teal: {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDFA' } }, // Teal 50
    font: { bold: true, size: 11, name: 'Calibri', color: { argb: 'FF115E59' } },
  },
};

export const applyTotalStyle = (row: ExcelRow) => {
  row.font = { bold: true, color: { argb: 'FF000000' }, size: 11, name: 'Calibri' };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; // Slate 200
  row.alignment = { vertical: 'middle', horizontal: 'right' };
  row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }; // LP
  row.eachCell((cell: ExcelCell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
};

export const applyDataStyle = (row: ExcelRow) => {
  row.font = { name: 'Calibri', size: 11 };
  row.alignment = { vertical: 'middle', horizontal: 'right' };
  row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
  row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };

  row.eachCell((cell: ExcelCell) => {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    };
  });
};
