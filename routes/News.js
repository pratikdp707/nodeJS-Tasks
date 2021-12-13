const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('6e4cd31a26d94e1c8e9081554489d401');
// /const newsapi = new NewsAPI('6e4cd31a26d94e1c8e9081554489d401', { corsProxyUrl: 'https://cors-anywhere.herokuapp.com/' });
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