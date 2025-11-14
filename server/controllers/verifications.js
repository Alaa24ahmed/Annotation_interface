const supabase = require('../config/supabase');

/**
 * Get annotations that need verification for a specific subset and language
 */
async function getAnnotationsForVerification(req, res) {
  try {
    const { subset, language } = req.query;

    // Validate parameters
    if (!subset || !language) {
      return res.status(400).json({
        error: 'Missing required parameters: subset and language'
      });
    }

    const subsetId = parseInt(subset);
    if (isNaN(subsetId) || subsetId < 1 || subsetId > 10) {
      return res.status(400).json({
        error: 'Invalid subset ID. Must be between 1 and 10'
      });
    }

    // Query annotations from the specified subset and language
    // Only get annotations that have all required fields filled
    const { data, error } = await supabase
      .from('annotations')
      .select('*')
      .eq('subset_id', subsetId)
      .eq('language', language)
      .not('generated_question', 'is', null)
      .not('generated_option1', 'is', null)
      .not('generated_option2', 'is', null)
      .not('generated_option3', 'is', null)
      .not('generated_option4', 'is', null)
      .not('translated_question', 'is', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching annotations:', error);
      return res.status(500).json({
        error: 'Failed to fetch annotations',
        details: error.message
      });
    }

    return res.status(200).json({
      annotations: data || [],
      count: data ? data.length : 0
    });

  } catch (error) {
    console.error('Error in getAnnotationsForVerification:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

/**
 * Get list of annotation IDs already verified by this verifier in this subset
 */
async function getCompletedVerifications(req, res) {
  try {
    const { verifier_id, subset } = req.query;

    if (!verifier_id || !subset) {
      return res.status(400).json({
        error: 'Missing required parameters: verifier_id and subset'
      });
    }

    const subsetId = parseInt(subset);
    if (isNaN(subsetId) || subsetId < 1 || subsetId > 10) {
      return res.status(400).json({
        error: 'Invalid subset ID. Must be between 1 and 10'
      });
    }

    // Query verifications table to get annotation IDs already verified
    const { data, error } = await supabase
      .from('verifications')
      .select('annotation_id')
      .eq('verifier_user_id', verifier_id)
      .eq('subset_id', subsetId);

    if (error) {
      console.error('Error fetching completed verifications:', error);
      return res.status(500).json({
        error: 'Failed to fetch completed verifications',
        details: error.message
      });
    }

    const verifiedAnnotationIds = data ? data.map(v => v.annotation_id) : [];

    return res.status(200).json({
      verified_annotation_ids: verifiedAnnotationIds,
      count: verifiedAnnotationIds.length
    });

  } catch (error) {
    console.error('Error in getCompletedVerifications:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

/**
 * Save a verification result
 */
async function saveVerification(req, res) {
  try {
    const {
      annotation_id,
      template_id,
      verifier_user_id,
      selected_option,
      is_correct,
      original_correct_position,
      shuffled_correct_position,
      subset_id,
      language,
      country,
      time_spent_seconds
    } = req.body;

    // Validate required fields
    if (!annotation_id || !template_id || !verifier_user_id || !selected_option) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['annotation_id', 'template_id', 'verifier_user_id', 'selected_option']
      });
    }

    // Validate verifier_user_id
    const validPilotIds = ['742891', '586234', '193847', '415672', '829456', '651327', '129431', '548792'];
    if (!validPilotIds.includes(verifier_user_id)) {
      return res.status(403).json({
        error: 'Invalid verifier user ID'
      });
    }

    // Validate subset_id
    if (!subset_id || subset_id < 1 || subset_id > 10) {
      return res.status(400).json({
        error: 'Invalid subset ID. Must be between 1 and 10'
      });
    }

    // Validate selected_option format (should be A, B, C, or D)
    if (!['A', 'B', 'C', 'D'].includes(selected_option)) {
      return res.status(400).json({
        error: 'Invalid selected_option. Must be A, B, C, or D'
      });
    }

    // Check if this annotation has already been verified by this user
    const { data: existingVerification, error: checkError } = await supabase
      .from('verifications')
      .select('id')
      .eq('annotation_id', annotation_id)
      .eq('verifier_user_id', verifier_user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing verification:', checkError);
      return res.status(500).json({
        error: 'Failed to check existing verification',
        details: checkError.message
      });
    }

    if (existingVerification) {
      return res.status(409).json({
        error: 'This annotation has already been verified by this user'
      });
    }

    // Prepare verification data
    const verificationData = {
      annotation_id,
      template_id,
      verifier_user_id,
      selected_option,
      is_correct: is_correct === true,
      original_correct_position: original_correct_position || 'A',
      shuffled_correct_position: shuffled_correct_position || selected_option,
      subset_id,
      language: language || null,
      country: country || null,
      time_spent_seconds: time_spent_seconds || 0,
      created_at: new Date().toISOString()
    };

    // Insert verification into database
    const { data: insertedData, error: insertError } = await supabase
      .from('verifications')
      .insert([verificationData])
      .select();

    if (insertError) {
      console.error('Error inserting verification:', insertError);
      return res.status(500).json({
        error: 'Failed to save verification',
        details: insertError.message
      });
    }

    console.log('Verification saved successfully:', {
      id: insertedData[0].id,
      annotation_id,
      verifier_user_id,
      is_correct,
      subset_id
    });

    return res.status(201).json({
      success: true,
      message: 'Verification saved successfully',
      verification: insertedData[0]
    });

  } catch (error) {
    console.error('Error in saveVerification:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

/**
 * Get verification statistics (optional - for analytics)
 */
async function getVerificationStats(req, res) {
  try {
    const { verifier_id, subset } = req.query;

    let query = supabase.from('verifications').select('*');

    if (verifier_id) {
      query = query.eq('verifier_user_id', verifier_id);
    }

    if (subset) {
      const subsetId = parseInt(subset);
      if (!isNaN(subsetId)) {
        query = query.eq('subset_id', subsetId);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching verification stats:', error);
      return res.status(500).json({
        error: 'Failed to fetch verification statistics',
        details: error.message
      });
    }

    const stats = {
      total_verifications: data.length,
      correct_verifications: data.filter(v => v.is_correct).length,
      incorrect_verifications: data.filter(v => !v.is_correct).length,
      accuracy: data.length > 0 
        ? (data.filter(v => v.is_correct).length / data.length * 100).toFixed(2) + '%'
        : '0%',
      average_time_seconds: data.length > 0
        ? (data.reduce((sum, v) => sum + (v.time_spent_seconds || 0), 0) / data.length).toFixed(2)
        : '0'
    };

    return res.status(200).json({
      stats,
      verifications: data
    });

  } catch (error) {
    console.error('Error in getVerificationStats:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

module.exports = {
  getAnnotationsForVerification,
  getCompletedVerifications,
  saveVerification,
  getVerificationStats
};
