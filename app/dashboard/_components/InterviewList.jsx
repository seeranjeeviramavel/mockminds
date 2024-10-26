"use client";
import { db } from "@/utils/db";
import { mockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import InterviewCard from "./InterviewCard";
import { LoaderCircle } from "lucide-react";

const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      GetInterviewList();
    }
  }, [user]); // Dependency on 'user'

  const GetInterviewList = async () => {
    setLoading(true); // Set loading state to true when fetching data
    try {
      const result = await db
        .select()
        .from(mockInterview)
        .where(
          eq(mockInterview.created_by, user?.primaryEmailAddress?.emailAddress)
        )
        .orderBy(desc(mockInterview.created_at));
      setInterviewList(result);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    }
    setLoading(false);
  };

  return (
    <div>
      {interviewList.length > 0 && 
      <h2 className="font-bold text-2xl">Previous Mock Interviews</h2>
      
      }
      {loading ? (
        <div className="inset-0 flex items-center justify-center my-5">
          <LoaderCircle className="h-16 w-16 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 my-5 gap-5">
          {interviewList &&
            interviewList.map((interview) => (
              <InterviewCard key={interview.mockId} interview={interview} />
            ))}
        </div>
      )}
    </div>
  );
};

export default InterviewList;
