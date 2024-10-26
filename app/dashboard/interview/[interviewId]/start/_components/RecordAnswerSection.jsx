"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { CirclePause, Mic } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/AIModel";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";

const RecordAnswerSection = ({
  mockInterviewQuestions,
  activeQuestionIndex,
  interviewData,
}) => {
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingAnswer, setExistingAnswer] = useState(null); // Track existing answer

  // Fetch the existing answer for the current question when component loads or question changes
  useEffect(() => {
    GetExistingAnswer();
  }, [activeQuestionIndex]);

  const GetExistingAnswer = async () => {
    setLoading(true);
    const existing = await db
      .select()
      .from(UserAnswer)
      .where(
        eq(UserAnswer.mockIdRef, interviewData.mockId),
        eq(
          UserAnswer.question,
          mockInterviewQuestions[activeQuestionIndex]?.question
        )
      );

    if (existing.length > 0) {
      setUserAnswer(existing[0].userAnswer); // Prefill with the existing answer
      setExistingAnswer(existing[0]); // Set the existing answer to track if we need to update
    } else {
      setUserAnswer("");
      setExistingAnswer(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isRecording) {
      results.map((result) => {
        setUserAnswer((prev) => prev + " " + result.transcript);
      });
    }
  }, [results]);

  const SaveUserAnswer = async () => {
    setLoading(true);
    stopSpeechToText();

    if (userAnswer.length < 10) {
      toast("Please speak at least 10 words");
      return;
    }

    const feedbackPrompt =
      "Question : " +
      mockInterviewQuestions[activeQuestionIndex].question +
      " Answer : " +
      userAnswer +
      ", Depends on question and user answer for given interview question. Please give us rating for answer and feedback as area of improvement if any in just 3 to 5 lines in JSON format with rating field and feedback field";

    const result = await chatSession.sendMessage(feedbackPrompt);
    const jsonResponse = JSON.parse(result.response.text());
    if (existingAnswer) {
      await db
        .update(UserAnswer)
        .set({
          userAnswer: userAnswer,
          rating: jsonResponse.rating,
          feedback: jsonResponse.feedback,
        })
        .where(eq(UserAnswer.id, existingAnswer.id));
    } else {
      // If no existing answer, insert a new one
      await db.insert(UserAnswer).values({
        mockIdRef: interviewData.mockId,
        question: mockInterviewQuestions[activeQuestionIndex].question,
        correctAnswer: mockInterviewQuestions[activeQuestionIndex].answer,
        userAnswer: userAnswer,
        userMail: interviewData.created_by,
        rating: jsonResponse.rating,
        feedback: jsonResponse.feedback,
      });
    }

    setUserAnswer("");
    setLoading(false);
  };

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      SaveUserAnswer();
    }
  }, [userAnswer]);

  return (
    <div className="flex items-center justify-center  flex-col">
      <div className="flex flex-col items-center justify-center  rounded-lg p-5 bg-black">
        <Image
          src="/webcam.svg"
          alt="logo"
          width={200}
          height={200}
          className="absolute"
        />
        <Webcam
          mirrored
          style={{
            width: "100%",
            height: 300,
            zIndex: 10,
          }}
        />
      </div>
      {isRecording ? (
        <Button
          className="my-10 bg-red-500  hover:bg-red-400"
          onClick={() => {
            stopSpeechToText();
            SaveUserAnswer();
          }}
        >
          <CirclePause size={20} className="me-1" />
          Stop Recording
        </Button>
      ) : (
        <Button variant="outline" className="my-10" onClick={startSpeechToText}>
          <Mic size={20} className="me-1" />
          Start Recording
        </Button>
      )}
      <ul>
        {results.map((result) => (
          <li key={result.timestamp}>{result.transcript}</li>
        ))}
        {interimResult && <li>{interimResult}</li>}
      </ul>
    </div>
  );
};

export default RecordAnswerSection;
