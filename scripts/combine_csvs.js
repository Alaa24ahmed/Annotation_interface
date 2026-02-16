const fs = require('fs');
const path = require('path');

// Directory containing the CSV files
const dataDir = path.join(__dirname, '../data/data_fixed');
const outputFile = path.join(__dirname, '../data/annotations_verified.csv');

console.log('Combining CSV files from:', dataDir);

// Get all CSV files
const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.csv'));

console.log(`Found ${files.length} CSV files`);

let combinedData = '';
let isFirstFile = true;

files.forEach((file, index) => {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    if (isFirstFile) {
        // Include header from first file
        combinedData = content;
        isFirstFile = false;
        console.log(`${index + 1}. ${file} - ${lines.length} lines (with header)`);
    } else {
        // Skip header for subsequent files
        const dataOnly = lines.slice(1).join('\n');
        if (dataOnly.trim()) {
            combinedData += '\n' + dataOnly;
        }
        console.log(`${index + 1}. ${file} - ${lines.length - 1} data lines`);
    }
});

// Write combined file
fs.writeFileSync(outputFile, combinedData);

// Count total lines
const totalLines = combinedData.split('\n').filter(line => line.trim()).length;
console.log('\n✓ Combined CSV created:', outputFile);
console.log(`✓ Total rows: ${totalLines - 1} (excluding header)`);
console.log('\nNext steps:');
console.log('1. Import data/annotations_verified.csv to Supabase');
console.log('2. Create table named "annotations_verified"');
console.log('3. The app will query by country field');
