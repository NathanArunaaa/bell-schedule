import React, { useEffect, useState } from 'react';

const timeStringToDate = (timeString, addDay = 0) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);

  if (addDay > 0) {
    now.setDate(now.getDate() + addDay);
  }

  return now;
};

const BellSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [currentEvent, setCurrentEvent] = useState({});
  const [nextEvent, setNextEvent] = useState({});
  const [timeLeft, setTimeLeft] = useState('');

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

  useEffect(() => {
    if (schedule.length > 0) {
      const now = new Date();
      let currentIndex = schedule.findIndex((event) => {
        const startTime = timeStringToDate(event.start);
        const endTime = timeStringToDate(event.end);
        return now >= startTime && now <= endTime;
      });

      let nextIndex = currentIndex + 1;

      if (currentIndex === -1) {
        nextIndex = schedule.findIndex((event) => timeStringToDate(event.start) > now);

        if (nextIndex === -1) {
          nextIndex = 0;
        }
      }

      setCurrentEvent(schedule[currentIndex] || {});
      setNextEvent(schedule[nextIndex] || {});

      const interval = setInterval(() => {
        const now = new Date();
        if (schedule[nextIndex]) {
          const nextTime = timeStringToDate(schedule[nextIndex].start, nextIndex === 0 ? 1 : 0); 
          const timeDiff = nextTime - now;

          if (timeDiff > 0) {
            const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
            const hours = Math.floor((timeDiff / 1000 / 60 / 60));
            const seconds = Math.floor((timeDiff / 1000) % 60);
            setTimeLeft(`${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
          } else {
            setTimeLeft('00:00:00');
          }
        } else {
          setTimeLeft('00:00:00');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [schedule]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800">
      <section className="text-center p-8 bg-slate-800 rounded-lg mx-auto">
        <h1 className="mb-4 font-extrabold tracking-tight leading-none text-white lg:text-9xl">
          Currently {currentEvent.event || 'N/A'}
        </h1>
        <p className="mb-8 font-bold text-gray-500 lg:text-6xl">
          --Upcoming: {nextEvent.event || 'No upcoming events'} --
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
          <p className="mb-8 text-lg font-bold text-gray-500 lg:text-4xl">
            Time until next period: {timeLeft}
          </p>
        </div>
      </section>
    </div>
  );
};

export default BellSchedule;
