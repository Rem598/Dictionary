// Function to search for the word
function searchWord() {
    const word = document.getElementById('wordInput').value;

    if (!word) {
        alert('Please enter a word');
        return;
    }

    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayResults(data))
        .catch(error => {
            document.getElementById('result').innerHTML = `<p>Error fetching data. Try again.</p>`;
            console.error('Error:', error);
        });
}

// Function to display results for all possible meanings
function displayResults(data) {
    if (data.title === "No Definitions Found") {
        document.getElementById('result').innerHTML = `<p>No definition found for the word.</p>`;
        return;
    }

    const word = data[0].word;
    const phonetics = data[0].phonetics;
    const meanings = data[0].meanings;

    const britishAudio = phonetics.find(p => p.text.includes('ˈ') && p.audio) || {};
    const americanAudio = phonetics.find(p => p.text.includes('ər') && p.audio) || {};

    let meaningsHtml = '';
    meanings.forEach(meaning => {
        const partOfSpeech = meaning.partOfSpeech;

        meaning.definitions.forEach(definition => {
            const def = definition.definition;
            const synonyms = definition.synonyms || [];
            const synonymsList = synonyms.length > 0 ? `<p class="synonyms"><strong>Synonyms:</strong> ${synonyms.join(', ')}</p>` : '';

            meaningsHtml += `
                <p><strong>Part of Speech:</strong> ${partOfSpeech}</p>
                <p><strong>Definition:</strong> ${def}</p>
                ${synonymsList}
                <hr>
            `;
        });
    });

    const pronunciations = `
        ${britishAudio.audio ? `<p><strong>British Pronunciation:</strong> <a href="${britishAudio.audio}" target="_blank">Listen</a></p>` : ''}
        ${americanAudio.audio ? `<p><strong>American Pronunciation:</strong> <a href="${americanAudio.audio}" target="_blank">Listen</a></p>` : ''}
    `;

    const resultHtml = `
        <h3>Word: ${word}</h3>
        ${meaningsHtml}
        ${pronunciations}
    `;

    document.getElementById('result').innerHTML = resultHtml;
}

// Function to show word suggestions as the user types
function showSuggestions(query) {
    if (!query) {
        document.getElementById('suggestions').innerHTML = '';
        return;
    }

    const apiUrl = `https://api.datamuse.com/sug?s=${query}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                document.getElementById('suggestions').innerHTML = '<p>No suggestions available.</p>';
                return;
            }

            // Create a list of clickable suggestions
            const suggestionList = data.slice(0, 5).map(item => 
                `<li onclick="selectSuggestion('${item.word}')">${item.word}</li>`
            ).join('');
            document.getElementById('suggestions').innerHTML = `<ul>${suggestionList}</ul>`;
        })
        .catch(error => console.error('Error fetching suggestions:', error));
}

// Function to populate the input field with a selected suggestion
function selectSuggestion(word) {
    document.getElementById('wordInput').value = word;
    document.getElementById('suggestions').innerHTML = ''; // Clear suggestions after selection
    searchWord(); // Automatically search after selecting the suggestion
}

// Function to start voice recognition
function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Sorry, your browser does not support speech recognition.");
        return;
    }

    const recognition = new SpeechRecognition();
    
    recognition.onstart = function() {
        console.log('Voice recognition activated. Try speaking into the microphone.');
    };

    recognition.onresult = function(event) {
        const spokenWord = event.results[0][0].transcript;
        document.getElementById('wordInput').value = spokenWord;
        searchWord(); // Automatically search the word after recognition
    };

    recognition.onerror = function(event) {
        console.error('Error occurred in recognition: ' + event.error);
    };

    recognition.start();
}
