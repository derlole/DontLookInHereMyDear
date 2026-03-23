
module.exports = (io) => {
    const express = require('express');
    const router = express.Router();

    router.get('/', (req, res) => {
        res.render('index')
    })
    router.get("/weather", async (req, res) => {
        try {
            const lat = 50.04;
            const lon = 8.24;

            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
            );
            
            const data = await response.json();
            res.json(data);
            console.log(data)
        } catch (err) {
            res.status(500).json({ error: "failed" });
        }
    });

    return router
}