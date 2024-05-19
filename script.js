// Load environment variables from .env file
require('dotenv').config();

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.NEWSAPI_KEY);

// Fetch top headlines in the US
newsapi.v2.topHeadlines({
  country: 'ca',
  language: 'en',
  category: 'technology'
}).then(response => {
  console.log(response);
  /*
    {
      status: "ok",
      articles: [...]
    }
  */
  displayArticles(response.articles);
}).catch(error => {
  console.error("Error fetching news:", error);
});

function displayArticles(articles) {
  articles.forEach(article => {
    console.log(`Title: ${article.title}`);
    console.log(`Author: ${article.author || 'Unknown'}`);
    console.log(`Description: ${article.content}`);
    console.log(`URL: ${article.url}`);
    console.log('-----------------------------');
  });
}
