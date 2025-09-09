// server/controllers/templates-supabase.js
require('dotenv').config();
const supabase = require('../config/supabase');

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

// Generate option placeholder
function generateOptionPlaceholder(optionText, placeholderId) {
    if (!optionText) return '';
    
    // Remove brackets if they already exist
    let content = optionText;
    if (content.startsWith('[') && content.endsWith(']')) {
        content = content.substring(1, content.length - 1);
    }
    
    return `<span class="placeholder" data-placeholder-id="${placeholderId}">[${content}]</span>`;
}

// Load templates from Supabase
async function loadTemplatesFromSupabase() {
    try {
        console.log("Loading templates from Supabase...");
        
        const { data: templates, error } = await supabase
            .from('templates')
            .select('*')
            .order('"No"');

        if (error) {
            console.error('Error loading templates from Supabase:', error);
            return getSampleTemplates();
        }

        if (!templates || templates.length === 0) {
            console.log("No templates found in Supabase - using sample templates");
            return getSampleTemplates();
        }

        console.log(`Successfully loaded ${templates.length} templates from Supabase`);

        // Convert Supabase data to the expected format
        const formattedTemplates = templates.map(row => {
            const template = {
                id: row.No, // Using "No" column from CSV
                template: row.Template.trim(),
                category: (row["Reasoning Category"] || '') + 
                         (row["Cultural Aspect"] ? ' - ' + row["Cultural Aspect"] : ''),
                reasoning_category: row["Reasoning Category"] || '',
                cultural_aspect: row["Cultural Aspect"] || '',
                template_text: generateTemplateHTML(row.Template),
                // Wrap option templates in placeholder spans
                option_a: generateOptionPlaceholder(row["Correct Option Template"] || 'The correct answer', 'CORRECT_OPTION'),
                option_b: generateOptionPlaceholder(row["Wrong Options Template"] || 'An incorrect answer', 'WRONG_OPTION_1'),
                option_c: generateOptionPlaceholder(row["Wrong Options Template"] || 'An incorrect answer', 'WRONG_OPTION_2'),
                option_d: generateOptionPlaceholder(row["Wrong Options Template"] || 'An incorrect answer', 'WRONG_OPTION_3'),
                
                // Add example question and options
                example: {
                    question: row["Example Question"] || '',
                    optionA: row["Option 1"] || '',
                    optionB: row["Option 2"] || '',
                    optionC: row["Option 3"] || '',
                    optionD: row["Option 4"] || ''
                }
            };
            
            return template;
        });

        console.log("Loaded templates:");
        formattedTemplates.forEach((t, i) => {
            console.log(`${i+1}. ID: ${t.id}, Template: ${t.template.substring(0, 50)}...`);
        });

        return formattedTemplates;
    } catch (error) {
        console.error('Error in loadTemplatesFromSupabase:', error);
        return getSampleTemplates();
    }
}

// Get a random template
const getRandomTemplate = async (req, res) => {
    try {
        console.log("Getting random template from Supabase...");
        const templates = await loadTemplatesFromSupabase();
        
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

// Function to provide sample templates if Supabase fails
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

// Get templates by subset (10 templates per subset)
const getTemplatesBySubset = async (req, res) => {
    try {
        const { subset } = req.query;
        
        if (!subset) {
            return res.status(400).json({ error: 'Subset parameter is required' });
        }
        
        const subsetNum = parseInt(subset);
        if (isNaN(subsetNum) || subsetNum < 1 || subsetNum > 10) {
            return res.status(400).json({ error: 'Subset must be a number between 1 and 10' });
        }
        
        console.log(`Getting templates for subset ${subsetNum}...`);
        
        // Calculate template range for this subset
        const startTemplate = (subsetNum - 1) * 10 + 1;
        const endTemplate = subsetNum * 10;
        
        console.log(`Loading templates ${startTemplate} to ${endTemplate} from Supabase...`);
        
        const { data: templates, error } = await supabase
            .from('templates')
            .select('*')
            .gte('"No"', startTemplate)
            .lte('"No"', endTemplate)
            .order('"No"');

        if (error) {
            console.error('Error loading templates from Supabase:', error);
            // Fallback to sample templates filtered by range
            const sampleTemplates = getSampleTemplates();
            const filteredSamples = sampleTemplates.filter(t => t.id >= startTemplate && t.id <= endTemplate);
            return res.json({ templates: filteredSamples, total: filteredSamples.length, subset: subsetNum });
        }

        if (!templates || templates.length === 0) {
            console.log(`No templates found for subset ${subsetNum} - using sample templates`);
            const sampleTemplates = getSampleTemplates();
            const filteredSamples = sampleTemplates.filter(t => t.id >= startTemplate && t.id <= endTemplate);
            return res.json({ templates: filteredSamples, total: filteredSamples.length, subset: subsetNum });
        }

        console.log(`Successfully loaded ${templates.length} templates for subset ${subsetNum}`);

        // Convert Supabase data to the expected format (same as loadTemplatesFromSupabase)
        const formattedTemplates = templates.map(row => {
            const template = {
                id: row.No, // Using "No" column from CSV
                template: row.Template.trim(),
                category: (row["Reasoning Category"] || '') + 
                         (row["Cultural Aspect"] ? ' - ' + row["Cultural Aspect"] : ''),
                reasoning_category: row["Reasoning Category"] || '',
                cultural_aspect: row["Cultural Aspect"] || '',
                template_text: generateTemplateHTML(row.Template),
                // Wrap option templates in placeholder spans
                option_a: generateOptionPlaceholder(row["Correct Option Template"] || 'The correct answer', 'CORRECT_OPTION'),
                option_b: generateOptionPlaceholder(row["Wrong Options Template"] || 'An incorrect answer', 'WRONG_OPTION_1'),
                option_c: generateOptionPlaceholder(row["Wrong Options Template"] || 'An incorrect answer', 'WRONG_OPTION_2'),
                option_d: generateOptionPlaceholder(row["Wrong Options Template"] || 'An incorrect answer', 'WRONG_OPTION_3'),
                
                // Add example question and options
                example: {
                    question: row["Example Question"] || '',
                    optionA: row["Option 1"] || '',
                    optionB: row["Option 2"] || '',
                    optionC: row["Option 3"] || '',
                    optionD: row["Option 4"] || ''
                }
            };
            
            return template;
        });

        console.log(`Returning ${formattedTemplates.length} formatted templates for subset ${subsetNum}`);
        formattedTemplates.forEach((t, i) => {
            console.log(`  ${startTemplate + i}. ID: ${t.id}, Template: ${t.template.substring(0, 50)}...`);
        });

        res.json({ 
            templates: formattedTemplates, 
            total: formattedTemplates.length, 
            subset: subsetNum,
            range: { start: startTemplate, end: endTemplate }
        });
        
    } catch (error) {
        console.error('Error getting templates by subset:', error);
        res.status(500).json({ error: 'Failed to get templates for subset' });
    }
};

module.exports = {
    getRandomTemplate,
    getTemplatesBySubset
};
