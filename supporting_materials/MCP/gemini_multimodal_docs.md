USE OPENROUTER AND JAVASCRIPT ... 

here's the openrouter info. my key is VITE_OPENROUTER_API_KEY in .env


fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <OPENROUTER_API_KEY>",
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "model": "google/gemini-2.0-flash-001",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
            }
          }
        ]
      }
    ]
  })
});






--------------

Multimodal Live API

To try a tutorial that lets you use your voice and camera to talk to Gemini through the Multimodal Live API, see the Web Console Demo project.

The Multimodal Live API enables low-latency bidirectional voice and video interactions with Gemini. Using the Multimodal Live API, you can provide end users with the experience of natural, human-like voice conversations, and with the ability to interrupt the model's responses using voice commands. The model can process text, audio, and video input, and it can provide text and audio output.

Capabilities
Multimodal Live API includes the following key capabilities:

Multimodality: The model can see, hear, and speak.
Low-latency real-time interaction: Provides fast responses.
Session memory: The model retains memory of all interactions within a single session, recalling previously heard or seen information.
Support for function calling, code execution, and Search as a tool: Enables integration with external services and data sources.
Automated voice activity detection (VAD): The model can accurately recognize when the user begins and stops speaking. This allows for natural, conversational interactions and empowers users to interrupt the model at any time.
You can try the Multimodal Live API in Google AI Studio.

Get started
Multimodal Live API is a stateful API that uses WebSockets.

This section shows an example of how to use Multimodal Live API for text-to-text generation, using Python 3.9+.

Install the Gemini API library
To install the google-genai package, use the following pip command:


pip install google-genai
Import dependencies
To import dependencies:


from google import genai
Send and receive a text message

import asyncio
from google import genai

client = genai.Client(api_key="GEMINI_API_KEY", http_options={'api_version': 'v1alpha'})
model_id = "gemini-2.0-flash-exp"
config = {"response_modalities": ["TEXT"]}

async def main():
    async with client.aio.live.connect(model=model_id, config=config) as session:
        while True:
            message = input("User> ")
            if message.lower() == "exit":
                break
            await session.send(input=message, end_of_turn=True)

            async for response in session.receive():
                if response.text is None:
                    continue
                print(response.text, end="")

if __name__ == "__main__":
    asyncio.run(main())
Integration guide
This section describes how integration works with Multimodal Live API.

Sessions
A WebSocket connection establishes a session between the client and the Gemini server.

After a client initiates a new connection the session can exchange messages with the server to:

Send text, audio, or video to the Gemini server.
Receive audio, text, or function call requests from the Gemini server.
The session configuration is sent in the first message after connection. A session configuration includes the model, generation parameters, system instructions, and tools.

See the following example configuration. Note that the name casing in SDKs may vary. You can look up the Python SDK configuration options here.



{
  "model": string,
  "generationConfig": {
    "candidateCount": integer,
    "maxOutputTokens": integer,
    "temperature": number,
    "topP": number,
    "topK": integer,
    "presencePenalty": number,
    "frequencyPenalty": number,
    "responseModalities": [string],
    "speechConfig": object
  },
  "systemInstruction": string,
  "tools": [object]
}
For more information, see BidiGenerateContentSetup.

Send messages
Messages are JSON-formatted objects exchanged over the WebSocket connection.

To send a message the client must send a JSON object over an open WebSocket connection. The JSON object must have exactly one of the fields from the following object set:



{
  "setup": BidiGenerateContentSetup,
  "clientContent": BidiGenerateContentClientContent,
  "realtimeInput": BidiGenerateContentRealtimeInput,
  "toolResponse": BidiGenerateContentToolResponse
}
Supported client messages
See the supported client messages in the following table:

Message	Description
BidiGenerateContentSetup	Session configuration to be sent in the first message
BidiGenerateContentClientContent	Incremental content update of the current conversation delivered from the client
BidiGenerateContentRealtimeInput	Real time audio or video input
BidiGenerateContentToolResponse	Response to a ToolCallMessage received from the server
Receive messages
To receive messages from Gemini, listen for the WebSocket 'message' event, and then parse the result according to the definition of the supported server messages.

See the following:


ws.addEventListener("message", async (evt) => {
  if (evt.data instanceof Blob) {
    // Process the received data (audio, video, etc.)
  } else {
    // Process JSON response
  }
});
Server messages will have exactly one of the fields from the following object set:



{
  "setupComplete": BidiGenerateContentSetupComplete,
  "serverContent": BidiGenerateContentServerContent,
  "toolCall": BidiGenerateContentToolCall,
  "toolCallCancellation": BidiGenerateContentToolCallCancellation
}
Supported server messages
See the supported server messages in the following table:

Message	Description
BidiGenerateContentSetupComplete	A BidiGenerateContentSetup message from the client, sent when setup is complete
BidiGenerateContentServerContent	Content generated by the model in response to a client message
BidiGenerateContentToolCall	Request for the client to run the function calls and return the responses with the matching IDs
BidiGenerateContentToolCallCancellation	Sent when a function call is canceled due to the user interrupting model output
Incremental content updates
Use incremental updates to send text input, establish session context, or restore session context. For short contexts you can send turn-by-turn interactions to represent the exact sequence of events. For longer contexts it's recommended to provide a single message summary to free up the context window for the follow up interactions.

See the following example context message:


{
  "clientContent": {
    "turns": [
      {
          "parts":[
          {
            "text": ""
          }
        ],
        "role":"user"
      },
      {
          "parts":[
          {
            "text": ""
          }
        ],
        "role":"model"
      }
    ],
    "turnComplete": true
  }
}
Note that while content parts can be of a functionResponse type, BidiGenerateContentClientContent shouldn't be used to provide a response to the function calls issued by the model. BidiGenerateContentToolResponse should be used instead. BidiGenerateContentClientContent should only be used to establish previous context or provide text input to the conversation.

Streaming audio and video
To see an example of how to use the Multimodal Live API in a streaming audio and video format, run the "Multimodal Live API - Quickstart" notebook in one of the following environments:

Open in Colab | View on GitHub

Function calling
All functions must be declared at the start of the session by sending tool definitions as part of the BidiGenerateContentSetup message.

See the Function calling tutorial to learn more about function calling.

From a single prompt, the model can generate multiple function calls and the code necessary to chain their outputs. This code executes in a sandbox environment, generating subsequent BidiGenerateContentToolCall messages. The execution pauses until the results of each function call are available, which ensures sequential processing.

The client should respond with BidiGenerateContentToolResponse.

Audio inputs and audio outputs negatively impact the model's ability to use function calling.

Audio formats
Multimodal Live API supports the following audio formats:

Input audio format: Raw 16 bit PCM audio at 16kHz little-endian
Output audio format: Raw 16 bit PCM audio at 24kHz little-endian
System instructions
You can provide system instructions to better control the model's output and specify the tone and sentiment of audio responses.

System instructions are added to the prompt before the interaction begins and remain in effect for the entire session.

System instructions can only be set at the beginning of a session, immediately following the initial connection. To provide further input to the model during the session, use incremental content updates.

Interruptions
Users can interrupt the model's output at any time. When Voice activity detection (VAD) detects an interruption, the ongoing generation is canceled and discarded. Only the information already sent to the client is retained in the session history. The server then sends a BidiGenerateContentServerContent message to report the interruption.

In addition, the Gemini server discards any pending function calls and sends a BidiGenerateContentServerContent message with the IDs of the canceled calls.

Voices
Multimodal Live API supports the following voices: Aoede, Charon, Fenrir, Kore, and Puck.

To specify a voice, set the voiceName within the speechConfig object, as part of your session configuration.

See the following JSON representation of a speechConfig object:


{
  "voiceConfig": {
    "prebuiltVoiceConfig": {
      "voiceName": "VOICE_NAME"
    }
  }
}
Limitations
Consider the following limitations of Multimodal Live API and Gemini 2.0 when you plan your project.

Client authentication
Multimodal Live API only provides server to server authentication and isn't recommended for direct client use. Client input should be routed through an intermediate application server for secure authentication with the Multimodal Live API.

For web and mobile app deployments, you can explore options from:

Daily
Livekit
Conversation history
While the model keeps track of in-session interactions, conversation history isn't stored. When a session ends, the corresponding context is erased.

In order to restore a previous session or provide the model with historic context of user interactions, the application should maintain its own conversation log and use a BidiGenerateContentClientContent message to send this information at the start of a new session.

Maximum session duration
Session duration is limited to up to 15 minutes for audio or up to 2 minutes of audio and video. When the session duration exceeds the limit, the connection is terminated.

The model is also limited by the context size. Sending large chunks of content alongside the video and audio streams may result in earlier session termination.

Voice activity detection (VAD)
The model automatically performs voice activity detection (VAD) on a continuous audio input stream. VAD is always enabled, and its parameters aren't configurable.

Token count
Token count isn't supported.

Rate limits
The following rate limits apply:

3 concurrent sessions per API key
4M tokens per minute
Messages and events
BidiGenerateContentClientContent
Incremental update of the current conversation delivered from the client. All of the content here is unconditionally appended to the conversation history and used as part of the prompt to the model to generate content.

A message here will interrupt any current model generation.

Fields
turns[]	
Content

Optional. The content appended to the current conversation with the model.

For single-turn queries, this is a single instance. For multi-turn queries, this is a repeated field that contains conversation history and the latest request.

turn_complete	
bool

Optional. If true, indicates that the server content generation should start with the currently accumulated prompt. Otherwise, the server awaits additional messages before starting generation.

BidiGenerateContentRealtimeInput
User input that is sent in real time.

This is different from BidiGenerateContentClientContent in a few ways:

Can be sent continuously without interruption to model generation.
If there is a need to mix data interleaved across the BidiGenerateContentClientContent and the BidiGenerateContentRealtimeInput, the server attempts to optimize for best response, but there are no guarantees.
End of turn is not explicitly specified, but is rather derived from user activity (for example, end of speech).
Even before the end of turn, the data is processed incrementally to optimize for a fast start of the response from the model.
Is always direct user input that is sent in real time. Can be sent continuously without interruptions. The model automatically detects the beginning and the end of user speech and starts or terminates streaming the response accordingly. Data is processed incrementally as it arrives, minimizing latency.
Fields
media_chunks[]	
Blob

Optional. Inlined bytes data for media input.

BidiGenerateContentServerContent
Incremental server update generated by the model in response to client messages.

Content is generated as quickly as possible, and not in real time. Clients may choose to buffer and play it out in real time.

Fields
turn_complete	
bool

Output only. If true, indicates that the model is done generating. Generation will only start in response to additional client messages. Can be set alongside content, indicating that the content is the last in the turn.

interrupted	
bool

Output only. If true, indicates that a client message has interrupted current model generation. If the client is playing out the content in real time, this is a good signal to stop and empty the current playback queue.

grounding_metadata	
GroundingMetadata

Output only. Grounding metadata for the generated content.

model_turn	
Content

Output only. The content that the model has generated as part of the current conversation with the user.

BidiGenerateContentSetup
Message to be sent in the first and only first client message. Contains configuration that will apply for the duration of the streaming session.

Clients should wait for a BidiGenerateContentSetupComplete message before sending any additional messages.

Fields
model	
string

Required. The model's resource name. This serves as an ID for the Model to use.

Format: models/{model}

generation_config	
GenerationConfig

Optional. Generation config.

The following fields are not supported:

responseLogprobs
responseMimeType
logprobs
responseSchema
stopSequence
routingConfig
audioTimestamp
system_instruction	
Content

Optional. The user provided system instructions for the model.

Note: Only text should be used in parts. Content in each part will be in a separate paragraph.

tools[]	
Tool

Optional. A list of Tools the model may use to generate the next response.

A Tool is a piece of code that enables the system to interact with external systems to perform an action, or set of actions, outside of knowledge and scope of the model.

BidiGenerateContentSetupComplete
This type has no fields.

Sent in response to a BidiGenerateContentSetup message from the client.

BidiGenerateContentToolCall
Request for the client to execute the functionCalls and return the responses with the matching ids.

Fields
function_calls[]	
FunctionCall

Output only. The function call to be executed.

BidiGenerateContentToolCallCancellation
Notification for the client that a previously issued ToolCallMessage with the specified ids should have been not executed and should be cancelled. If there were side-effects to those tool calls, clients may attempt to undo the tool calls. This message occurs only in cases where the clients interrupt server turns.

Fields
ids[]	
string

Output only. The ids of the tool calls to be cancelled.

BidiGenerateContentToolResponse
Client generated response to a ToolCall received from the server. Individual FunctionResponse objects are matched to the respective FunctionCall objects by the id field.

Note that in the unary and server-streaming GenerateContent APIs function calling happens by exchanging the Content parts, while in the bidi GenerateContent APIs function calling happens over these dedicated set of messages.

Fields
function_responses[]	
FunctionResponse

Optional. The response to the function calls.


More information on common types
For more information on the commonly-used API resource types Blob, Content, FunctionCall, FunctionResponse, GenerationConfig, GroundingMetadata, and Tool
