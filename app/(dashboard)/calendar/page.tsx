"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar/Calendar";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
  );
}
