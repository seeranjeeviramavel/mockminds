"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/AIModel";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { mockInterview, UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { useRouter } from "next/navigation";
const AddNewInterview = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobPosition: "",
    jobDescription: "",
    jobExperience: "",
  });
  const [jsonResponse, setJsonResponse] = useState([]);
  const router = useRouter();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const { user } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (
      formData.jobPosition &&
      formData.jobDescription &&
      formData.jobExperience
    ) {
      const prompt = `Generate a list of ${process.env.NEXT_PUBLIC_MAX_QUESTIONS} interview non coding questions with answers for the following,
Job Position : ${formData.jobPosition}, Job Description: ${formData.jobDescription}, Job Experience : ${formData.jobExperience}, give it as JSON where it must be in this format
[{
  "question":"string",
  "answer": "string"}]
`;
      const result = await chatSession.sendMessage(prompt);
      console.log(result.response.text());
      const mockresponse = JSON.parse(
        result.response.text().replace("```json", "").replace("```", "")
      );
      setJsonResponse(mockresponse);
      if (mockresponse.length > 0) {
        const resp = await db
          .insert(mockInterview)
          .values({
            mockId: uuidv4(),
            jobPosition: formData.jobPosition,
            jobDescription: formData.jobDescription,
            jobExperience: formData.jobExperience,
            created_by: user.primaryEmailAddress?.emailAddress,
          })
          .returning({
            mockId: mockInterview.mockId,
          });
        console.log(resp[0].mockId);
        await Promise.all(
          mockresponse.map(({ question, answer }) =>
            db.insert(UserAnswer).values({
              mockIdRef: resp[0].mockId,
              questionId: uuidv4(),
              question,
              correctAnswer: answer,
              userMail: user.primaryEmailAddress?.emailAddress,
            })
          )
        );
        router.push(`/dashboard/interview/${resp[0].mockId}`);
        setLoading(false);
      } else {
        setLoading(false);
        alert("Please fill out all required fields");
      }
    } else {
      alert("Please fill out all required fields");
    }
  };

  return (
    <div>
      <div
        className="btn group mb-4 cursor-pointer w-full bg-primary bg-[bottom] text-white shadow hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <span className="relative inline-flex items-center">
          Start New Mock Interview{" "}
          <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
            -&gt;
          </span>
        </span>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl">
              Tell us more about your job interview
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={handleSubmit}>
                <div>
                  <h2>
                    Add Details about your job position/role, Job Description,
                    and the years of experience you have
                  </h2>
                  <div>
                    <div className="my-3">
                      <label>Job Role / Job Position</label>
                      <Input
                        name="jobPosition"
                        placeholder="Ex. Software Engineer"
                        value={formData.jobPosition}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="my-3">
                      <label>Job Description</label>
                      <Textarea
                        name="jobDescription"
                        placeholder="Ex. I am a software engineer"
                        value={formData.jobDescription}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="my-3">
                      <label>Years of Experience</label>
                      <Input
                        name="jobExperience"
                        placeholder="Ex. 5"
                        type="number"
                        value={formData.jobExperience}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setLoading(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" type="submit" disabled={loading}>
                      {loading && (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Start Interview
                    </Button>
                  </div>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
