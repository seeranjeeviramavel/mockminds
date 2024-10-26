import { UserButton } from "@clerk/nextjs";
import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import Logo from "@/components/ui/logo";

const Dashboard = () => {
  return (
    <div class="p-10">
      <div class="pb-6 text-center md:pb-8">
        <h1 class="mb-6  text-5xl font-bold [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1] md:text-6xl">
          Start your <br class="max-lg:hidden" />
          Mock Interview Now
        </h1>
        <div class="mx-auto max-w-3xl">
          <p class="mb-8 text-lg text-gray-700">
            Mock Minds is your ultimate platform for practicing mock interviews.
            Get instant feedback to enhance your skills and boost your
            confidence.
          </p>
          <div class="relative before:absolute before:inset-0 before:[border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1]">
            <div class="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <AddNewInterview />
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 my-5"></div>
      <InterviewList />
    </div>
  );
};

export default Dashboard;
