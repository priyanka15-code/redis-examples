/* const express = require('express');
const Translation = require('../Models/translation.model');
const { Translate } = require('@google-cloud/translate').v2;
require('dotenv').config();

const router = express.Router();
const translate = new Translate({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_KEYFILE,
});

console.log('Google Project ID:', process.env.GOOGLE_PROJECT_ID);
console.log('Google Key File Path:', process.env.GOOGLE_KEYFILE);

router.post('/', async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) {
    return res.status(400).json({ message: 'Keyword is required' });
  }

  try {
    console.log('Translating:', keyword);

    // Define target languages
    const targetLanguages = ['en', 'fr', 'nl'];
    console.log('Target Languages:', targetLanguages);

    // Translate the keyword for each language separately
    const translationsPromises = targetLanguages.map(async (lang) => {
      const [translation] = await translate.translate(keyword, lang);
      return { lang, translation };
    });

    const translationsResults = await Promise.all(translationsPromises);

    // Convert the results into a format suitable for saving
    const translations = translationsResults.reduce((acc, { lang, translation }) => {
      if (lang === 'en') acc.english = translation;
      if (lang === 'fr') acc.french = translation;
      if (lang === 'nl') acc.dutch = translation;
      return acc;
    }, {});

    console.log('Translations:', translations); // Log the translations result

    // Create a new Translation document
    const newTranslation = new Translation({
      keyword,
      translations
    });
    
    // Save to the database
    await newTranslation.save();
    
    // Send response
    res.status(200).json(newTranslation);
  } catch (error) {
    console.error('Error details:', error); // Log detailed error information
    res.status(500).json({ message: 'Translation failed', error: error.message });
  }
});

module.exports = router;
 */