const fetch = require('node-fetch');
const User = require("../models/User");

module.exports = {
    getSearch: (req, res) => {
        res.render("search.ejs", {gameInfo: []});
      },

    postResults: async (req, res) => {
        try {
        let url = `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${req.body.query}&search_precise=true&platforms=${req.user.platform}`
        const games = await fetch(url)
        const json = await games.json()
        const gameInfo = json['results'].map(x=>[x.id,x.name,x.background_image])
        res.render("search.ejs", {gameInfo: gameInfo});
        } catch (err) {
        console.log(err);
        }
    },

    getGame: async (req, res) => {
        try {
        let url = `https://api.rawg.io/api/games/${req.params.id}?key=${process.env.RAWG_API_KEY}`
        const games = await fetch(url)
        const json = await games.json()
        res.render("game.ejs", {gameInfo: json});
        } catch (err) {
        console.log(err);
        }
    },
    
    addGame: async (req, res) => {
        try {
          await User.findOneAndUpdate(
            { _id: req.user.id },
            { "$push": { games: req.params.id }}
          );
          res.redirect(`/profile`);
        } catch (err) {
          console.log(err);
        }
      }
}