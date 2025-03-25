export async function getPollySpeechUrl(
  text: string,
  voiceId: string = "Matthew",
  engine: string = "neural"
): Promise<string> {
  try {
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceId, engine }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.audioUrl as string;
  } catch (error) {
    console.error("Error getting Polly speech URL:", error);
    return '';
  }
}
