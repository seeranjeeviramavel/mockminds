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
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import mammoth from "mammoth";
import pdfToText from "react-pdftotext";
import { toast } from "sonner";

const AddNewInterview = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobPosition: "",
    jobDescription: "",
    jobExperience: "",
  });
  const [jsonResponse, setJsonResponse] = useState([]);
  const [files, setFiles] = useState([]);
  const [extractedText, setExtractedText] = useState(""); // New state to store extracted text
  const router = useRouter();
  const { user } = useUser();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const cleanUpText = (text) => {
    return text
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, "")
      .replace(/\n+/g, "\n")
      .replace(/\n/g, " ");
  };
  const limitTextToWords = (text, maxWords) => {
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + "...";
    }
    return text;
  };
  const handleFileChange = async (file) => {
    setLoading(true);
    setFiles(file);
    const fileOG = file[0]?.file;
    try {
      if (!fileOG) {
        toast.error("No file selected. Please upload a valid file.");
        return;
      }
      const validFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validFileTypes.includes(fileOG.type)) {
        toast.error(
          "Unsupported file type. Please upload a PDF or Word document."
        );
        return;
      }

      let extractedText = "";
      if (fileOG.type === "application/pdf") {
        extractedText = await pdfToText(fileOG);
      } else if (
        fileOG.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ arrayBuffer: fileOG });
        extractedText = result.value;
      }
      extractedText = cleanUpText(extractedText);
      extractedText = limitTextToWords(extractedText, 700);
      setExtractedText(extractedText);
      setLoading(false);
    } catch (error) {
      console.error("Text extraction failed: ", error);
    }
  };

  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    if (!extractedText) {
      toast.error("Please upload a valid file.");
      return;
    }
    setLoading(true);
    if (extractedText) {
      try {
        const prompt = `
            ${extractedText}
            I will give you the resume text above, you need to analyze the first validate the resume by is it resume or some other text if resume is not valid then set the isResumeValdid to false and other  properties as empty string,if resume is valid then job title, job description, and job experience and generate a list of interview 10 non coding questions with answers for the following in a json format, the json format must be like this
    {
             "isResumeValid": "boolean",
             "jobPosition": "string",
              "jobDescription": "string",
              "jobExperience": number,
               "interviewData":[{
                 "question":"string",
                  "answer": "string"}]
    }`;
        const result = await chatSession.sendMessage(prompt);
        const mockresponse = JSON.parse(result.response.text());

        if (mockresponse) {
          const resp = await db
            .insert(mockInterview)
            .values({
              mockId: uuidv4(),
              jobPosition: mockresponse.jobPosition,
              jobDescription: mockresponse.jobDescription,
              jobExperience: mockresponse.jobExperience,
              created_by: user.primaryEmailAddress?.emailAddress,
            })
            .returning({
              mockId: mockInterview.mockId,
            });
          await Promise.all(
            mockresponse?.interviewData?.map(({ question, answer }) =>
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
        } else {
          toast.error("Failed to generate interview questions.");
        }
      } catch (error) {
        console.error("Text extraction failed: ", error);
        toast.error(`Error extracting text: ${error.message}`);
      }
    }
  };
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
      try {
        const result = await chatSession.sendMessage(prompt);
        const mockresponse = JSON.parse(result.response.text());
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
        } else {
          toast.error("Failed to generate interview questions.");
        }
      } catch (error) {
        toast.error("Error submitting the form.");
        console.error("Submission error:", error);
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please fill out all required fields");
      setLoading(false);
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
              <Carousel className="w-full max-w-[95vw]">
                <CarouselContent className="w-full">
                  <CarouselItem className="w-full">
                    <form onSubmit={handleSubmit}>
                      <div>
                        <h2 className="text-md font-semibold">
                          Add Details about your job position/role, Job
                          Description, and the years of experience you have
                        </h2>
                        <div>
                          <div className="my-3">
                            <label className="block mb-1 text-sm font-medium">
                              Job Role / Job Position
                            </label>
                            <Input
                              name="jobPosition"
                              placeholder="Ex. Software Engineer"
                              value={formData.jobPosition}
                              onChange={handleChange}
                              required
                              className="w-full"
                            />
                          </div>

                          <div className="my-3">
                            <label className="block mb-1 text-sm font-medium">
                              Job Description
                            </label>
                            <Textarea
                              name="jobDescription"
                              placeholder="Ex. I am a software engineer"
                              value={formData.jobDescription}
                              onChange={handleChange}
                              required
                              className="w-full"
                            />
                          </div>

                          <div className="my-3">
                            <label className="block mb-1 text-sm font-medium">
                              Years of Experience
                            </label>
                            <Input
                              name="jobExperience"
                              placeholder="Ex. 5"
                              type="number"
                              value={formData.jobExperience}
                              onChange={handleChange}
                              required
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                              setOpen(false);
                              setLoading(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {loading && (
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Start Interview
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CarouselItem>
                  <CarouselItem className="w-full">
                    <div className="flex flex-col h-full w-full max-w-[95vw]">
                      <div className="mb-3">
                        <h2 className="text-md font-semibold">
                          Upload your resume (PDF or Word)
                        </h2>
                      </div>

                      <FilePond
                        className="my-3 w-full"
                        files={files}
                        onupdatefiles={(file) => handleFileChange(file)}
                        allowMultiple={false}
                        name="files"
                        acceptedFileTypes={[
                          "application/pdf",
                          "application/msword",
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        ]}
                        labelIdle='Drag & Drop your Resume or <span class="filepond--label-action">Browse</span>'
                      />
                      <p>
                        We will not store your resume or personal details on our
                        server, we just extract your job description from your
                        resume for your personalised interview
                      </p>
                      <div className="flex-grow" />

                      <div className="flex justify-end gap-3 mt-3 w-full p-2">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            setLoading(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={loading}
                          onClick={handleResumeSubmit}
                          className="flex items-center"
                        >
                          Start Interview
                        </Button>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious /> <CarouselNext />{" "}
              </Carousel>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
