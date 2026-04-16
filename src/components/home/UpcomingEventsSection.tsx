import React from 'react';
import UpcomingEvents from '@/components/UpcomingEvents';
import { fetchUpcomingEvents } from '@/lib/fetchers';

const UpcomingEventsSection = async () => {
  const events = await fetchUpcomingEvents();

  return <UpcomingEvents events={events} />;
};

export default UpcomingEventsSection;
