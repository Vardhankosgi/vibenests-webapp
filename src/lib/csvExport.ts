export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }
  
  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(fieldName => {
        let value = row[fieldName];
        if (value === null || value === undefined) value = "";
        if (typeof value === "object") value = JSON.stringify(value);
        // Escape quotes
        value = String(value).replace(/"/g, '""');
        // Wrap in quotes if it contains comma, newline or quotes
        if (value.search(/("|,|\n)/g) >= 0) {
          value = `"${value}"`;
        }
        return value;
      }).join(",")
    )
  ].join("\n");

  // Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
