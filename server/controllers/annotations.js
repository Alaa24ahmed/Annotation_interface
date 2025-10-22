
// server/controllers/annotations.js
require('dotenv').config();
const supabase = require('../config/supabase');

exports.saveAnnotation = async (req, res) => {
    try {
      console.log("Received annotation data:", req.body);
      
      // Validate input
      const { 
        template_id, 
        reasoning_category,
        cultural_aspect,
        original_template, 
        values,
        generated_question,
        generated_option1,
        generated_option2,
        generated_option3,
        generated_option4,
        translated_question,
        translated_option1,
        translated_option2,
        translated_option3,
        translated_option4,
        // True-False questions and translations
        true_question_english,
        false_question_english,
        true_question_translation,
        false_question_translation,
        // Add new user tracking fields
        user_id,
        device_fingerprint,
        // Add demographics data
        language,
        country,
        // NEW: Add subset tracking and timing fields
        subset_id,
        template_position,
        completion_status,
        time_spent_seconds
      } = req.body;
      
      // Determine user type for logging
      const isPilotUser = user_id === '742891' || user_id === '586234' || user_id === '193847' || user_id === '415672';
      
      if (!template_id) {
        return res.status(400).json({ error: 'Missing template ID' });
      }
      
      // Validate user tracking fields
      if (!user_id) {
        return res.status(400).json({ error: 'Missing user ID' });
      }
      
      if (!device_fingerprint) {
        return res.status(400).json({ error: 'Missing device fingerprint' });
      }
      
      if (!values || Object.keys(values).length === 0) {
        return res.status(400).json({ error: 'Missing placeholder values' });
      }
      
      // Validate required fields
      const requiredFields = [
        'generated_question', 
        'generated_option1', 
        'generated_option2', 
        'generated_option3', 
        'generated_option4',
        'translated_question',
        'translated_option1',
        'translated_option2',
        'translated_option3',
        'translated_option4',
        'true_question_english',
        'false_question_english',
        'true_question_translation',
        'false_question_translation'
      ];
      
      for (const field of requiredFields) {
        if (!req.body[field] || req.body[field].trim() === '') {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }
      
      // Check if any values are empty
      for (const key in values) {
        if (!values[key] || values[key].trim() === '') {
          return res.status(400).json({ error: `Empty value for placeholder: ${key}` });
        }
      }
      
      // Get IP address from middleware
      const user_ip = req.userIP || req.ip || 'unknown';
      
      // Create payload for Supabase
      const payload = {
        template_id,
        reasoning_category: reasoning_category || '',
        cultural_aspect: cultural_aspect || '',
        original_template: original_template || '',
        values,
        generated_question,
        generated_option1,
        generated_option2,
        generated_option3,
        generated_option4,
        translated_question,
        translated_option1,
        translated_option2,
        translated_option3,
        translated_option4,
        // True-False questions and translations
        true_question_english,
        false_question_english,
        true_question_translation,
        false_question_translation,
        // Add user tracking data
        user_id,
        device_fingerprint,
        user_ip,
        // Add demographics data
        language: language || null,
        country: country || null,
        // NEW: Add subset tracking and timing data
        subset_id: subset_id || null,
        template_position: template_position || null,
        completion_status: completion_status || 'completed',
        time_spent_seconds: time_spent_seconds || null
      };
      
      console.log("Inserting into Supabase:", payload);
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('annotations')
        .insert([payload]);
        
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      // Log user type and info
      const userType = isPilotUser ? 'Pilot' : 'Development';
      console.log(`${userType} annotation saved - User: ${user_id}, Language: ${language}, Country: ${country}, Fingerprint: ${device_fingerprint}, IP: ${user_ip}`);
      
      console.log("Successfully saved to Supabase");
      res.status(201).json({ 
        success: true, 
        message: 'Annotation saved successfully',
        user_id: user_id,
        device_fingerprint: device_fingerprint,
        user_type: userType
      });
    } catch (error) {
      console.error('Error saving annotation:', error);
      res.status(500).json({ error: error.message });
    }
  };

// Get annotations 
exports.getAnnotations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('annotations')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Log template skip for analytics
exports.logTemplateSkip = async (req, res) => {
  try {
    console.log("Received template skip:", req.body);
    
    const { 
      template_id,
      reasoning_category,
      cultural_aspect,
      original_template,
      user_id,
      device_fingerprint,
      is_prolific_user,
      skip_reason,
      // Add demographics fields
      language,
      country,
      // NEW: Add subset tracking and timing fields
      subset_id,
      template_position,
      completion_status,
      time_spent_seconds
    } = req.body;
    
    // Determine user type for logging
    const isPilotUser = user_id === '742891' || user_id === '586234' || user_id === '193847' || user_id === '415672';
    
    // Validate required fields
    if (!template_id || !user_id || !device_fingerprint || !skip_reason) {
      return res.status(400).json({ 
        error: 'Missing required fields for template skip logging (template_id, user_id, device_fingerprint, skip_reason)' 
      });
    }
    
    // Validate skip reason is not empty
    if (!skip_reason.trim()) {
      return res.status(400).json({ 
        error: 'Skip reason cannot be empty' 
      });
    }
    
    // Get IP address from middleware
    const user_ip = req.userIP || req.ip || 'unknown';
    
    // Create payload for database storage
    const skipPayload = {
      template_id,
      reasoning_category: reasoning_category || '',
      cultural_aspect: cultural_aspect || '',
      original_template: original_template || '',
      user_id,
      device_fingerprint,
      user_ip,
      skip_reason: skip_reason.trim(),
      language: language || null,
      country: country || null,
      // NEW: Add subset tracking and timing data
      subset_id: subset_id || null,
      template_position: template_position || null,
      completion_status: completion_status || 'skipped',
      time_spent_seconds: time_spent_seconds || null
    };
    
    console.log("Saving template skip to database:", skipPayload);
    
    // Save to Supabase template_skips table
    const { data, error } = await supabase
      .from('template_skips')
      .insert([skipPayload]);
      
    if (error) {
      console.error("Supabase error saving skip:", error);
      throw error;
    }
    
    const userType = isPilotUser ? 'Pilot' : 'Development';
    console.log(`${userType} template skipped and saved - User: ${user_id}, Template: ${template_id}, Reason: ${skip_reason.substring(0, 50)}..., IP: ${user_ip}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Template skip logged successfully',
      user_id: user_id,
      template_id: template_id
    });
    
  } catch (error) {
    console.error('Error logging template skip:', error);
    res.status(500).json({ error: error.message });
  }
};