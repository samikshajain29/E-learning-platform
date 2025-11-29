import React, { useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { RiMicAiFill } from "react-icons/ri";
import ai from "../assets/ai.png";
import { useNavigate } from "react-router-dom";

function SearchWithAi() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  if (!recognition) {
    toast.error("Speech recognition is not supported");
  }

  const handleSearch = async () => {
    if (!recognition) return;
    recognition.start();
    recognition.onresult = async (e) => {
      console.log(e);
    };
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex flex-col items-center px-4 py-16">
      {/* search Container */}
      <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 w-full max-w-2xl text-center relative">
        <FaArrowLeftLong className="text-[black] w-[22px] h-[22px] cursor-pointer absolute" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-6 flex items-center justify-center gap-2">
          <img src={ai} alt="" className="w-8 h-8 sm:w-[30px] sm:h-[30px]" />
          Search with <span className="text-[#CB99C7]">AI</span>
        </h1>
        <div className="flex items-center bg-gray-700 rounded-full overflow-hidden shadow-lg relative w-full">
          <input
            type="text"
            className="flex-grow px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
            placeholder="What do you want to learn? (eg. AI, MERN, Cloud...)"
          />
          <button className="absolute right-14 sm:right-16 bg-white rounded-full">
            <img src={ai} alt="" className="w-10 h-10 p-2 rounded-full" />
          </button>
          <button
            className="absolute right-2 bg-white rounded-full w-10 h-10 flex items-center justify-center"
            onClick={handleSearch}
          >
            <RiMicAiFill className="w-5 h-5 text-[#cb87c5]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchWithAi;
