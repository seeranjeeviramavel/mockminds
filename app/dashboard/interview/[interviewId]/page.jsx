"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { mockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, Mic, Video, WebcamIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Webcam from "react-webcam";

const Interview = ({ params }) => {
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [webcamError, setWebCamError] = useState("");
  const [interviewData, setInterviewData] = useState({});
  const [audio, setAudio] = useState(false);
  useEffect(() => {
    GetInterviewDetails();
  }, [params.interviewId]);
  const GetInterviewDetails = async () => {
    const interview = await db
      .select()
      .from(mockInterview)
      .where(eq(mockInterview.mockId, params.interviewId));
    setInterviewData(interview[0]);
  };
  return (
    <div className="my-10  flex-col">
      <h2 className="font-bold text-2xl mb-5">Let's Get Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 min-h-96">
        <div className="flex flex-col items-center justify-center relative rounded-lg  bg-black">
          {webcamEnabled ? (
            <>
              <Webcam
                mirrored
                onUserMedia={() => setWebcamEnabled(true)}
                onUserMediaError={(err) => {
                  setWebCamError(err);
                  setWebcamEnabled(false);
                  console.log(err);
                  //NotAllowedError: Permission denied
                }}
                className="rounded-lg"
                style={{ width: "100%" }}
              />
            </>
          ) : (
            <>
              <Button onClick={() => setWebcamEnabled(true)}>
                Allow Microphone and Camera
              </Button>
            </>
          )}
          <div className="absolute top-5 left-5 text-white">
            {interviewData.jobPosition} - {interviewData.jobExperience}
            {interviewData.jobExperience == 1 ? "year" : "years"}
          </div>
          <div className="absolute flex gap-5 bottom-5">
            <div
              className={`rounded-full  p-3 cursor-pointer text-white  ${
                webcamEnabled ? "bg-primary " : "bg-red-500"
              }`}
              onClick={() => setWebcamEnabled(!webcamEnabled)}
            >
              <Video size={20} />
            </div>
            <div
              className={`rounded-full  p-3 cursor-pointer text-white ${
                audio ? "bg-primary" : "bg-red-500"
              }`}
              onClick={() => setAudio(!audio)}
            >
              <Mic size={20} />
            </div>
          </div>
        </div>
        <div className="flex flex-col my-5 gap-5 items-center justify-center ">
          {/* <div className="flex flex-col gap-5 p-5 rounded-lg border">
            <h2 className="text-lg">
              <strong>Job Role/Job Position:</strong>
              {interviewData.jobPosition}
            </h2>
            <h2 className="text-lg">
              <strong>Job Description:</strong>
              {interviewData.jobDescription}
            </h2>
            <h2 className="text-lg">
              <strong>Job Experience:</strong>
              {interviewData.jobExperience}
            </h2>
          </div> */}

          <h2 className="text-2xl">Ready to Start Interview?</h2>
          <Link
            className=""
            href={`/dashboard/interview/${params.interviewId}/start`}
          >
            <Button>
              Start Interview
              <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                -&gt;
              </span>
            </Button>
          </Link>
          <div className="flex flex-col gap-5 p-5 rounded-lg border border-yellow-300 bg-yellow-100">
            <h2 className="flex gap-2 items-center text-yellow-500">
              <Lightbulb /> Information
            </h2>
            <h2>
              <strong>NOTE</strong>: We never record your video. You can disable
              Camera access at any time.
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
