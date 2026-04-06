export const exportToCSV = (data, filename = 'attendance_export.csv') => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get the headers from the first object
  const headers = Object.keys(data[0]);

  // Create the CSV string
  const csvString = [
    headers.join(','),
    ...data.map(item => headers.map(header => {
      // Escape commas and quotes within the data
      let cellData = item[header] !== null && item[header] !== undefined ? item[header] : '';
      if (typeof cellData === 'string' && (cellData.includes(',') || cellData.includes('"') || cellData.includes('\n'))) {
        cellData = `"${cellData.replace(/"/g, '""')}"`;
      }
      return cellData;
    }).join(','))
  ].join('\n');

  // Create a blob and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
