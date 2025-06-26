import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const deepseekResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.DEEPSEEK_API_URL;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:
{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show" | "open-website",
  "userInput": "<cleaned input>",
  "response": "<short voice response>",
  "url": "<relevant website URL if applicable, else null>"
}

Add this new type:
- "open-website": when user says "open Amazon", "open LinkedIn", "go to Flipkart", etc.
- In such cases, include the direct URL in the "url" key. For example:
    - "open LinkedIn" → "https://www.linkedin.com"
    - "go to GitHub" → "https://github.com"
    - "open my portfolio" → if you can infer from name or site.

Examples:
User: "open amazon" → type: "open-website", url: "https://www.amazon.in", response: "Opening Amazon India."


Instructions:
- "type": determine the intent of the user.
- "userinput": original sentence the user spoke.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question. aur agar koi aisa question puchta hai jiska answer tume pata hai usko bhi general ki category me rakho bas short answer dena
- "google-search": if user wants to search something on Google .
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to open a calculator .
- "instagram-open": if user wants to open instagram .
- "facebook-open": if user wants to open facebook.
- "weather-show": if user wants to know weather
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.

Important:
- Use ${userName} agar koi puche tume kisne banaya 
- Only respond with the JSON object, nothing else.

now your userInput- ${command}
`;

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const payload = {
      model: "deepseek-ai/DeepSeek-V3-0324",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      stream: false,
      temperature: 0.7,
      max_tokens: 800,
    };

    const result = await axios.post(apiUrl, payload, { headers });
    const reply = result.data.choices[0].message.content;
    return reply;
  } catch (error) {
    console.error("DeepSeek Error:", error.message);
    return JSON.stringify({
      type: "general",
      userInput: command,
      response: "Sorry, something went wrong.",
    });
  }
};

export default deepseekResponse;
