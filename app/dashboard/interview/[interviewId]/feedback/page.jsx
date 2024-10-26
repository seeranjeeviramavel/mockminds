"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FeedbackPage = ({ params }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetFeedback();
  }, []);

  const router = useRouter();

  const GetFeedback = async () => {
    setLoading(true);
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, params.interviewId));
    setFeedbackList(result);
    setLoading(false);
  };

  const overallRating =
    feedbackList.length > 0
      ? Math.round(
          feedbackList.reduce(
            (total, feedback) => total + Number(feedback.rating), // Convert rating to number
            0
          ) / feedbackList.length
        )
      : 0;

  return (
    <div className="p-10">
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <LoaderCircle className="h-16 w-16 animate-spin text-blue-500" />
        </div>
      ) : feedbackList.length === 0 ? (
        <>
          <h2 className="font-bold text-2xl">No Interview Feedback Yet!!</h2>
          <Link href={`/dashboard`}>
            <Button>Go to Home</Button>
          </Link>
        </>
      ) : (
        <>
          <h2 className="font-bold text-4xl">
            Thank you for taking part in the interview!!
          </h2>
          <h2 className="text-gray-500 my-1">
            Here is your Interview Feedback
          </h2>
          <h2 className="text-primary text-2xl font-bold my-1">
            Your Overall Rating: {overallRating} out of 10
          </h2>
          <h2 className="text-sm text-gray-500">
            Find below interview question with correct answer, Your answer, and
            feedback for improvement
          </h2>
          {feedbackList.map((feedback, index) => (
            <Collapsible key={index} open={index === expandedIndex}>
              <CollapsibleTrigger
                className="p-4 bg-secondary rounded-lg my-2 flex justify-between text-left gap-7 w-full"
                onClick={() => setExpandedIndex(index)}
              >
                <div>
                  <strong>{`Question #${index + 1}: `}</strong>
                  {feedback.question}
                </div>
                <ChevronsUpDown className="h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-col gap-2">
                  <h2 className="text-primary p-4 rounded-lg">
                    <strong>Rating: {feedback.rating}</strong>
                  </h2>
                  <h2 className="p-4 border rounded-lg bg-red-50 text-sm text-red-900">
                    <strong>Your Answer: </strong>
                    {feedback.userAnswer}
                  </h2>
                  <h2 className="p-4 border rounded-lg bg-green-50 text-sm text-green-900">
                    <strong>Correct Answer: </strong>
                    {feedback.correctAnswer}
                  </h2>
                  <h2 className="p-4 border rounded-lg bg-blue-50 text-sm text-primary">
                    <strong>Feedback: </strong>
                    {feedback.feedback}
                  </h2>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
          <Button onClick={() => router.replace("/dashboard")}>
            Go to Home
          </Button>
        </>
      )}
    </div>
  );
};

export default FeedbackPage;
