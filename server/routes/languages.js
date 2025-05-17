const express = require('express');
const router = express.Router();
const Language = require('../models/Language');
const auth = require('../middleware/auth');

// Get all languages
router.get('/', async (req, res) => {
  try {
    const languages = await Language.find()
      .select('name code nativeName status')
      .sort('name');
    res.json(languages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching languages', error: error.message });
  }
});

// Get language by code
router.get('/:code', async (req, res) => {
  try {
    const language = await Language.findOne({ code: req.params.code })
      .populate('contributors', 'username')
      .populate('entries');
    
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    res.json(language);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching language', error: error.message });
  }
});

// Create new language (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      name,
      code,
      nativeName,
      description,
      writingSystem,
      metadata
    } = req.body;

    const language = new Language({
      name,
      code,
      nativeName,
      description,
      writingSystem,
      metadata,
      contributors: [req.user._id]
    });

    await language.save();
    res.status(201).json(language);
  } catch (error) {
    res.status(500).json({ message: 'Error creating language', error: error.message });
  }
});

// Update language (admin and moderators)
router.put('/:code', auth, async (req, res) => {
  try {
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const language = await Language.findOne({ code: req.params.code });
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'contributors') {
        language[key] = updates[key];
      }
    });

    await language.save();
    res.json(language);
  } catch (error) {
    res.status(500).json({ message: 'Error updating language', error: error.message });
  }
});

// Add contributor to language
router.post('/:code/contributors', auth, async (req, res) => {
  try {
    const language = await Language.findOne({ code: req.params.code });
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }

    if (!language.contributors.includes(req.user._id)) {
      language.contributors.push(req.user._id);
      await language.save();
    }

    res.json({ message: 'Added as contributor successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding contributor', error: error.message });
  }
});

module.exports = router; 