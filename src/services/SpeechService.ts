
// Fix the String vs string type issue
const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    input: {
      text: text
    },
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Neural2-F', // Female voice
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3'
    }
  }),
});
