const textInput = document.getElementById('textInput');
const accentWordsList = document.getElementById('accentWordsList');
const noWordsMessage = document.getElementById('noWordsMessage');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const statusMessage = document.getElementById('statusMessage');

function updateAccentWords() {
    const text = textInput.value.trim();
    const words = text.match(/\b\w+\b/g) || [];
    const uniqueWords = [...new Set(words)];

    accentWordsList.innerHTML = '';

    if (uniqueWords.length === 0) {
        noWordsMessage.style.display = 'block';
    } else {
        noWordsMessage.style.display = 'none';
        uniqueWords.forEach(word => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = word;
            checkbox.className = 'accent-checkbox';
            const span = document.createElement('span');
            span.textContent = word;
            label.appendChild(checkbox);
            label.appendChild(span);
            accentWordsList.appendChild(label);
        });
    }
}

function sendText() {
    const text = textInput.value.trim();
    if (!text) {
        showStatus('Bitte geben Sie einen Text ein.', 'error');
        return;
    }

    const checkboxes = document.querySelectorAll('.accent-checkbox:checked');
    const accentedWords = Array.from(checkboxes).map(cb => cb.value);

    const data = {
        text: text,
        accentedWords: accentedWords
    };

    socket.emit('set-text', data);
    showStatus('Text wurde erfolgreich übertragen!', 'success');
    
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 3000);
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
}

textInput.addEventListener('input', updateAccentWords);
sendBtn.addEventListener('click', sendText);
clearBtn.addEventListener('click', () => {
    textInput.value = '';
    accentWordsList.innerHTML = '';
    noWordsMessage.style.display = 'block';
    statusMessage.style.display = 'none';
});

textInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        sendText();
    }
});