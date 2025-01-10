import React from "react";
import AdminDetailsForm from "../AdminDetailsForm";

const Administration = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Administration Section</h1>
      <div className="bg-white rounded-lg shadow-lg">
        <AdminDetailsForm />
      </div>
    </div>
  );
};

export default Administration;
