import uploadOnCloudinary from "../config/cloudinary.js";
import deepseekResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment";

// Get current logged-in user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get Current User Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update assistant (name or image)
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      try {
        assistantImage = await uploadOnCloudinary(req.file.path);
      } catch (uploadError) {
        return res.status(500).json({ message: "Cloudinary upload failed" });
      }
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    console.error("Update Assistant Error:", error);
    return res.status(500).json({ message: "Failed to update assistant" });
  }
};

// AI assistant logic
export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save command to history
    user.history.push(command);
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName;

    // Get LLM response
    const result = await deepseekResponse(command, assistantName, userName);

    // Handle markdown or plain response
    const cleanedResult = result.replace(/```json|```/g, "").trim();
    const jsonMatch = cleanedResult.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      return res.status(400).json({ response: "Sorry, I can't understand." });
    }

    const gemResult = JSON.parse(jsonMatch[0]);
    console.log(gemResult)
    const type = gemResult.type;

    // Handle specific date/time responses using moment
    const momentResponses = {
      "get-date": moment().format("YYYY-MM-DD"),
      "get-time": moment().format("hh:mm A"),
      "get-day": moment().format("dddd"),
      "get-month": moment().format("MMMM"),
    };

    if (momentResponses[type]) {
      return res.json({
        type,
        userInput: gemResult.userInput,
        response: `Today is ${momentResponses[type]}`,
        url: gemResult.url || null,
      });
    }

    // Handle other supported types
    const supportedTypes = [
      "general",
      "google-search",
      "youtube-search",
      "youtube-play",
      "calculator-open",
      "instagram-open",
      "facebook-open",
      "weather-show",
      "open-website",
    ];

    if (supportedTypes.includes(type)) {
      return res.json({
        type,
        userInput: gemResult.userInput,
        response: gemResult.response,
        url: gemResult.url || null,
      });
    }

    // Default case: unknown command
    return res.status(400).json({ response: "I didn't understand that command." });
  } catch (error) {
    console.error("Ask Assistant Error:", error);
    return res.status(500).json({ response: "Internal server error" });
  }
};
