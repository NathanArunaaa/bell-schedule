import React, { useEffect, useState } from 'react';

// Helper function to convert time strings to Date objects
const timeStringToDate = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
};

const BellSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [currentEvent, setCurrentEvent] = useState({});
  const [nextEvent, setNextEvent] = useState({});
  const [timeLeft, setTimeLeft] = useState('');

  // Fetch the JSON schedule data
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/schedule.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setSchedule(data);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };

    fetchSchedule();
  }, []);

  // Calculate the next event and update the timer
  useEffect(() => {
    if (schedule.length > 0) {
      const now = new Date();
      let currentIndex = schedule.findIndex((event) => {
        const startTime = timeStringToDate(event.start);
        const endTime = timeStringToDate(event.end);
        return now >= startTime && now <= endTime;
      });

      if (currentIndex === -1) {
        // If no current event, find the next event
        currentIndex = -1;
      }

      const nextIndex = (currentIndex + 1) % schedule.length;
      setCurrentEvent(schedule[currentIndex] || {});
      setNextEvent(schedule[nextIndex] || {});

      const interval = setInterval(() => {
        const now = new Date();
        const nextTime = timeStringToDate(schedule[nextIndex].start);
        const timeDiff = nextTime - now;

        if (timeDiff > 0) {
          const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
          const seconds = Math.floor((timeDiff / 1000) % 60);
          setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        } else {
          setTimeLeft('00:00');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [schedule, nextEvent]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800">
      <section className="text-center p-8 bg-slate-800 rounded-lg mx-auto">
        <h1 className="mb-4  font-extrabold tracking-tight leading-none text-white lg:text-9xl">
          {currentEvent.event || 'No event currently'}
        </h1>
        <p className="mb-8 text-lg  font-bold text-gray-500 lg:text-4xl">
          Upcoming: {nextEvent.event || 'No upcoming events'}
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
          <a
           
            className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700  "
          >
            Time until next period: {timeLeft}
            
          </a>
          
        </div>
      </section>
    </div>
  );
};

export default BellSchedule;
