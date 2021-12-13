const NewsAPI = require('newsapi');
//const newsapi = new NewsAPI(process.env.NEWS_API);
const newsapi = new NewsAPI(process.env.NEWS_API, { corsProxyUrl: 'https://cors-anywhere.herokuapp.com/' });
const express = require('express');
const router = express.Router();
const axios = require('axios');


router.get("/getNews/:category/", async(req, res) => {
    category = req.params.category;
    newsapi.v2.topHeadlines({
        category: category,
        language: "en",
        country: 'in'
      }).then(response => {
        res.json(response);
      });
});

module.exports = router;