// // server/controllers/templates.js
// const fs = require('fs');
// const path = require('path');
// const csv = require('csv-parser');

// // Path to your CSV file
// const csvPath = path.join(__dirname, '../../data/templates.csv');
// console.log("Looking for CSV file at:", csvPath);

// // Parse the CSV file and convert it to an array of template objects
// async function loadTemplatesFromCSV() {
//     return new Promise((resolve, reject) => {
//         if (!fs.existsSync(csvPath)) {
//             console.error("CSV file not found - using sample templates");
//             return resolve(getSampleTemplates());
//         }
        
//         console.log("Reading CSV file...");
//         const templates = [];
//         let rowCount = 0;
        
//         // Print the first few lines of the CSV file to debug
//         const fileContent = fs.readFileSync(csvPath, 'utf8');
//         console.log("First 200 characters of CSV file:");
//         console.log(fileContent.substring(0, 200));
        
//         fs.createReadStream(csvPath)
//             .on('error', (error) => {
//                 console.error("Error opening CSV file:", error);
//                 resolve(getSampleTemplates());
//             })
//             .pipe(csv())
//             .on('data', (row) => {
//                 rowCount++;
//                 console.log(`Processing row ${rowCount}:`, JSON.stringify(row).substring(0, 100) + "...");
                
//                 // Skip empty rows or rows without templates
//                 if (!row.No || !row.Template || row.Template.trim() === '') {
//                     console.log(`Skipping row ${rowCount} - invalid template`);
//                     return;
//                 }
                
//                 try {
//                     // Convert CSV rows to template objects
//                     const template = {
//                         id: parseInt(row.No),
//                         template: row.Template.trim(),
//                         category: (row['Reasoning Category'] || '') + 
//                                 (row['Cultural Aspect'] ? ' - ' + row['Cultural Aspect'] : ''),
//                         template_text: generateTemplateHTML(row.Template)
//                     };
                    
//                     templates.push(template);
//                     console.log(`Added template #${template.id}: ${template.template.substring(0, 50)}...`);
//                 } catch (err) {
//                     console.error(`Error processing row ${rowCount}:`, err);
//                 }
//             })
//             .on('end', () => {
//                 console.log(`Successfully loaded ${templates.length} templates from CSV`);
                
//                 if (templates.length === 0) {
//                     console.log("No valid templates found in CSV - using sample templates");
//                     resolve(getSampleTemplates());
//                 } else {
//                     // Print all loaded templates
//                     console.log("Loaded templates:");
//                     templates.forEach((t, i) => {
//                         console.log(`${i+1}. ID: ${t.id}, Template: ${t.template.substring(0, 50)}...`);
//                     });
//                     resolve(templates);
//                 }
//             });
//     });
// }

// // Generate HTML with placeholder spans from template text
// function generateTemplateHTML(templateText) {
//     if (!templateText) {
//         console.log("Warning: Empty template text");
//         return '';
//     }
    
//     console.log("Generating HTML for template:", templateText.substring(0, 50) + "...");
    
//     // Replace newlines with <br> tags
//     let html = templateText.replace(/\n/g, '<br>');
    
//     // Convert placeholders to spans
//     html = html.replace(/\[([^\]]+)\]/g, (match, placeholder) => {
//         // Ensure placeholder ID is valid for HTML attributes (no spaces, special chars)
//         const placeholderId = placeholder.replace(/\s+/g, '_').replace(/[^\w]/g, '');
//         return `<span class="placeholder" data-placeholder-id="${placeholder}">[${placeholder}]</span>`;
//     });
    
//     return html;
// }

// // Get a random template
// const getRandomTemplate = async (req, res) => {
//     try {
//         console.log("Getting random template...");
//         const templates = await loadTemplatesFromCSV();
        
//         if (templates.length === 0) {
//             console.log("No templates found");
//             return res.status(404).json({ error: 'No templates found' });
//         }
        
//         // Select a random template
//         const randomIndex = Math.floor(Math.random() * templates.length);
//         const template = templates[randomIndex];
        
//         console.log(`Selected random template #${template.id} (index ${randomIndex} of ${templates.length})`);
//         res.json(template);
//     } catch (error) {
//         console.error('Error getting random template:', error);
//         res.status(500).json({ error: 'Failed to get template' });
//     }
// };

// // Function to provide sample templates if CSV fails
// function getSampleTemplates() {
//     console.log("Using sample templates");
//     return [
//         {
//             id: 1,
//             template: "Which of the following is the furthest from [CITY]?",
//             category: "Mathematical Reasoning - Distance Calculation",
//             template_text: generateTemplateHTML("Which of the following is the furthest from [CITY]?\n[CITY_A]\n[CITY_B]\n[CITY_C]\n[CITY_D]")
//         },
//         {
//             id: 2,
//             template: "In [CULTURE], what does the proverb '[PROVERB]' mean?",
//             category: "Cultural Understanding - Proverbs",
//             template_text: generateTemplateHTML("In [CULTURE], what does the proverb '[PROVERB]' mean?\n[ANSWER_A]\n[ANSWER_B]\n[ANSWER_C]\n[ANSWER_D]")
//         }
//     ];
// }

// module.exports = {
//     getRandomTemplate
// };


// // server/controllers/templates.js
// const fs = require('fs');
// const path = require('path');
// const csv = require('csv-parser');

// // Path to your CSV file
// const csvPath = path.join(__dirname, '../../data/templates.csv');
// console.log("Looking for CSV file at:", csvPath);

// // Generate option placeholder
// function generateOptionPlaceholder(optionText, placeholderId) {
//     if (!optionText) return '';
    
//     // Remove brackets if they already exist
//     let content = optionText;
//     if (content.startsWith('[') && content.endsWith(']')) {
//         content = content.substring(1, content.length - 1);
//     }
    
//     // For debugging
//     console.log(`Creating placeholder for "${content}" with ID "${placeholderId}"`);
    
//     return `<span class="placeholder" data-placeholder-id="${placeholderId}">[${content}]</span>`;
// }



// // Parse the CSV file and convert it to an array of template objects
// async function loadTemplatesFromCSV() {
//     return new Promise((resolve, reject) => {
//         if (!fs.existsSync(csvPath)) {
//             console.error("CSV file not found - using sample templates");
//             return resolve(getSampleTemplates());
//         }
        
//         console.log("Reading CSV file...");
//         const templates = [];
//         let rowCount = 0;
        
//         // Print the first few lines of the CSV file to debug
//         const fileContent = fs.readFileSync(csvPath, 'utf8');
//         console.log("First 200 characters of CSV file:");
//         console.log(fileContent.substring(0, 200));
        
//         fs.createReadStream(csvPath)
//             .on('error', (error) => {
//                 console.error("Error opening CSV file:", error);
//                 resolve(getSampleTemplates());
//             })
//             .pipe(csv())
//             .on('data', (row) => {
//                 rowCount++;
//                 console.log(`Processing row ${rowCount}:`, JSON.stringify(row).substring(0, 100) + "...");
                
//                 // Skip empty rows or rows without templates
//                 if (!row.No || !row.Template || row.Template.trim() === '') {
//                     console.log(`Skipping row ${rowCount} - invalid template`);
//                     return;
//                 }
                
//                 try {
//                     // Convert CSV rows to template objects
//                     const template = {
//                         id: parseInt(row.No),
//                         template: row.Template.trim(),
//                         category: (row['Reasoning Category'] || '') + 
//                                 (row['Cultural Aspect'] ? ' - ' + row['Cultural Aspect'] : ''),
//                         template_text: generateTemplateHTML(row.Template),
//                         // Wrap option templates in placeholder spans
//                         option_a: generateOptionPlaceholder(row['Correct Option Template'] || 'The correct answer', 'CORRECT_OPTION'),
//                         option_b: generateOptionPlaceholder(row['Wrong Options Template'] || 'An incorrect answer', 'WRONG_OPTION_1'),
//                         option_c: generateOptionPlaceholder(row['Wrong Options Template'] || 'An incorrect answer', 'WRONG_OPTION_2'),
//                         option_d: generateOptionPlaceholder(row['Wrong Options Template'] || 'An incorrect answer', 'WRONG_OPTION_3')
//                     };
                    
//                     templates.push(template);
//                     console.log(`Added template #${template.id}: ${template.template.substring(0, 50)}...`);
//                 } catch (err) {
//                     console.error(`Error processing row ${rowCount}:`, err);
//                 }
//             })
//             .on('end', () => {
//                 console.log(`Successfully loaded ${templates.length} templates from CSV`);
                
//                 if (templates.length === 0) {
//                     console.log("No valid templates found in CSV - using sample templates");
//                     resolve(getSampleTemplates());
//                 } else {
//                     // Print all loaded templates
//                     console.log("Loaded templates:");
//                     templates.forEach((t, i) => {
//                         console.log(`${i+1}. ID: ${t.id}, Template: ${t.template.substring(0, 50)}...`);
//                     });
//                     resolve(templates);
//                 }
//             });
//     });
// }

// // Generate HTML with placeholder spans from template text
// function generateTemplateHTML(templateText) {
//     if (!templateText) {
//         console.log("Warning: Empty template text");
//         return '';
//     }
    
//     console.log("Generating HTML for template:", templateText.substring(0, 50) + "...");
    
//     // Replace newlines with <br> tags
//     let html = templateText.replace(/\n/g, '<br>');
    
//     // Convert placeholders to spans
//     html = html.replace(/\[([^\]]+)\]/g, (match, placeholder) => {
//         return `<span class="placeholder" data-placeholder-id="${placeholder}">[${placeholder}]</span>`;
//     });
    
//     return html;
// }

// // Get a random template
// const getRandomTemplate = async (req, res) => {
//     try {
//         console.log("Getting random template...");
//         const templates = await loadTemplatesFromCSV();
        
//         if (templates.length === 0) {
//             console.log("No templates found");
//             return res.status(404).json({ error: 'No templates found' });
//         }
        
//         // Select a random template
//         const randomIndex = Math.floor(Math.random() * templates.length);
//         const template = templates[randomIndex];
        
//         console.log(`Selected random template #${template.id} (index ${randomIndex} of ${templates.length})`);
//         res.json(template);
//     } catch (error) {
//         console.error('Error getting random template:', error);
//         res.status(500).json({ error: 'Failed to get template' });
//     }
// };

// // Function to provide sample templates if CSV fails
// function getSampleTemplates() {
//     console.log("Using sample templates");
//     return [
//         {
//             id: 1,
//             template: "Which of the following is the furthest from [CITY]?",
//             category: "Mathematical Reasoning - Distance Calculation",
//             template_text: generateTemplateHTML("Which of the following is the furthest from [CITY]?"),
//             option_a: '<span class="placeholder" data-placeholder-id="CORRECT_OPTION">[The city that is geographically furthest]</span>',
//             option_b: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_1">[Cities that are geographically closer]</span>',
//             option_c: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_2">[Cities that are geographically closer]</span>',
//             option_d: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_3">[Cities that are geographically closer]</span>'
//         },
//         {
//             id: 2,
//             template: "In [CULTURE], what does the proverb '[PROVERB]' mean?",
//             category: "Cultural Understanding - Proverbs",
//             template_text: generateTemplateHTML("In [CULTURE], what does the proverb '[PROVERB]' mean?"),
//             option_a: '<span class="placeholder" data-placeholder-id="CORRECT_OPTION">[The actual meaning of the proverb]</span>',
//             option_b: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_1">[An incorrect interpretation]</span>',
//             option_c: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_2">[An incorrect interpretation]</span>',
//             option_d: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_3">[An incorrect interpretation]</span>'
//         }
//     ];
// }

// module.exports = {
//     getRandomTemplate
// };



// server/controllers/templates.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Path to your CSV file
const csvPath = path.join(__dirname, '../../data/templates.csv');
console.log("Looking for CSV file at:", csvPath);

// Generate option placeholder
function generateOptionPlaceholder(optionText, placeholderId) {
    if (!optionText) return '';
    
    // Remove brackets if they already exist
    let content = optionText;
    if (content.startsWith('[') && content.endsWith(']')) {
        content = content.substring(1, content.length - 1);
    }
    
    // For debugging
    console.log(`Creating placeholder for "${content}" with ID "${placeholderId}"`);
    
    return `<span class="placeholder" data-placeholder-id="${placeholderId}">[${content}]</span>`;
}

// Parse the CSV file and convert it to an array of template objects
async function loadTemplatesFromCSV() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(csvPath)) {
            console.error("CSV file not found - using sample templates");
            return resolve(getSampleTemplates());
        }
        
        console.log("Reading CSV file...");
        const templates = [];
        let rowCount = 0;
        
        // Print the first few lines of the CSV file to debug
        const fileContent = fs.readFileSync(csvPath, 'utf8');
        console.log("First 200 characters of CSV file:");
        console.log(fileContent.substring(0, 200));
        
        fs.createReadStream(csvPath)
            .on('error', (error) => {
                console.error("Error opening CSV file:", error);
                resolve(getSampleTemplates());
            })
            .pipe(csv())
            .on('data', (row) => {
                rowCount++;
                console.log(`Processing row ${rowCount}:`, JSON.stringify(row).substring(0, 100) + "...");
                
                // Skip empty rows or rows without templates
                if (!row.No || !row.Template || row.Template.trim() === '') {
                    console.log(`Skipping row ${rowCount} - invalid template`);
                    return;
                }
                
                try {
                    // Convert CSV rows to template objects
                    const template = {
                        id: parseInt(row.No),
                        template: row.Template.trim(),
                        category: (row['Reasoning Category'] || '') + 
                                ((row['Cultural Aspects '] || row['Cultural Aspects']) ? ' - ' + (row['Cultural Aspects '] || row['Cultural Aspects']) : ''),
                        reasoning_category: row['Reasoning Category'] || '',
                        cultural_aspect: row['Cultural Aspects '] || row['Cultural Aspects'] || '',
                        template_text: generateTemplateHTML(row.Template),
                        // Wrap option templates in placeholder spans
                        option_a: generateOptionPlaceholder(row['Correct Option Template'] || 'The correct answer', 'CORRECT_OPTION'),
                        option_b: generateOptionPlaceholder(row['Wrong Options Template'] || 'An incorrect answer', 'WRONG_OPTION_1'),
                        option_c: generateOptionPlaceholder(row['Wrong Options Template'] || 'An incorrect answer', 'WRONG_OPTION_2'),
                        option_d: generateOptionPlaceholder(row['Wrong Options Template'] || 'An incorrect answer', 'WRONG_OPTION_3'),
                        
                        // Add example question and options from the CSV
                        example: {
                            question: row['Example Question'] || '',
                            optionA: row['Option 1'] || '',
                            optionB: row['Option 2'] || '',
                            optionC: row['Option 3'] || '',
                            optionD: row['Option 4'] || ''
                        }
                    };
                    
                    templates.push(template);
                    console.log(`Added template #${template.id}: ${template.template.substring(0, 50)}...`);
                    console.log(`Example question: ${template.example.question.substring(0, 50)}...`);
                } catch (err) {
                    console.error(`Error processing row ${rowCount}:`, err);
                }
            })
            .on('end', () => {
                console.log(`Successfully loaded ${templates.length} templates from CSV`);
                
                if (templates.length === 0) {
                    console.log("No valid templates found in CSV - using sample templates");
                    resolve(getSampleTemplates());
                } else {
                    // Print all loaded templates
                    console.log("Loaded templates:");
                    templates.forEach((t, i) => {
                        console.log(`${i+1}. ID: ${t.id}, Template: ${t.template.substring(0, 50)}...`);
                    });
                    resolve(templates);
                }
            });
    });
}

// Generate HTML with placeholder spans from template text
function generateTemplateHTML(templateText) {
    if (!templateText) {
        console.log("Warning: Empty template text");
        return '';
    }
    
    console.log("Generating HTML for template:", templateText.substring(0, 50) + "...");
    
    // Replace newlines with <br> tags
    let html = templateText.replace(/\n/g, '<br>');
    
    // Convert placeholders to spans
    html = html.replace(/\[([^\]]+)\]/g, (match, placeholder) => {
        return `<span class="placeholder" data-placeholder-id="${placeholder}">[${placeholder}]</span>`;
    });
    
    return html;
}

// Get a random template
const getRandomTemplate = async (req, res) => {
    try {
        console.log("Getting random template...");
        const templates = await loadTemplatesFromCSV();
        
        if (templates.length === 0) {
            console.log("No templates found");
            return res.status(404).json({ error: 'No templates found' });
        }
        
        // Select a random template
        const randomIndex = Math.floor(Math.random() * templates.length);
        const template = templates[randomIndex];
        
        console.log(`Selected random template #${template.id} (index ${randomIndex} of ${templates.length})`);
        
        // Log example data to verify it's being sent
        console.log("Example data for template:", template.example);
        
        res.json(template);
    } catch (error) {
        console.error('Error getting random template:', error);
        res.status(500).json({ error: 'Failed to get template' });
    }
};

// Function to provide sample templates if CSV fails
function getSampleTemplates() {
    console.log("Using sample templates");
    return [
        {
            id: 1,
            template: "Which of the following is the furthest from [CITY]?",
            category: "Mathematical Reasoning - Distance Calculation",
            template_text: generateTemplateHTML("Which of the following is the furthest from [CITY]?"),
            option_a: '<span class="placeholder" data-placeholder-id="CORRECT_OPTION">[The city that is geographically furthest]</span>',
            option_b: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_1">[Cities that are geographically closer]</span>',
            option_c: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_2">[Cities that are geographically closer]</span>',
            option_d: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_3">[Cities that are geographically closer]</span>',
            example: {
                question: "Which of the following is the furthest from Jakarta?",
                optionA: "London",
                optionB: "Manila",
                optionC: "Bangkok",
                optionD: "Singapore"
            }
        },
        {
            id: 2,
            template: "In [CULTURE]'s traditional medicine, which herb treats [AILMENT or DISEASE]?",
            category: "Cultural Understanding - Traditional Medicine",
            template_text: generateTemplateHTML("In [CULTURE]'s traditional medicine, which herb treats [AILMENT or DISEASE]?"),
            option_a: '<span class="placeholder" data-placeholder-id="CORRECT_OPTION">[The herb used in that culture\'s traditional medicine for the specified ailment]</span>',
            option_b: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_1">[Herbs not used for that ailment in that culture\'s medicine]</span>',
            option_c: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_2">[Herbs not used for that ailment in that culture\'s medicine]</span>',
            option_d: '<span class="placeholder" data-placeholder-id="WRONG_OPTION_3">[Herbs not used for that ailment in that culture\'s medicine]</span>',
            example: {
                question: "In Chinese traditional medicine, which herb treats insomnia?",
                optionA: "Valerian root",
                optionB: "Ginseng",
                optionC: "Ginger",
                optionD: "Astragalus"
            }
        }
    ];
}

module.exports = {
    getRandomTemplate
};