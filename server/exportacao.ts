import ExcelJS from "exceljs";

export async function exportarParaExcel(dados: any[], colunas: string[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Dados");

  // Adicionar cabeçalhos
  worksheet.addRow(colunas);
  
  // Estilizar cabeçalho
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F81BD" },
  };
  worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

  // Adicionar dados
  dados.forEach((item) => {
    const row: any[] = [];
    colunas.forEach((col) => {
      row.push(item[col] || "");
    });
    worksheet.addRow(row);
  });

  // Ajustar largura das colunas
  worksheet.columns.forEach((column) => {
    if (column) {
      column.width = 15;
    }
  });

  // Gerar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export async function exportarParaPDF(dados: any[], titulo: string) {
  // Implementação simplificada - retorna HTML que pode ser convertido em PDF
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${titulo}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4F81BD; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>${titulo}</h1>
      <table>
        <thead>
          <tr>
  `;

  // Cabeçalhos
  if (dados.length > 0) {
    Object.keys(dados[0]).forEach((key) => {
      html += `<th>${key}</th>`;
    });
  }

  html += `
          </tr>
        </thead>
        <tbody>
  `;

  // Dados
  dados.forEach((item) => {
    html += "<tr>";
    Object.values(item).forEach((value) => {
      html += `<td>${value}</td>`;
    });
    html += "</tr>";
  });

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  return html;
}
