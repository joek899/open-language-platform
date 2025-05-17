const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const Language = require('../models/Language');
const auth = require('../middleware/auth');

// Search dictionary entries
router.get('/search', async (req, res) => {
  try {
    const { q, language, limit = 10, page = 1 } = req.query;
    const query = {};

    if (q) {
      query.$text = { $search: q };
    }

    if (language) {
      const languageDoc = await Language.findOne({ code: language });
      if (languageDoc) {
        query.language = languageDoc._id;
      }
    }

    const entries = await Entry.find(query)
      .populate('language', 'name code')
      .populate('createdBy', 'username')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ score: { $meta: 'textScore' } });

    const total = await Entry.countDocuments(query);

    res.json({
      entries,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching entries', error: error.message });
  }
});

// Get entry by ID
router.get('/:id', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id)
      .populate('language', 'name code nativeName')
      .populate('createdBy', 'username')
      .populate('definitions.contributors', 'username')
      .populate('translations.language', 'name code');

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entry', error: error.message });
  }
});

// Create new entry
router.post('/', auth, async (req, res) => {
  try {
    const {
      word,
      language: languageCode,
      partOfSpeech,
      definitions,
      pronunciation,
      etymology
    } = req.body;

    const language = await Language.findOne({ code: languageCode });
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }

    const entry = new Entry({
      word,
      language: language._id,
      partOfSpeech,
      definitions: definitions.map(def => ({
        ...def,
        contributors: [req.user._id]
      })),
      pronunciation,
      etymology: etymology ? { ...etymology, contributors: [req.user._id] } : undefined,
      createdBy: req.user._id
    });

    await entry.save();

    // Add entry to language
    language.entries.push(entry._id);
    await language.save();

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error creating entry', error: error.message });
  }
});

// Add translation to entry
router.post('/:id/translations', auth, async (req, res) => {
  try {
    const { languageCode, translations } = req.body;

    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const targetLanguage = await Language.findOne({ code: languageCode });
    if (!targetLanguage) {
      return res.status(404).json({ message: 'Target language not found' });
    }

    const translationObj = {
      language: targetLanguage._id,
      words: translations.map(t => ({
        ...t,
        contributors: [req.user._id]
      }))
    };

    const existingTranslationIndex = entry.translations.findIndex(
      t => t.language.toString() === targetLanguage._id.toString()
    );

    if (existingTranslationIndex >= 0) {
      entry.translations[existingTranslationIndex].words.push(...translationObj.words);
    } else {
      entry.translations.push(translationObj);
    }

    await entry.save();
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error adding translation', error: error.message });
  }
});

// Vote on a definition
router.post('/:id/definitions/:defId/vote', auth, async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const entry = await Entry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const definition = entry.definitions.id(req.params.defId);
    if (!definition) {
      return res.status(404).json({ message: 'Definition not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = definition.votes.upvotes.includes(userId);
    const hasDownvoted = definition.votes.downvotes.includes(userId);

    if (vote === 'up') {
      if (hasUpvoted) {
        definition.votes.upvotes.pull(userId);
      } else {
        definition.votes.upvotes.push(userId);
        if (hasDownvoted) {
          definition.votes.downvotes.pull(userId);
        }
      }
    } else if (vote === 'down') {
      if (hasDownvoted) {
        definition.votes.downvotes.pull(userId);
      } else {
        definition.votes.downvotes.push(userId);
        if (hasUpvoted) {
          definition.votes.upvotes.pull(userId);
        }
      }
    }

    await entry.save();
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error voting on definition', error: error.message });
  }
});

module.exports = router; 