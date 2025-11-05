
// server/routes/api.js
const express = require('express');
const router = express.Router();
const annotationController = require('../controllers/annotations');
const templateController = require('../controllers/templates-supabase');
const verificationController = require('../controllers/verifications');

// Annotation routes
router.post('/annotations', annotationController.saveAnnotation);
router.post('/templates/skip', annotationController.logTemplateSkip);

// Only add the getAnnotations route if the function exists
if (typeof annotationController.getAnnotations === 'function') {
  router.get('/annotations', annotationController.getAnnotations);
}

// Template routes
router.get('/templates/random', templateController.getRandomTemplate);
router.get('/templates/subset', templateController.getTemplatesBySubset);

// Verification routes
router.get('/verifications/annotations', verificationController.getAnnotationsForVerification);
router.get('/verifications/completed', verificationController.getCompletedVerifications);
router.post('/verifications', verificationController.saveVerification);
router.get('/verifications/stats', verificationController.getVerificationStats);

module.exports = router;