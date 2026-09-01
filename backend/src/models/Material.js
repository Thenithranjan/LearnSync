const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module ID is required']
    },
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    type: {
      type: String,
      enum: {
        values: ['PDF', 'VIDEO', 'LINK', 'DOCUMENT'],
        message: 'Material type must be PDF, VIDEO, LINK, or DOCUMENT'
      },
      required: [true, 'Material type is required']
    },
    url: {
      type: String,
      required: [true, 'Material URL is required'],
      trim: true
    },
    duration: {
      type: Number,
      default: 0
    },
    order: {
      type: Number,
      default: 1
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    topic: {
      type: String,
      trim: true,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
materialSchema.index({ moduleId: 1, order: 1 });

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;
