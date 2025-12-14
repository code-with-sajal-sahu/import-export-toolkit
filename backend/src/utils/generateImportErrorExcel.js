import xlsx from "xlsx";
import fs from "fs";
import path from "path";

/**
 * Generate error excel for any import
 */
export const generateImportErrorExcel = ({
  errors = [],
  columns = [],
  filePrefix = "import-errors",
  folder = "errors",
}) => {
  if (!errors.length) return null;

  const formattedErrors = errors.map(err => {
    const rowData = { Row: err.row };

    columns.forEach(col => {
      rowData[col.header] =
        err.data?.[col.key] ??
        err.data?.[col.key?.toLowerCase()] ??
        "";
    });

    rowData.Reason = err.reason;
    return rowData;
  });

  const worksheet = xlsx.utils.json_to_sheet(formattedErrors);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Errors");

  const baseDir = path.join("public", "uploads", folder);
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const fileName = `${filePrefix}-${Date.now()}.xlsx`;
  const filePath = path.join(baseDir, fileName);

  xlsx.writeFile(workbook, filePath);

  // Returned path matches static route: /uploads/**
//   return `/uploads/${folder}/${fileName}`;
  return `${fileName}`;
};
