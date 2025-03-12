My app is at /Users/philip.galebach/coding-projects/alexandria/readiverse-haven/

Below is a detailed plan that an engineer can use to implement the AI Survey Assistant as outlined in the Product Requirements Document (PRD) for your existing survey app located at `/Users/philip.galebach/coding-projects/alexandria/readiverse-haven/`. The plan ensures that the existing survey remains unchanged while adding a "Talk to AI" button to enhance the user experience with optional, non-obtrusive assistance.

---

# Detailed Implementation Plan for AI Survey Assistant

## 1. Objective
The goal is to integrate an AI-powered assistant into your existing survey app without modifying the survey's structure or flow. The assistant will:
- Be accessible via a "Talk to AI" pop-up button. (DONE)
- Support both text and voice interactions. (DONE)
- Provide contextual help to users while preserving their autonomy in answering survey questions.

## 2. Assumptions
- The survey app has a frontend for rendering questions and collecting user inputs, and a backend for storing responses and managing survey logic.
- The existing survey should not be altered in terms of question sequence, content, or progression.
- The codebase is located at `/Users/philip.galebach/coding-projects/alexandria/readiverse-haven/`.

## 3. Implementation Steps

### Step 1: Update the Survey Introduction
- **Objective**: Inform users about the AI assistant and allow them to opt-in.
- **Tasks**:
  - Locate the existing survey introduction screen in the frontend codebase (e.g., a welcome page or initial component).
  - If no introduction exists, create a new screen that appears before the survey begins.
  - Add text explaining the AI assistant’s role: *"This survey offers an optional AI assistant to help you understand questions. It won’t answer for you but can clarify or provide examples."*
  - Include a toggle or button (e.g., "Enable AI Assistant") for users to opt-in. Store this preference in the frontend state (e.g., a boolean variable like `isAIEnabled`).
- **Outcome**: Users are primed for the AI assistant and can choose to enable it.

### Step 2: Add the "Talk to AI" Button
- **Objective**: Provide a non-obtrusive entry point to the AI assistant.
- **Tasks**:
  - In the survey’s main frontend view, add a floating action button (FAB) or icon labeled "Talk to AI" (e.g., using CSS positioning like `position: fixed`).
  - Make the button visible only if the user enabled the AI assistant in Step 1.
  - When clicked, open a chat-like interface (e.g., a modal or sidebar) that can be minimized or closed without obstructing the survey.
- **UI Considerations**:
  - Position the button in a corner (e.g., bottom-right) to avoid overlapping survey content.
  - Use a subtle design (e.g., a small circular icon) to ensure it’s non-intrusive.
- **Outcome**: Users can easily access the AI assistant when needed.

### Step 3: Build the Chat Interface
- **Objective**: Create an interface for users to interact with the AI via text or voice.
- **Tasks**:
  - **Text Input**: Add a text input field in the chat interface where users can type queries (e.g., "What does this mean?").
  - **Voice Input**:
    - Add a microphone button to start audio recording.
    - Use the Web Audio API (or equivalent in your framework) to capture user speech.
    - Send the audio to Gemini’s speech-to-text API for transcription (see Step 5).
  - Include a toggle for users to select response mode: text-only or voice (default to text).
  - Display the AI’s responses in the chat window.
- **Outcome**: Users can ask questions using their preferred input method, and responses are presented clearly.

### Step 4: Integrate the Conversational AI
- **Objective**: Enable the AI to provide contextual, helpful responses.
- **Tasks**:
  - **Select a Language Model**: Use a model like OpenAI’s GPT-3 (or a similar service) for generating responses. Set up an API key and client in your codebase.
  - **Context Management**:
    - In the frontend, track the user’s current question and previous answers (e.g., in a JavaScript object or React state).
    - Example structure:
      ```javascript
      const surveyContext = {
        currentQuestion: "How do you feel about X?",
        previousAnswers: [
          { question: "Do you like Y?", answer: "Yes" },
          // ...
        ],
      };
      ```
  - **Prompt Construction**: When the user submits a query:
    - Build a prompt for the language model, e.g.:
      ```
      The user is taking a survey. The current question is: "[currentQuestion]". 
      Their previous answers are: [previousAnswers]. 
      They asked: "[userQuery]". 
      Provide a helpful response that clarifies or offers examples without choosing an answer for them.
      ```
    - Send the prompt to the language model API and retrieve the response.
  - **Response Handling**: Display the AI’s text response in the chat interface.
- **Guardrails**:
  - Ensure the AI avoids making decisions (e.g., "You might consider how X relates to your earlier answer about Y" instead of "Choose A").
  - If the user asks out-of-scope questions, respond with: *"I’m here to help with the survey questions. How can I assist with this one?"*
- **Outcome**: The AI provides relevant, context-aware help without overstepping.

### Step 5: Add Voice Capabilities
- **Objective**: Enable voice input and output using specified services.
- **Tasks**:
  - **Speech-to-Text (Gemini)**:
    - Integrate Gemini’s API for transcription (check documentation for endpoint and authentication).
    - Example workflow:
      1. User clicks the microphone and speaks.
      2. Record audio and send it to Gemini.
      3. Receive transcribed text (e.g., "Rephrase this question") and use it as the query for Step 4.
    - Aim for ~1-second processing time; test latency and optimize as needed.
  - **Text-to-Speech (11 Labs)**:
    - Set up the 11 Labs API with a posh British accent voice (select from available options).
    - After receiving the AI’s text response, send it to 11 Labs to generate an audio file.
    - Play the audio in the chat interface if the user selected voice mode (e.g., using an `<audio>` element or audio library).
- **Outcome**: Users can speak to the AI and hear responses in a British accent, enhancing engagement.

### Step 6: Preserve Survey Integrity
- **Objective**: Ensure the AI does not disrupt the survey’s structure or flow.
- **Tasks**:
  - Restrict the AI to discussing only the current question and prior answers for context.
  - Avoid exposing future questions or altering the survey progression (e.g., no skipping or backtracking via the AI).
  - Verify that the existing survey logic (in frontend and backend) remains untouched by inspecting the codebase at `/Users/philip.galebach/coding-projects/alexandria/readiverse-haven/`.
- **Outcome**: The survey’s foundational-to-deeper progression is maintained.

### Step 7: Testing and Refinement
- **Objective**: Validate the AI assistant’s functionality and user experience.
- **Tasks**:
  - **Functional Testing**:
    - Test text and voice interactions with sample queries (e.g., "Explain this question," "Give me an example").
    - Verify that Gemini transcription and 11 Labs TTS work smoothly with minimal latency.
  - **User Experience Testing**:
    - Ensure the "Talk to AI" button and chat interface don’t obscure survey content.
    - Confirm the AI’s responses are helpful, professional, and aligned with the "Virgil doc" tone (assumed to be friendly and approachable).
  - **Edge Cases**:
    - Handle poor audio quality or transcription errors gracefully (e.g., "Sorry, I didn’t catch that. Could you try again?").
    - Test with users opting out of AI assistance to ensure no interference.
  - **Optimization**: Adjust API calls or caching if latency exceeds acceptable limits (e.g., >1-2 seconds for voice).
- **Outcome**: A polished, reliable AI assistant that enhances the survey without drawbacks.

## 4. Technical Requirements
- **Frontend**:
  - Modify existing views to add the introduction toggle, "Talk to AI" button, and chat interface.
  - Use a framework-compatible approach (e.g., React, Vue) based on your app’s stack.
- **APIs**:
  - **Gemini**: Speech-to-text API for transcription.
  - **11 Labs**: Text-to-speech API with a British accent voice.
  - **Language Model**: GPT-3 or similar for conversational responses.
- **Dependencies**:
  - Add API clients (e.g., `axios` or `fetch`) and audio handling libraries if not already present.
- **No Backend Changes**: Manage context in the frontend to avoid altering the existing survey backend.

## 5. Deliverables
- A "Talk to AI" button visible during the survey (if enabled).
- A chat interface supporting text and voice input/output.
- An AI assistant that:
  - Uses Gemini for speech-to-text and 11 Labs for text-to-speech.
  - Provides contextual help based on the current question and prior answers.
  - Maintains a professional, approachable tone with a British accent.
- An unchanged survey structure, ensuring the original flow at `/Users/philip.galebach/coding-projects/alexandria/readiverse-haven/` is preserved.
