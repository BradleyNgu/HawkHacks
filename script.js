// Load environment variables from .env file
require('dotenv').config();

(async () => {
  const fetch = (await import('node-fetch')).default;

  const NewsAPI = require('newsapi');
  const newsapi = new NewsAPI(process.env.NEWSAPI_KEY);
  const openaiApiKey = process.env.OPENAI_KEY;

  async function getOpenAISummary(content) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-1106',
        prompt: `Summarize the following news article and identify the city where the article takes place:\n\n${content}\n\nSummary:`,
        max_tokens: 150,
        temperature: 0.7,
      })
    });

    const data = await response.json();

    console.log("OpenAI API Response:", JSON.stringify(data, null, 2)); // Log the entire response

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].text.trim();
    } else {
      throw new Error("Invalid response from OpenAI API");
    }
  }

  // Fetch top headlines in the US
  newsapi.v2.topHeadlines({
    country: 'us'
  }).then(async response => {
    if (response.status === "ok") {
      await processArticles(response.articles);
    } else {
      console.error("Error fetching news:", response);
    }
  }).catch(error => {
    console.error("Error fetching news:", error);
  });

  async function processArticles(articles) {
    for (const article of articles) {
      try {
        console.log(`Title: ${article.title}`);
        console.log(`Author: ${article.author || 'Unknown'}`);
        console.log(`URL: ${article.url}`);
        console.log('-----------------------------');

        const summary = await getOpenAISummary(article.content || article.description);
        console.log(`Summary: ${summary}`);

        const location = extractLocationFromSummary(summary);
        console.log(`Location: ${location}`);
      } catch (error) {
        console.error("Error processing article:", error);
      }
    }
  }

  function extractLocationFromSummary(summary) {
    const cityPattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/;
    const match = summary.match(cityPattern);
    return match ? match[0] : 'Unknown';
  }
})();
