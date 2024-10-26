"use client";
import { Lightbulb, Volume2 } from "lucide-react";
import React, { useState } from "react";

const QuestionSection = ({ mockInterviewQuestions, activeQuestionIndex, setActiveQuestionIndex }) => {
  const textToSpeech = (text) => {
    if (!window.speechSynthesis) {
      alert("Speech Synthesis Not Supported");
      return;
    } else {
      const speech = new SpeechSynthesisUtterance();
      speech.text = text;
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      speech.lang = "en-US";
      window.speechSynthesis.speak(speech);
    }
  };
  return (
    mockInterviewQuestions && (
      <div className="p-5 border rounded-lg ">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mockInterviewQuestions &&
            mockInterviewQuestions.map((question, index) => (
              <h2
                key={index}
                className={`p-2  rounded-full text-xs md:text-sm text-center cursor-pointer ${
                    activeQuestionIndex === index
                    ? "bg-primary text-white"
                    : "bg-secondary"
                }`}
                onClick={() => setActiveQuestionIndex(index)}
              >
                <strong>{"Question #" + (index + 1)}</strong>
              </h2>
            ))}
        </div>
        <h2 className="my-5 text-md md:text-lg">
          <strong>{"Question #" + (activeQuestionIndex + 1) + ": "}</strong>
          {mockInterviewQuestions[activeQuestionIndex]?.question}
        </h2>
        <Volume2
        className="cursor-pointer"
          onClick={() =>
            textToSpeech(mockInterviewQuestions[activeQuestionIndex]?.question)
          }
        />
        <div className="border rounded-lg p-5 bg-blue-100 my-10">
          <h2 className="flex gap-2 items-center text-primary mb-4">
            <Lightbulb />
            <strong>Note:</strong>
          </h2>
          Click on 'Record Answer' when you're ready to respond to the question.
          At the end of the interview, we will provide feedback along with the
          correct answers for each question, and compare them with your
          responses
        </div>
      </div>
    )
  );
};

export default QuestionSection;
