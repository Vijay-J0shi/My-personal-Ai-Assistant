import React, { useContext, useEffect, useRef, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from "../assets/ai.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();

  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [listening, setListening] = useState(false);
  const [ham, setHam] = useState(false);

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const synth = window.speechSynthesis;
  const timeoutRef = useRef(null);

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        if (e.name !== "InvalidStateError") console.error("Mic error:", e);
      }
    }
  };

  const speak = (text, followUp = "Anything else I can help you with?") => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'hi-IN';

    const voice = synth.getVoices().find(v => v.lang === 'hi-IN');
    if (voice) utter.voice = voice;

    isSpeakingRef.current = true;
    setAiText(text);
    setUserText("");
    setListening(false);

    utter.onend = () => {
      isSpeakingRef.current = false;
      setAiText(followUp);
      setTimeout(startRecognition, 600);
    };

    synth.cancel();
    synth.speak(utter);
  };

  const handleCommand = async (data) => {
    const { type, userInput, response, url } = data;
    const query = encodeURIComponent(userInput);
    const open = (u) => window.open(u, '_blank');

    if (type === 'open-website' && url) open(url);
    else if (type === 'calculator-open') open("https://www.google.com/search?q=calculator");
    else if (type === 'google-search') open(`https://www.google.com/search?q=${query}`);
    else if (type === 'youtube-search' || type === 'youtube-play') open(`https://www.youtube.com/results?search_query=${query}`);
    else if (type === 'instagram-open') open("https://www.instagram.com/");
    else if (type === 'facebook-open') open("https://www.facebook.com/");
    else if (type === 'weather-show') open("https://www.google.com/search?q=weather");

    speak(response);
  };

  const handleLogOut = async () => {
    await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
    setUserData(null);
    navigate("/signin");
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("❌ Your browser doesn't support speech recognition. Use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    let isMounted = true;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
      setUserText("🎤 Listening...");
      setAiText("");
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (!isSpeakingRef.current && isMounted) setTimeout(startRecognition, 800);
    };

    recognition.onerror = (e) => {
      console.warn("❗ Mic error:", e.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (!isSpeakingRef.current && isMounted) setTimeout(startRecognition, 1000);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log("🗣️ Heard:", transcript);

      if (!transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setUserText("❗ Say my name to trigger me.");
        return;
      }

      recognition.stop();
      isRecognizingRef.current = false;
      isSpeakingRef.current = true;

      setUserText(`🔍 Processing: "${transcript}"`);
      setAiText("");

      // 🕓 Clear stuck mic if no response in 10 seconds
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        console.warn("⏳ AI response timed out. Resetting.");
        setUserText("⏳ Response took too long. Please try again.");
        isSpeakingRef.current = false;
        setTimeout(startRecognition, 800);
      }, 10000);

      try {
        await new Promise(res => setTimeout(res, 600)); // give user 600ms pause
        const result = await getGeminiResponse(transcript);
        clearTimeout(timeoutRef.current);
        await handleCommand(result);
      } catch (err) {
        console.error("AI Error:", err);
        speak("Sorry, something went wrong.");
      }
    };

    const waitForVoices = () =>
      new Promise(resolve => {
        if (synth.getVoices().length) return resolve();
        synth.onvoiceschanged = () => {
          console.log("✅ Voice model loaded");
          resolve();
        };
      });

    (async () => {
      await waitForVoices();
      const greet = new SpeechSynthesisUtterance(`Hello ${userData.name}, I'm ready to help.`);
      greet.lang = "hi-IN";
      greet.onend = () => startRecognition();
      synth.speak(greet);
    })();

    const onVisible = () => {
      if (document.visibilityState === "visible" && !isSpeakingRef.current && !isRecognizingRef.current) {
        startRecognition();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      isMounted = false;
      recognition.stop();
      document.removeEventListener("visibilitychange", onVisible);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex flex-col items-center justify-center gap-4 overflow-hidden">
      <CgMenuRight className="lg:hidden text-white absolute top-5 right-5 w-6 h-6" onClick={() => setHam(true)} />
      <div className={`absolute lg:hidden top-0 left-0 w-full h-full bg-[#00000080] p-5 ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
        <RxCross1 className="text-white absolute top-5 right-5 w-6 h-6" onClick={() => setHam(false)} />
        <button onClick={handleLogOut} className="btn">Log Out</button>
        <button onClick={() => navigate("/customize")} className="btn mt-3">Customize Assistant</button>
        <hr className="border-gray-400 my-4" />
        <h2 className="text-white mb-2">History</h2>
        <div className="overflow-y-auto h-64 space-y-2">
          {userData.history?.map((his, i) => (
            <p key={i} className="text-gray-200">{his}</p>
          ))}
        </div>
      </div>

      <button onClick={handleLogOut} className="hidden lg:block btn absolute top-5 right-5">Log Out</button>
      <button onClick={() => navigate("/customize")} className="hidden lg:block btn absolute top-20 right-5 mt-2">Customize Assistant</button>

      <img src={userData?.assistantImage || aiImg} alt="Assistant" className="w-72 h-96 object-cover rounded-3xl shadow-lg" />
      <h1 className="text-white text-xl font-semibold">I'm {userData?.assistantName}</h1>

      {userText && <p className="text-white">{userText}</p>}
      {aiText && <p className="text-green-400 font-semibold">{aiText}</p>}
    </div>
  );
}

export default Home;
