'use strict';

const mongoose = require('mongoose');

const RETRY_DELAY_MS = 3000;
const MAX_RETRIES = 10;

async function connectMongo(retries = MAX_RETRIES) {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ MongoDB connected');
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`⏳ MongoDB attempt ${attempt}/${retries} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}

module.exports = { connectMongo };
