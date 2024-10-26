"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/utils/db";
import { mockInterview, UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import useSpeechToText from "react-hook-speech-to-text";
import {
  Lightbulb,
  Mic,
  Volume2,
  CirclePause,
  Pencil,
  Check,
  Video,
  LoaderCircle,
  SendHorizontal,
  VideoOff,
  MicOff,
} from "lucide-react";
import Image from "next/image";
import Webcam from "react-webcam";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { chatSession } from "@/utils/AIModel";
import moment from "moment";
import { useRouter } from "next/navigation";

const StartInterview = ({ params }) => {
  const textareaRef = useRef(null);
  const router = useRouter();
  const [interviewData, setInterviewData] = useState({});
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [onTextChange, setOnTextChange] = useState("");
  const [webcamEnabled, setWebcamEnabled] = useState(true);
  const [pageloading, setPageloading] = useState(true);
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

  useEffect(() => {
    results.forEach((result) => {
      updateUserAnswer((prev) => prev + " " + result.transcript);
    });
  }, [results]);

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  useEffect(() => {
    if (edit && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [edit]);

  useEffect(() => {
    if (
      mockInterviewQuestions.length > 0 &&
      mockInterviewQuestions[activeQuestionIndex]?.question
    ) {
      textToSpeech(mockInterviewQuestions[activeQuestionIndex]?.question);
    }
  }, [activeQuestionIndex]);
  const updateUserAnswer = (newAnswer) => {
    if (activeQuestionIndex >= mockInterviewQuestions.length) {
      return;
    }
    const updatedAnswers = mockInterviewQuestions.map((question, index) => {
      if (index === activeQuestionIndex) {
        return {
          ...question,
          userAnswer: newAnswer,
        };
      }
      return question;
    });
    setMockInterviewQuestions(updatedAnswers);
  };

  const validateAndMoveNext = () => {
    const currentQuestion = mockInterviewQuestions[activeQuestionIndex];
    const currentAnswer = currentQuestion?.userAnswer;
    if (onTextChange.trim().length > 0) {
      updateUserAnswer(onTextChange);
      setOnTextChange("");
    }
    if (!currentAnswer && onTextChange.trim().length === 0) {
      toast("Please provide an answer before moving to the next question.", {
        description: moment().format("hh:mm A"),
        action: { label: "Clear" },
      });
      return;
    }
    if (activeQuestionIndex < mockInterviewQuestions.length - 1) {
      setActiveQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const textToSpeech = (text) => {
    if (!window.speechSynthesis) {
      alert("Speech Synthesis Not Supported");
      return;
    } else {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance();
      speech.text = text;
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      speech.lang = "en-US";
      window.speechSynthesis.speak(speech);
    }
  };

  const GetInterviewDetails = async () => {
    setPageloading(true);
    try {
      const interview = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId));
      const userDetails = await db
        .select()
        .from(mockInterview)
        .where(eq(mockInterview.mockId, params.interviewId));
      setInterviewData(userDetails[0]);
      setMockInterviewQuestions(interview);
      setActiveQuestionIndex(0);
      GetExistingAnswer(interview[0].mockId);
    } catch (error) {
      console.error("Error fetching interview details:", error);
    } finally {
      setPageloading(false);
    }
  };

  const GetExistingAnswer = async (mockId) => {
    const existing = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, mockId));

    if (existing.length > 0) {
      setMockInterviewQuestions(existing);
    }
  };

  const SaveUserAnswer = async () => {
    setLoading(true);
    stopSpeechToText();
    const feedbackPrompt = `[
      {
          "questionId": "string",
          "question": "string",
          "answer": "string",
          "userAnswer": "string"
      }
    ]
    I'll give you input like this above, you just need to return a json like this
    {
      "OverallRating": "string",
      "result": [
          {
          "question": "string",
          "answer": "string",
          "userAnswer": "string"
          "questionId": "string",
          "rating": "string",
          "feedback": "string"
          }
      ]
    }
    Please give us a rating and feedback for the userAnswer in 3-5 lines as JSON with rating and feedback fields.
    if the userAnswer is not there, show the feedback and rating as empty
    Rating should be in between 1 to 10.

    my input:
    ${JSON.stringify(mockInterviewQuestions)}
    `;
    const result = await chatSession.sendMessage(feedbackPrompt);
    const jsonResponse = JSON.parse(
      result.response.text().replace("```json", "").replace("```", "")
    );
    for (const feedback of jsonResponse.result) {
      await db
        .update(UserAnswer)
        .set({
          userAnswer: feedback.userAnswer,
          rating: feedback.rating,
          feedback: feedback.feedback,
        })
        .where(eq(UserAnswer.questionId, feedback.questionId));
    }
    setEdit(false);
    router.push(`/dashboard/interview/${params.interviewId}/feedback`);
    setLoading(false);
  };
  return (
    <>
      {pageloading ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <LoaderCircle className="h-16 w-16 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <div className="my-8">
            <div className="overflow-x-auto my-4">
              <div className="grid grid-flow-col-dense gap-5">
                {mockInterviewQuestions?.map((question, index) => (
                  <h2
                    key={index}
                    className={`p-2 rounded-full text-nowrap text-xs md:text-sm text-center cursor-pointer ${
                      activeQuestionIndex === index
                        ? "bg-primary text-white"
                        : "bg-secondary"
                    }`}
                  >
                    <strong>Question #{index + 1}</strong>
                  </h2>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 mb-3">
              <div className="p-5 border rounded-lg h-[450px] flex flex-col">
                <div className="flex-grow overflow-y-auto">
                  <h2 className="text-lg font-bold text-primary md:text-md">
                    Mock Minds AI:
                  </h2>

                  <h2 className="my-5 text-md md:text-md flex items-center gap-3">
                    <span className="bg-gray-200 text-black py-3 px-5 rounded-tl-3xl rounded-tr-3xl rounded-br-3xl max-w-lg">
                      {mockInterviewQuestions[activeQuestionIndex]?.question}
                    </span>

                    <Volume2
                      className="cursor-pointer ml-3 text-xl sm:text-2xl md:text-3xl"
                      onClick={() =>
                        textToSpeech(
                          mockInterviewQuestions[activeQuestionIndex]?.question
                        )
                      }
                    />
                  </h2>
                  <ul>
                    {isRecording &&
                      results.map((result) => (
                        <li
                          className="me-3 text-md md:text-md self-end bg-primary text-white py-3 px-5 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl max-w-lg"
                          key={result.timestamp}
                        >
                          {result.transcript}
                        </li>
                      ))}

                    {!isRecording &&
                    mockInterviewQuestions[activeQuestionIndex]?.userAnswer
                      ?.length > 0 &&
                    !edit ? (
                      <li className="flex justify-between my-3 text-md md:text-md self-end bg-primary text-white py-3 ps-5 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl max-w-lg">
                        {
                          mockInterviewQuestions[activeQuestionIndex]
                            ?.userAnswer
                        }
                        <div className="flex items-center justify-end mx-2 text-gray-300">
                          <>
                            <Pencil
                              size={20}
                              className="cursor-pointer"
                              onClick={() => setEdit(true)}
                            />
                          </>
                        </div>
                      </li>
                    ) : null}

                    {edit ? (
                      <div>
                        <textarea
                          ref={textareaRef}
                          className="my-3 text-md md:text-md self-end bg-blue-50 text-black py-3 px-5 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl max-w-lg w-full"
                          value={
                            mockInterviewQuestions[activeQuestionIndex]
                              ?.userAnswer
                          }
                          rows={4}
                          onChange={(e) => updateUserAnswer(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setEdit(false);
                            }
                          }}
                        />
                        <div className="flex items-center justify-end">
                          <Button
                            className="mt-2"
                            onClick={() => {
                              setEdit(false);
                            }}
                          >
                            <Check size={20} />
                            Done
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {interimResult && (
                      <li className="my-3 text-md md:text-md self-end bg-primary text-white py-3 px-5 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl max-w-lg">
                        {interimResult}
                        {isRecording && (
                          <div className="flex items-center justify-end mx-2">
                            <div className="loader" style={{ width: 8 }}></div>
                          </div>
                        )}
                      </li>
                    )}
                  </ul>
                </div>
                {!mockInterviewQuestions[activeQuestionIndex]?.userAnswer && (
                  <div className="flex items-center justify-center mt-2">
                    <Input
                      value={onTextChange}
                      placeholder={"Enter your answer..."}
                      onChange={(e) => {
                        setOnTextChange(e.target.value);
                        stopSpeechToText();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          stopSpeechToText();
                          updateUserAnswer(onTextChange);
                          setOnTextChange("");
                          validateAndMoveNext();
                        }
                      }}
                    />
                    {onTextChange ? (
                      <div
                        className="flex items-center justify-center rounded-full bg-gray-500 text-white p-3 ml-3"
                        onClick={() => {
                          stopSpeechToText();
                          updateUserAnswer(onTextChange);
                          setOnTextChange("");
                          validateAndMoveNext();
                        }}
                      >
                        <SendHorizontal />
                      </div>
                    ) : (
                      <>
                        {!isRecording ? (
                          <div
                            className="flex items-center justify-center rounded-full bg-gray-500 text-white p-3 ml-3"
                            onClick={startSpeechToText}
                          >
                            <MicOff size={20} />
                          </div>
                        ) : (
                          <div
                            className="flex items-center justify-center rounded-full bg-red-500 text-white p-3 ml-3"
                            onClick={stopSpeechToText}
                          >
                            <Mic size={20} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center h-[450px] flex-col">
                <div className="flex flex-col items-center justify-center rounded-lg bg-black relative w-full h-full">
                  <div className="absolute top-5 left-5 text-white z-10">
                    {interviewData.jobPosition} - {interviewData.jobExperience}{" "}
                    {interviewData.jobExperience == 1 ? "year" : "years"}
                  </div>
                  {!webcamEnabled && (
                    <Image
                      src="/webcam.svg"
                      alt="logo"
                      width={200}
                      height={200}
                    />
                  )}
                  {webcamEnabled && (
                    <Webcam
                      mirrored
                      onUserMediaError={(err) => {
                        setWebcamEnabled(false);
                        const errorMessage = err.name || err.message;
                        if (errorMessage === "NotAllowedError") {
                          toast.error("Please allow webcam access.");
                        } else {
                          toast.error(
                            "An error occurred while accessing the webcam."
                          );
                        }
                      }}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                  <div className="absolute flex gap-5 bottom-5 z-10">
                    {!webcamEnabled ? (
                      <div
                        className={`rounded-full p-3 cursor-pointer text-white ${"bg-gray-500 opacity-85"}`}
                        onClick={() => setWebcamEnabled(true)}
                      >
                        <VideoOff size={20} />
                      </div>
                    ) : (
                      <div
                        className={`rounded-full p-3 cursor-pointer text-white ${"bg-red-500 opacity-85"}`}
                        onClick={() => setWebcamEnabled(false)}
                      >
                        <Video size={20} />
                      </div>
                    )}
                    {!isRecording ? (
                      <div
                        className={`rounded-full p-3 cursor-pointer text-white ${"bg-gray-500 opacity-80"}`}
                        onClick={() => {
                          startSpeechToText();
                        }}
                      >
                        <MicOff size={20} />
                      </div>
                    ) : (
                      <div
                        className={`rounded-full p-3 cursor-pointer text-white ${"bg-red-500 opacity-80"}`}
                        onClick={() => stopSpeechToText()}
                      >
                        <Mic size={20} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-6">
              <Button
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
              >
                Prev Question
              </Button>
              {activeQuestionIndex !== mockInterviewQuestions.length - 1 && (
                <Button
                  disabled={
                    activeQuestionIndex === mockInterviewQuestions.length - 1
                  }
                  onClick={() => {
                    validateAndMoveNext();
                  }}
                >
                  Next Question
                </Button>
              )}
              {activeQuestionIndex === mockInterviewQuestions.length - 1 && (
                <Link
                  href={"/dashboard/interview/" + params.interviewId + "/start"}
                >
                  <Button
                    className="bg-red-500 text-white hover:bg-red-600"
                    disabled={loading}
                    onClick={() => {
                      SaveUserAnswer();
                    }}
                  >
                    {loading && (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Complete Interview
                    {!loading && (
                      <span className="ml-1 tracking-normal transition-transform group-hover:translate-x-0.5">
                        -&gt;
                      </span>
                    )}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StartInterview;
