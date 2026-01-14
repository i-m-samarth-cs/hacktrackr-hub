// Local Storage utilities for HackTrackr
// This will be replaced with Lovable Cloud backend

import { HackathonEvent, Quiz } from '@/types';

const EVENTS_KEY = 'hacktrackr_events';
const QUIZZES_KEY = 'hacktrackr_quizzes';

// Events
export const getEvents = (): HackathonEvent[] => {
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEvents = (events: HackathonEvent[]): void => {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
};

export const addEvent = (event: HackathonEvent): void => {
  const events = getEvents();
  events.push(event);
  saveEvents(events);
};

export const updateEvent = (updatedEvent: HackathonEvent): void => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === updatedEvent.id);
  if (index !== -1) {
    events[index] = { ...updatedEvent, updatedAt: new Date().toISOString() };
    saveEvents(events);
  }
};

export const deleteEvent = (eventId: string): void => {
  const events = getEvents().filter(e => e.id !== eventId);
  saveEvents(events);
};

// Quizzes
export const getQuizzes = (): Quiz[] => {
  const data = localStorage.getItem(QUIZZES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveQuizzes = (quizzes: Quiz[]): void => {
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
};

export const addQuiz = (quiz: Quiz): void => {
  const quizzes = getQuizzes();
  quizzes.push(quiz);
  saveQuizzes(quizzes);
};

export const updateQuiz = (updatedQuiz: Quiz): void => {
  const quizzes = getQuizzes();
  const index = quizzes.findIndex(q => q.id === updatedQuiz.id);
  if (index !== -1) {
    quizzes[index] = updatedQuiz;
    saveQuizzes(quizzes);
  }
};

export const deleteQuiz = (quizId: string): void => {
  const quizzes = getQuizzes().filter(q => q.id !== quizId);
  saveQuizzes(quizzes);
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
