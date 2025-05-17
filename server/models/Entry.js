const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },
  partOfSpeech: {
    type: String,
    required: true,
    enum: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'other']
  },
  definitions: [{
    meaning: {
      type: String,
      required: true
    },
    examples: [String],
    context: String,
    dialectOrRegion: String,
    contributors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    votes: {
      upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }
  }],
  translations: [{
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Language'
    },
    words: [{
      word: String,
      context: String,
      contributors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }]
  }],
  pronunciation: {
    ipa: String,
    audio: String,
    notes: String
  },
  etymology: {
    origin: String,
    history: String,
    contributors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  tags: [String],
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated timestamp before saving
entrySchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Index for better search performance
entrySchema.index({ word: 'text' });

module.exports = mongoose.model('Entry', entrySchema); 