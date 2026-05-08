
const fs = require('fs');
const path = require('path');

module.exports = (io) => {
    const express = require('express');
    const router = express.Router();

    const getDailyImage = () => {
        try {
            const imageDir = path.join(__dirname, '..', '..', 'public', 'img', 'lolms');
            const files = fs.readdirSync(imageDir);
            const images = files.filter(file => /\.(png|jpe?g|gif|webp)$/i.test(file));

            if (!images.length) {
                return '/img/harfenolm.png';
            }

            const today = new Date();
            const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
            const index = seed % images.length;
            return `/img/lolms/${images[index]}`;
        } catch (error) {
            console.error('[ROUTE] Fehler beim Laden des täglichen Bildes:', error);
            return '/img/harfenolm.png';
        }
    };

    router.get('/', (req, res) => {
        res.render('index', { dailyImage: getDailyImage() });
    })
    
    router.get('/set-text', (req, res) => {
        res.render('set-text')
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