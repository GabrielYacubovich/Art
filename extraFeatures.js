// Fetch data from CSV
export async function fetchCSVData(file) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error("Failed to fetch CSV data");
    }
    const data = await response.text();
    const parsedData = data.split('\n').slice(1)
      .filter(row => !row.startsWith('@') && row.trim() !== '');
    const artData = parsedData.map((row) => {
      const [title, year, image, size, price, categories] = row.split(',');
      return { title, year, image, size, price, categories: categories.split(';') };
    });
    return artData;
  } catch (error) {
    console.error(error);
    return [];
  }
}

 