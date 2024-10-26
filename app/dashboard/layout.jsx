import React from "react";
import Header from "./_components/Header";

const DashboardLayout = ({ children }) => {
  return (
    <div>
      <Header />
      <div class="mx-5 md:mx-14 lg:mx-28">
      {children}
      </div>

    </div>
  );
};

export default DashboardLayout;
