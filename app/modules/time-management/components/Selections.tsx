"use client";

import { useEffect, useState } from "react";
import s from "../page.module.css";
import { EmployeeProfile, getAllEmployees } from "../../hr/api/hrApi";

interface Props {
  employeeId: string;
  setEmployeeId: (id: string) => void;
}

export default function Selections({
  employeeId,
  setEmployeeId,
}: Props) {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]); // State for employee list
  const [loading, setLoading] = useState<boolean>(true); // Loading state to track if data is being fetched
  const [error, setError] = useState<string | null>(null); // Error state for handling failures

  // Fetch employees data
  useEffect(() => {
    getAllEmployees()
      .then((data) => {
        setEmployees(data);
        setLoading(false);

        // If employeeId is not already set, set the first employee as default
        if (data.length > 0 && !employeeId) {
          setEmployeeId(data[0]._id); // Default to the first employee's ID
        }
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
        setError("Failed to load employees");
        setLoading(false);
      });
  }, [employeeId, setEmployeeId]); // UseEffect runs only once on initial load, unless employeeId changes

  // Log to check if employeeId is updated
  useEffect(() => {
    console.log("Current employeeId in Selections:", employeeId); // Log to track employeeId updates
  }, [employeeId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Handle employee selection
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEmployeeId(e.target.value); // Update employeeId when a selection is made
  };

  return (
    <select
      className={s.select}
      value={employeeId} // Bind value of select to employeeId
      onChange={handleChange} // Update employeeId when the user selects an option
      required
    >
      <option value="" disabled>
        Select an Employee
      </option>
      {employees.map((em) => (
        <option key={em._id} value={em._id}>
          {em.firstName} {em.lastName}
        </option>
      ))}
    </select>
  );
}
