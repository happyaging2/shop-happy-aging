const fs = require('fs');

// Function to convert rem values
function convertRemToNewValue(cssContent) {
  return cssContent.replace(/([\d.]+)rem/g, (match, value) => {
    const originalValue = parseFloat(value);
    const newValue = originalValue * 1.6;
    return `${newValue.toFixed(2)}rem`;
  });
}

// Input and output file paths
const inputFile = 'tailwind.css';
const outputFile = 'tailwind-new.css';

// Read the CSS file
fs.readFile(inputFile, 'utf8', (err, cssContent) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Convert rem values
  const updatedCss = convertRemToNewValue(cssContent);

  // Write the updated CSS to a new file
  fs.writeFile(outputFile, updatedCss, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }

    console.log(`Updated CSS written to ${outputFile}`);
  });
});
