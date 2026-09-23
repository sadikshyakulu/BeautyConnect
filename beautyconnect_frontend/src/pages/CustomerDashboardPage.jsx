import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CustomerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewArtist, setReviewArtist] = useState('Marcus Chen');
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittedReviewNotice, setSubmittedReviewNotice] = useState(false);

  const handleOpenReview = (artist) => {
    setReviewArtist(artist);
    setReviewModalOpen(true);
    setSubmittedReviewNotice(false);
  };

  const handlePublishReview = () => {
    setReviewModalOpen(false);
    setSubmittedReviewNotice(true);
    setTimeout(() => setSubmittedReviewNotice(false), 6000);
  };

  return (
    <div className="w-full flex-1 bg-background text-on-surface">
      {/* Profile & Metrics Banner */}
      <section className="relative w-full bg-surface-container-low px-4 sm:px-8 lg:px-12 py-10 overflow-hidden border-b border-outline-variant/30">
        {/* Ambient blush blur */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-24 w-80 h-80 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="p-6 lg:p-8 rounded-2xl bg-surface-bright/80 backdrop-blur-md ring-1 ring-outline-variant/30 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <img
                  alt="Elena Vance"
                  className="w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover shadow-md ring-2 ring-primary/20"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WLVRdVD3nCwEcs9Gw_OqGiMKAOYZLn32sfUjd2qU7m_lxFkO9eTTq7N40pfgYSIAYlwM5ooZAg8MsYG5pbd7X_YVMgbWRFTEbOvyVWogbQnEoO4O3ehgyjRxUQQtu-7hg-YVlHgb64GYCUoBUIC-sUsveWdpsCrOzj0kUV7Oy7a2W_p7WwFSB1LhGDKZBDvVBP6P4oJfBHgeb_f6lFEaU7f6OHc9YStCt52b4didvW1qEnOM_ifJSBNcuD"
                />
                <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] uppercase tracking-widest text-secondary font-semibold">Concierge Client</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-medium shadow-sm">
                    <span className="material-symbols-outlined text-[13px]">workspace_premium</span>
                    VIP Discerning Member since 2024
                  </span>
                </div>
                <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-on-surface">Welcome back, Elena</h1>
                <p className="text-sm text-on-surface-variant mt-1">Curating timeless beauty rituals with New York’s master editorial artisans.</p>
              </div>
            </div>

            {/* Quick Metrics Bento */}
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md ring-1 ring-outline-variant/30 shadow-sm min-w-[108px] text-center">
                <span className="font-serif text-2xl font-bold text-primary">1</span>
                <span className="text-xs text-on-surface-variant mt-0.5">Upcoming</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md ring-1 ring-outline-variant/30 shadow-sm min-w-[108px] text-center">
                <span className="font-serif text-2xl font-bold text-on-surface">6</span>
                <span className="text-xs text-on-surface-variant mt-0.5">Completed</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md ring-1 ring-outline-variant/30 shadow-sm min-w-[108px] text-center">
                <span className="font-serif text-2xl font-bold text-secondary">4</span>
                <span className="text-xs text-on-surface-variant mt-0.5">Saved Curations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Hub Navigation Bar */}
      <section className="w-full bg-surface-bright/90 backdrop-blur-md sticky top-20 z-30 shadow-sm border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-6 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center gap-2 text-sm font-semibold py-3 transition-all relative whitespace-nowrap ${
                activeTab === 'upcoming' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Upcoming Bookings</span>
              <span className="w-5 h-5 rounded-full bg-primary-container text-white text-xs flex items-center justify-center font-bold">1</span>
              {activeTab === 'upcoming' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary"></div>}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 text-sm font-semibold py-3 transition-all relative whitespace-nowrap ${
                activeTab === 'history' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Past Sessions & History</span>
              <span className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface text-xs flex items-center justify-center font-bold">5</span>
              {activeTab === 'history' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary"></div>}
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 text-sm font-semibold py-3 transition-all relative whitespace-nowrap ${
                activeTab === 'saved' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Saved Artists Lookbook</span>
              <span className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface text-xs flex items-center justify-center font-bold">4</span>
              {activeTab === 'saved' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary"></div>}
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-2 text-sm font-semibold py-3 transition-all relative whitespace-nowrap ${
                activeTab === 'preferences' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Beauty Preferences & Addresses</span>
              {activeTab === 'preferences' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary"></div>}
            </button>
          </div>
        </div>
      </section>

      {/* Feedback Toast */}
      {submittedReviewNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span className="text-sm font-medium">Thank you, Elena! Your verified review and rating have been posted to {reviewArtist}’s editorial portfolio.</span>
          </div>
        </div>
      )}

      {/* Main Dynamic Panels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 w-full flex flex-col gap-10">
        {/* PANEL 1: UPCOMING BOOKING (HERO TREATMENT) */}
        {activeTab === 'upcoming' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-primary font-semibold">Active Reservation</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-on-surface">Your Next In-Suite Experience</h2>
              </div>
              <div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full text-secondary text-xs font-semibold">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span>Escrow Protected & Guaranteed</span>
              </div>
            </div>

            {/* Feature Card */}
            <div className="bg-surface-bright/80 backdrop-blur-md ring-1 ring-outline-variant/30 rounded-2xl shadow-md p-6 lg:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none"></div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                {/* Left Column: Booking Core Data */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      Confirmed & Escrow Protected ($420.78)
                    </span>
                    <span className="text-xs text-on-surface-variant font-mono">Booking ID: #BC-8942-DMB</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-on-surface leading-tight">Deluxe Bridal Master Package</h3>
                    <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                      Full bespoke editorial makeup application with tailored skincare prep, contouring, lash accents, and styling veil trial.
                    </p>
                  </div>

                  {/* Date, Time & Location Bento Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-outline-variant/20">
                      <div className="p-2 rounded-lg bg-surface-container-lowest text-primary shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">calendar_clock</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Date & Schedule</span>
                        <span className="text-sm font-semibold text-on-surface mt-0.5">Saturday, Oct 18, 2025</span>
                        <span className="text-xs text-secondary font-medium mt-0.5">1:30 PM – 3:45 PM EDT (135 min)</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low/60 backdrop-blur-sm border border-outline-variant/20">
                      <div className="p-2 rounded-lg bg-surface-container-lowest text-secondary shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">home_pin</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Service Venue</span>
                        <span className="text-sm font-semibold text-on-surface mt-0.5">Travel to Me (Private Loft)</span>
                        <span className="text-xs text-on-surface-variant mt-0.5">85 Adams St, Penthouse 4B, DUMBO</span>
                      </div>
                    </div>
                  </div>

                  {/* Action & Management Triggers */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => alert('Calendar event (.ics) downloaded for Saturday, Oct 18, 2025.')}
                      className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-sm font-semibold hover:bg-on-primary-container transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                      <span>Add to Calendar</span>
                    </button>
                    <Link
                      to="/booking"
                      className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                      <span>Reschedule</span>
                    </Link>
                    <button
                      onClick={() => alert('BeautyConnect 100% Escrow Guarantee: Free cancellations are available up to 48 hours before session start.')}
                      className="px-4 py-2.5 rounded-full bg-transparent hover:bg-surface-container-low text-primary text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">info</span>
                      <span>Cancel Policy (100% Refund Active)</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Artist Bio Touchpoints */}
                <div className="lg:col-span-5 flex flex-col p-6 rounded-2xl bg-surface-bright/90 backdrop-blur-md ring-1 ring-outline-variant/30 shadow-sm gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-widest text-secondary font-semibold">Your Confirmed Artisan</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">stars</span>
                      Master Pro
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      className="w-16 h-16 rounded-full object-cover shadow-sm ring-1 ring-outline-variant/30"
                      alt="Aria Sterling portrait"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCatD0wFEPtrrafjR6R4etoR4Zhl531zDJY1rKjlInq7_EPLIAL6rrkUmoBXdNyxf06utHvcfv7u-QOBnpOmzjNF8XbshDY32mjPgS3FZIOH9HgKzM9KsPXBx0rZF8Hdyw4xfYhiAVpI1nm7lnKGIFOkws0Snc29Ar3Kp7OTerSFoMJA7MmuYF6euAgozBBYbqa7mTcFXDiBZXW7H_I6iY5A7LsPksJwsKK7itF9NohxnZP6Pv94hm1yQ"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Link to="/artist/aria-sterling" className="font-serif text-lg font-bold text-on-surface hover:text-primary transition-colors">
                          Aria Sterling
                        </Link>
                        <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">Editorial & Runway Makeup Master</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-tertiary text-[16px]">star</span>
                        <span className="text-xs text-on-surface font-bold">5.0</span>
                        <span className="text-[11px] text-on-surface-variant">(142 client reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant bg-surface-container-low/60 backdrop-blur-sm p-4 rounded-xl ring-1 ring-outline-variant/30 leading-relaxed italic">
                    "Elena, so excited to work together again for your celebratory gala! I’ve reviewed your moodboard notes and will bring custom cool-toned palettes."
                  </p>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={() => alert('Direct artist concierge chat initialized with Aria Sterling.')}
                      className="w-full py-2.5 rounded-full bg-surface-container-lowest text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-outline-variant/20"
                    >
                      <span className="material-symbols-outlined text-primary text-[18px]">chat</span>
                      <span>Message Aria Directly</span>
                    </button>
                    <button
                      onClick={() => alert('Session Prep: 1. Cleanse and hydrate skin 2 hours prior. 2. Avoid active retinol treatments 24h beforehand. 3. Wear a button-up garment.')}
                      className="w-full py-2.5 rounded-full bg-transparent hover:bg-surface-container text-on-surface-variant text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">checklist</span>
                      <span>View Session Prep Instructions (Hydration & Skin)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: PAST BOOKINGS & INTERACTIVE REVIEW TRIGGERS */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-secondary font-semibold">Treatment Archive</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-on-surface">Past Sessions & Reviews</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant">Filter by:</span>
                <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface text-xs font-semibold">All Completed</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Past Item 1: Pending Review (Marcus Chen) */}
              <div className="p-6 rounded-2xl bg-surface-bright/80 backdrop-blur-md ring-1 ring-outline-variant/30 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img
                    className="w-20 h-20 rounded-xl object-cover shadow-sm shrink-0"
                    alt="Chic editorial close-up"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7YlSgXsWhIpR2EjRrS1e7qS7vNFXrQCC_EXpvAhtQdUabctG0odY_sSPvECdA2J4tl-dx1SL9cJlOJVMKr-wc1etsS9nhNhg1Vy-LfRFF9l1fleKZ7h_w7El5EbxtaxBkjruJihQmkO08pkb0IgYx6ZulWD3_Mwc_tx5fhUpEzcie3Ezqp5gs47cQtNGF0JYi7fN7qrDxQptNZVcCk8Bou1lwmr2MUPEV4LBZYtMcjgweZKTWfyD72g"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary text-[11px] font-semibold">Completed Sep 24, 2025</span>
                      <span className="text-xs text-on-surface-variant">Tribeca Atelier</span>
                    </div>
                    <h4 className="font-serif text-lg font-semibold text-on-surface mt-1">Couture Hair Styling & Architectural Chignon</h4>
                    <p className="text-xs text-on-surface-variant">Artist: <span className="text-on-surface font-semibold">Marcus Chen</span> · $260.00 Paid</p>
                  </div>
                </div>

                {/* Review Callout Action */}
                <div className="w-full lg:w-auto p-4 rounded-xl bg-surface-container-low/60 backdrop-blur-sm ring-1 ring-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Share your experience</span>
                    <div className="flex items-center gap-1 text-tertiary mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => {
                            setSelectedRating(star);
                            handleOpenReview('Marcus Chen');
                          }}
                          className="hover:scale-125 transition-transform cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">star</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenReview('Marcus Chen')}
                    className="w-full sm:w-auto px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-on-primary-container transition-colors shadow-sm shrink-0 cursor-pointer"
                  >
                    Leave a Review & Look
                  </button>
                </div>
              </div>

              {/* Past Item 2: Reviewed (Sora Kim) */}
              <div className="p-6 rounded-2xl bg-surface-bright/80 backdrop-blur-md ring-1 ring-outline-variant/30 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img
                    className="w-20 h-20 rounded-xl object-cover shadow-sm shrink-0"
                    alt="Japanese ceramic gel nail art"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPPNcxe0VtY54uP-E8uzV_kOYfCjucdQ136RgamqIg0bzbQ8Ij7wMemouCyiL_r3tHk1mm5eUH6Ba0fUr4sq-sAlTBg4UxR2ir5Dy0aTRB8yTWxKCaOyHj5Rfg4S1dCxtNdC-fuTWS36roaoPxxfwJQhb3KzSAOHNCAQ85pQw7Afww4pkv-z4F4mT2rbLN_c5CLkT2h8XW_qBcMVZJGuXUyDpYA0mJZC9uKdIbddJE4m5_sA23k8dzvg"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">Completed Aug 12, 2025</span>
                      <span className="flex items-center gap-1 text-tertiary text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        5.0 Reviewed
                      </span>
                    </div>
                    <h4 className="font-serif text-lg font-semibold text-on-surface mt-1">Minimalist Japanese Gel Overlay & Precision Cuticles</h4>
                    <p className="text-xs text-on-surface-variant">Artist: <span className="text-on-surface font-semibold">Sora Kim</span> · $145.00 Paid</p>
                    <div className="mt-2 text-on-surface-variant text-xs italic bg-surface-container-low/60 backdrop-blur-sm ring-1 ring-outline-variant/30 p-2.5 rounded-lg max-w-xl">
                      "Flawless attention to detail, lasted 4 weeks without lifting! Sora is truly the quiet master of manicure craft."
                    </div>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 w-full lg:w-auto justify-end">
                  <Link
                    to="/search"
                    className="px-5 py-2 rounded-full bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    Re-book with Sora
                  </Link>
                  <button
                    onClick={() => alert('BeautyConnect Receipt #INV-8821 downloaded ($145.00).')}
                    className="text-xs text-primary hover:underline px-2 py-1 cursor-pointer"
                  >
                    View Invoice PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: SAVED ARTISTS LOOKBOOK GRID */}
        {activeTab === 'saved' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-primary font-semibold">Curated Roster</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-on-surface">Saved Artisans & Studios (4)</h2>
              </div>
              <p className="text-xs text-on-surface-variant">Quick-access lookbook bookmarks for ongoing editorial rituals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Aria Sterling */}
              <div className="flex flex-col bg-surface-bright/80 backdrop-blur-md ring-1 ring-outline-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="Aria Sterling editorial work"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNSlU8JGrOENG0VdoOK9afIShfymi50UlYqIPc-CEbLrroPL9MuRmllaaRuNX1J47iBlelnCudJq7rseoZMu3NQ5JfMuWBlV591MGBrcisj8SLAwwo2C8MUPx2UTGIbtBYeuXYNoVLr9YiWxpNlxoaRBqKFPKYMOpGwHYr-7pWmwbYE46TIsNvK0GRw0wmjGm8Jv5JaQ1kgowPb1eNGOtiJ0cq1dnx1ZitXbGnMGHssBOMYACbSIGJJw"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/80 backdrop-blur-md flex items-center justify-center text-primary shadow-sm cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </button>
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-surface-bright/90 backdrop-blur-md text-[11px] text-on-surface font-semibold">Bridal & Gala</span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-base font-bold text-on-surface">Aria Sterling</h4>
                      <div className="flex items-center gap-0.5 text-tertiary">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span className="text-xs font-bold">5.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">DUMBO & Manhattan Travel</p>
                    <div className="mt-2 text-on-surface text-sm font-semibold">
                      From $280 <span className="text-xs font-normal text-on-surface-variant">/ session</span>
                    </div>
                  </div>
                  <Link
                    to="/artist/aria-sterling"
                    className="w-full py-2.5 rounded-full bg-surface-container text-on-surface text-xs font-semibold hover:bg-primary hover:text-on-primary transition-colors text-center"
                  >
                    Book Next Session
                  </Link>
                </div>
              </div>

              {/* Card 2: Marcus Chen */}
              <div className="flex flex-col bg-surface-bright/80 backdrop-blur-md ring-1 ring-outline-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="Marcus Chen hair sculpting"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXXv68A-2WoZxspjiEP8f5cLOGiXXDezqGDpIdOvpJMSHgi14T9TDMqZqpxlKfZLpDnCIVORyHiixHiWakL0c4yNqfprXJ0vvOarJPZHqEUSwzPRXjpjUxAToq6OHOqX5u-6vrkKlSJyMMYK-R5JamZkLdK7K3N6Mxh2KzIVEhx2dzNp2kqDq4MZhwIZWLwR6TXOf8-9bMoZzbcrPnzAR2XYbUGsqH6DHj0X2e9YlXBG_sHPbvuXZ1ew"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/80 backdrop-blur-md flex items-center justify-center text-primary shadow-sm cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </button>
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-surface-bright/90 backdrop-blur-md text-[11px] text-on-surface font-semibold">Editorial Hair</span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-base font-bold text-on-surface">Marcus Chen</h4>
                      <div className="flex items-center gap-0.5 text-tertiary">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span className="text-xs font-bold">4.9</span>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">Tribeca Private Atelier</p>
                    <div className="mt-2 text-on-surface text-sm font-semibold">
                      From $220 <span className="text-xs font-normal text-on-surface-variant">/ cut & style</span>
                    </div>
                  </div>
                  <Link
                    to="/search"
                    className="w-full py-2.5 rounded-full bg-surface-container text-on-surface text-xs font-semibold hover:bg-primary hover:text-on-primary transition-colors text-center"
                  >
                    Book Next Session
                  </Link>
                </div>
              </div>

              {/* Card 3: Sora Kim */}
              <div className="flex flex-col bg-surface-bright/80 backdrop-blur-md ring-1 ring-outline-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="Sora Kim ceramic gel nails"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7eJYxRkTDTzYMQlU7qnrDPJrNaU4lX3OXSpYxrSXpz9pnQrRh2n9zo-yHmlpxA1yn5mfeuGNKlD0j3lzl4Ygnqm6lQ-jIsjz8-AfhuupWg8ZaxDZSKM5Co1R7coHqINczs98qgaUb5rtKh8RGwMTGo06mac1lanpFOuasS2RIVUP3lFha47o2yNA5r6uBxPY14WO-YS-B7JY4ybXXZSM6CdjJ5-j0UXLgQokoLB4tXWP0XbCPfi34Kg"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/80 backdrop-blur-md flex items-center justify-center text-primary shadow-sm cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </button>
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-surface-bright/90 backdrop-blur-md text-[11px] text-on-surface font-semibold">Precision Nail Art</span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-base font-bold text-on-surface">Sora Kim</h4>
                      <div className="flex items-center gap-0.5 text-tertiary">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span className="text-xs font-bold">5.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">SoHo Studio Suites</p>
                    <div className="mt-2 text-on-surface text-sm font-semibold">
                      From $130 <span className="text-xs font-normal text-on-surface-variant">/ gel session</span>
                    </div>
                  </div>
                  <Link
                    to="/search"
                    className="w-full py-2.5 rounded-full bg-surface-container text-on-surface text-xs font-semibold hover:bg-primary hover:text-on-primary transition-colors text-center"
                  >
                    Book Next Session
                  </Link>
                </div>
              </div>

              {/* Card 4: Camila Rossi */}
              <div className="flex flex-col bg-surface-bright/80 backdrop-blur-md ring-1 ring-outline-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="Camila Rossi brows and lashes"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3cfBBhfNvdL8yEOHQSQ35SvAwi2e4PZAfLdhIiCwaOb3bDEplBiEiTqYk9VpMmgJ4m81-jgz9l1xCfg0DyeSuduvXeiDebRNolPiy6y5EhcsL918PRzWfVG1SL6IPiaglBCjtIjDzZuXQ9GC_9LyuuNk53h-2tH_oa9n6npHeB-znA17RgWaqaUWgUUHkwMbXSmaCKMkJ01OWd_2tu1iGJwnVkoCWSc_H6_Sq95d1_Br8Ny-EwNtcXg"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/80 backdrop-blur-md flex items-center justify-center text-primary shadow-sm cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </button>
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-surface-bright/90 backdrop-blur-md text-[11px] text-on-surface font-semibold">Lash & Brow Arch</span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-base font-bold text-on-surface">Camila Rossi</h4>
                      <div className="flex items-center gap-0.5 text-tertiary">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span className="text-xs font-bold">4.95</span>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">West Village Private Suite</p>
                    <div className="mt-2 text-on-surface text-sm font-semibold">
                      From $110 <span className="text-xs font-normal text-on-surface-variant">/ lamination</span>
                    </div>
                  </div>
                  <Link
                    to="/search"
                    className="w-full py-2.5 rounded-full bg-surface-container text-on-surface text-xs font-semibold hover:bg-primary hover:text-on-primary transition-colors text-center"
                  >
                    Book Next Session
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: BEAUTY PREFERENCES & ADDRESSES */}
        {activeTab === 'preferences' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-primary font-semibold">Personalized Dossier</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-on-surface">Beauty Profile & Venues</h2>
              </div>
              <button
                onClick={() => alert('Personalized beauty dossier and travel venues updated successfully.')}
                className="px-6 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-on-primary-container transition-colors shadow-sm cursor-pointer"
              >
                Save Profile Updates
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skin & Allergy Profile */}
              <div className="p-6 rounded-2xl bg-surface-bright/80 backdrop-blur-md ring-1 ring-outline-variant/30 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">spa</span>
                  <h3 className="font-serif text-lg font-semibold text-on-surface">Skin & Hair Diagnostics</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-on-surface">Skin Type & Sensitivities</label>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-surface-container-low/60 backdrop-blur-sm ring-1 ring-outline-variant/30 text-on-surface text-xs">
                      Combination / Sensitive
                    </span>
                    <span className="px-3 py-1 rounded-full bg-surface-container-low/60 backdrop-blur-sm ring-1 ring-outline-variant/30 text-on-surface text-xs">
                      Fragrance-Free Only
                    </span>
                    <span className="px-3 py-1 rounded-full bg-surface-container-low/60 backdrop-blur-sm ring-1 ring-outline-variant/30 text-on-surface text-xs">
                      Cruelty-Free Formulations
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Custom Notes for Artists</label>
                  <p className="text-xs text-on-surface-variant p-4 rounded-xl bg-surface-container-low/60 backdrop-blur-sm ring-1 ring-outline-variant/30 leading-relaxed italic">
                    "Prefer clean/mineral formulations for base makeup. Tend to dehydrate easily under heavy powders; dewy finishes always preferred."
                  </p>
                </div>
              </div>

              {/* Saved Travel Addresses */}
              <div className="p-6 rounded-2xl bg-surface-bright/80 backdrop-blur-md ring-1 ring-outline-variant/30 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">apartment</span>
                  <h3 className="font-serif text-lg font-semibold text-on-surface">Saved Destination Addresses</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {/* Address 1 */}
                  <div className="p-4 rounded-xl bg-surface-container-low/60 backdrop-blur-sm ring-1 ring-outline-variant/30 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5">home</span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-on-surface">DUMBO Loft (Primary)</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary-container/30 text-on-primary-container text-[10px] font-bold">Default</span>
                        </div>
                        <span className="text-xs text-on-surface-variant mt-0.5">85 Adams St, PH 4B, Brooklyn, NY 11201</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Edit address modal opening for DUMBO Loft.')}
                      className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>

                  {/* Address 2 */}
                  <div className="p-4 rounded-xl bg-surface-container-low/60 backdrop-blur-sm ring-1 ring-outline-variant/30 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary mt-0.5">work</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-on-surface">Editorial Studio</span>
                        <span className="text-xs text-on-surface-variant mt-0.5">540 W 26th St, Fl 5, Chelsea, NY 10001</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Edit address modal opening for Editorial Studio.')}
                      className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal Simulation */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl p-6 lg:p-8 shadow-2xl flex flex-col gap-4 relative animate-scaleUp">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>

            <div>
              <span className="text-[11px] uppercase tracking-widest text-secondary font-semibold">Verified Review</span>
              <h3 className="font-serif text-2xl font-semibold text-on-surface mt-1">Review Session with {reviewArtist}</h3>
              <p className="text-xs text-on-surface-variant mt-1">Your authentic feedback helps uphold our community's high editorial standards.</p>
            </div>

            <div className="flex flex-col gap-1 py-1">
              <span className="text-xs font-semibold text-on-surface">Overall Craft & Technique</span>
              <div className="flex items-center gap-1 text-tertiary text-[26px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className="hover:scale-125 transition-transform cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[26px]">
                      {star <= selectedRating ? 'star' : 'star_border'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Your Thoughts</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface text-xs placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                placeholder={`How did ${reviewArtist} bring your desired look to life? Detail the styling longevity and experience...`}
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-5 py-2 rounded-full text-on-surface-variant text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishReview}
                className="px-6 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-on-primary-container transition-colors shadow-sm cursor-pointer"
              >
                Publish Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboardPage;
