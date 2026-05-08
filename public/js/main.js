socket.emit('test_msg', {test:"Socket io up and running"})

socket.on('text-update', (data) => {
    const textDisplay = document.getElementById('text-display');
    const text = data.text;
    const accentedWords = data.accentedWords || [];

    // Teile den Text in Wörter auf und ersetze sie mit Spans
    const words = text.split(/(\s+)/);
    const htmlContent = words.map(word => {
        if (/\s/.test(word)) {
            // Whitespace-Zeichen bewahren
            return word;
        }
        // Extrahiere das Wort ohne Sonderzeichen für den Vergleich
        const cleanWord = word.replace(/[^\w]/g, '');
        if (accentedWords.includes(cleanWord)) {
            return `<span class="accent">${word}</span>`;
        }
        return word;
    }).join('');

    textDisplay.innerHTML = htmlContent;
    console.log('[MAIN.JS] Text aktualisiert:', data);
});
