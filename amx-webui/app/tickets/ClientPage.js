'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from "next-auth/react";
import SidebarNavigation from '@/components/SidebarNavigation';

const issueCategories = {
  Video: [
    'No Stream Signal',
    'Frozen Video',
    'No Video / Blank Video',
    'Distorted Video',
    'AMX Blue Splash Screen',
    'AMX Orange Splash Screen',
    'Others',
  ],
  Control: [
    'Touch Panel Offline',
    'iPad Offline',
    'AMX Control not working',
    'Others',
  ],
  Audio: [
    'No Audio',
    'Distorted Audio',
    'Audio Delay',
    'Others',
  ],
  Connectivity: [
    'Device offline / unreachable',
    'Others',
  ],
};

export default function Home({session}) {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temperature: 'Loading...', forecast: 'Loading...' });
  const [amxOnline, setAmxOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Ticket form states
  const [issueCategory, setIssueCategory] = useState('');
  const [ticketIssue, setTicketIssue] = useState('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketLocation, setTicketLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [resolvedTime, setResolvedTime] = useState('');
  const [showTicketForm, setShowTicketForm] = useState(false);

  // Static ticket records
  const sampleTickets = Array.from({ length: 30 }, (_, i) => ({
    id: `TCK-${(i + 1).toString().padStart(3, '0')}`,
    category: ['Video', 'Control', 'Audio', 'Connectivity'][i % 4],
    issue: [
      'No Stream Signal',
      'Touch Panel Offline',
      'Distorted Audio',
      'Device offline / unreachable',
    ][i % 4],
    title: `Sample Ticket Title ${i + 1}`,
    location: `Room ${100 + i}`,
    startTime: `2025-05-28T08:${(i % 60).toString().padStart(2, '0')}`,
    resolvedTime: `2025-05-28T09:${(i % 60).toString().padStart(2, '0')}`,
    downtime: `${30 + (i % 15)} minutes`,
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalPages = Math.ceil(sampleTickets.length / recordsPerPage);
  const paginatedTickets = sampleTickets.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  
  const username = session?.user?.name || session?.user?.email || 'User';


  const handleLogout = () => {
      signOut({ callbackUrl: '/' });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://wttr.in/Quezon+City?format=%t+%C');
        const text = await res.text();
        const [temp, ...forecastParts] = text.split(' ');
        setWeather({ temperature: temp, forecast: forecastParts.join(' ') });
      } catch {
        setWeather({ temperature: 'N/A', forecast: 'Error' });
      }
    };
    fetchWeather();
  }, []);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setStatus('Submitting ticket...');

    const downtime = startTime && resolvedTime
      ? `${Math.round((new Date(resolvedTime) - new Date(startTime)) / (1000 * 60))} minutes`
      : 'N/A';

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: issueCategory,
          issue: ticketIssue,
          title: ticketTitle,
          location: ticketLocation,
          startTime,
          resolvedTime,
          downtime
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`✅ Ticket created: ${data.ticketId || 'ID unknown'}`);
        setIssueCategory('');
        setTicketIssue('');
        setTicketTitle('');
        setTicketLocation('');
        setStartTime('');
        setResolvedTime('');
        setShowTicketForm(false);
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setStatus(`❌ Network Error: ${err.message}`);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();

  return (
    <div className="min-h-screen bg-base-100 flex" data-theme="dark">
      <SidebarNavigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 p-6 md:p-10 overflow-x-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-primary">🖥️ Tickets</h1>
          <div className="flex flex-wrap gap-4 items-center text-sm font-mono text-base-content/70">
            {/* <button
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-md font-semibold ${
                amxOnline ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              } text-white`}
              onClick={() => setAmxOnline(!amxOnline)}
            >
              <span className={`w-3 h-3 rounded-full ${amxOnline ? 'bg-green-300' : 'bg-red-300'}`} />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.53 16.11a6.72 6.72 0 016.94 0M5.17 12.05a10.7 10.7 0 0113.66 0M2.4 7.99a15.68 15.68 0 0119.2 0" />
                <circle cx="12" cy="19" r="1" fill={amxOnline ? 'white' : 'gray'} />
              </svg>
              <span>{amxOnline ? 'Online' : 'Offline'}</span>
            </button>
            <div className="text-accent">
              <span className="font-semibold">Weather:</span> {weather.temperature} | {weather.forecast}
            </div> */}
            <div className="text-right">
              {/* <div>{formattedDate}</div>
              <div>{formattedTime}</div> */}
              <div className="text-sm text-base-content/70 mt-1 flex items-center gap-3">
                <span>Welcome, {username}</span>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline btn-error"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-6">
          <button onClick={() => setShowTicketForm((prev) => !prev)} className="btn btn-secondary">
            {showTicketForm ? 'Hide Ticket Form' : 'Create Support Ticket'}
          </button>
        </div>

        {showTicketForm && (
          <div className="max-w-3xl mx-auto bg-base-200 p-8 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-accent">Create Support Ticket</h2>
            <form onSubmit={handleSubmitTicket} className="space-y-6">

              <div className="form-control">
                <label className="label"><span className="label-text">Issue Category</span></label>
                <select
                  className="select select-bordered"
                  value={issueCategory}
                  onChange={(e) => {
                    setIssueCategory(e.target.value);
                    setTicketIssue('');
                  }}
                  required
                >
                  <option value="">Select a category</option>
                  {Object.keys(issueCategories).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Issue Type</span></label>
                <select
                  className="select select-bordered"
                  value={ticketIssue}
                  onChange={(e) => setTicketIssue(e.target.value)}
                  disabled={!issueCategory}
                  required
                >
                  <option value="">Select an issue</option>
                  {issueCategory &&
                    issueCategories[issueCategory].map((issue, i) => (
                      <option key={i} value={issue}>{issue}</option>
                    ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Title</span></label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Location</span></label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={ticketLocation}
                  onChange={(e) => setTicketLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Start Date & Time</span></label>
                <input
                  type="datetime-local"
                  className="input input-bordered"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Resolved Date & Time</span></label>
                <input
                  type="datetime-local"
                  className="input input-bordered"
                  value={resolvedTime}
                  onChange={(e) => setResolvedTime(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">Submit Ticket</button>

              {status && (
                <div className="alert alert-info mt-4 text-sm">
                  <span>{status}</span>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Static Ticket Table */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-accent">🎫 Ticket Records</h2>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="table w-full table-zebra">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Category</th>
                  <th>Issue</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Start Time</th>
                  <th>Resolved Time</th>
                  <th>Downtime</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.id}</td>
                    <td>{ticket.category}</td>
                    <td>{ticket.issue}</td>
                    <td>{ticket.title}</td>
                    <td>{ticket.location}</td>
                    <td>{new Date(ticket.startTime).toLocaleString()}</td>
                    <td>{new Date(ticket.resolvedTime).toLocaleString()}</td>
                    <td>{ticket.downtime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${currentPage === i + 1 ? 'btn-active btn-primary' : 'btn-ghost'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
