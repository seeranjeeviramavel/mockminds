import { Button } from "@/components/ui/button";
import moment from "moment";
import Link from "next/link";
import React from "react";

const InterviewCard = ({ interview }) => {
  return (
    <div className="border shadow-sm rounded-lg p-4">
      <div className="flex justify-between">
        <h2 className="font-bold text-primary">{interview.jobPosition}</h2>
        <h2 className="text-sm text-gray-500">
          {moment(interview.created_at).fromNow()}
        </h2>
      </div>
      <h2 className="text-sm text-gray-500">{interview.jobDescription}</h2>
      <h2 className="text-sm text-gray-500">{interview.jobExperience} years of Experience</h2>
      <div className="flex justify-between my-4 gap-5">
        <Link
          href={`/dashboard/interview/${interview.mockId}/feedback`}
          className="w-full"
        >
          <Button size="sm" variant="outline" className="w-full">
            Feedback{" "}
          </Button>
        </Link>
        <Link
          href={`/dashboard/interview/${interview.mockId}`}
          className="w-full"
        >
          <Button size="sm" className="w-full">
            Start{" "}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default InterviewCard;