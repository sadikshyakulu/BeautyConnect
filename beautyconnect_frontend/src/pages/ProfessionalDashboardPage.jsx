import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ProfessionalDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'requests' | 'calendar' | 'lookbook'
  const [vacationMode, setVacationMode] = useState(false)
  const [acceptedRequests, setAcceptedRequests] = useState([])

  const handleAccept = (clientName) => {
    setAcceptedRequests([...acceptedRequests, clientName])
  }

  return (
    <div className="w-full flex-1 bg-background text-on-surface">
      {/* Top Banner / Pro Profile Header */}
      <div className="relative w-full overflow-hidden bg-surface-container-low pb-10 border-b border-white/60">
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-primary-fixed/40 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-secondary-fixed/30 blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 lg:px-12 pt-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover shadow-md"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHNCoHMBjoJT1fSQf3kW8W-LmhHOo5t_4pe79a6LqE2Vlz764pt-V_8ZE5I3Wme6kpfVQ2j27cY4GLOHv71jPgnhtN_UDzZBqp8z2R6bXYFZ3h8rBx0NgYSbLMFfjlD2cATPnyvK6r4vxwCYNwFJpGL2i5241elbEiSnqNOtb97nrfVp-bGS6JnG2U-cGdD0Jxf7hV7YwqDwl464mdRlNmdXmTepnmoWHQ7aGETCAz1OGDBGFmlz4ULA"
                  alt="Aria Sterling Studio"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-headline text-2xl text-on-surface font-semibold">Aria Sterling Studio</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs uppercase tracking-wider flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">workspace_premium</span>
                    Master Resident Pro
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">SoHo Flagship Suite &amp; Travel Atelier • New York, NY</p>
                <div className="flex items-center gap-4 mt-2 text-on-surface-variant text-xs">
                  <span className="flex items-center gap-1 text-tertiary">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <strong className="text-on-surface">4.98</strong> (142 reviews)
                  </span>
                  <span>•</span>
                  <span className="text-secondary font-medium">99.2% Acceptance Rate</span>
                  <span>•</span>
                  <span className="text-primary font-medium">SuperPro 2025</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link to="/artist/aria-sterling" className="px-4 py-2 rounded-full bg-white text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors shadow-sm flex items-center gap-1.5 border border-outline-variant/30">
                <span className="material-symbols-outlined text-base">visibility</span>
                <span>View Public Profile</span>
              </Link>
              <button className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Quick Create Slot</span>
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="mt-8 flex items-center gap-1 overflow-x-auto pb-1 bg-white/80 backdrop-blur-md border border-white/60 rounded-full p-1.5 shadow-sm">
            {[
              { id: 'overview', label: 'Overview & Analytics', icon: 'analytics' },
              { id: 'requests', label: 'Incoming Requests', icon: 'mark_email_unread', badge: '3' },
              { id: 'calendar', label: 'Availability & Calendar', icon: 'calendar_month' },
              { id: 'lookbook', label: 'Lookbook & Services Editor', icon: 'photo_library' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-primary-container text-white text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 lg:px-12 -mt-4 w-full space-y-8 pb-20">
        {/* KPI Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Gross Earnings</span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">payments</span>
              </div>
            </div>
            <div className="my-3">
              <div className="font-headline text-3xl text-on-surface font-semibold tracking-tight">$8,420.00</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-secondary font-medium">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+18.4% vs last month</span>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between text-on-surface-variant text-[11px]">
              <span>Target: $10,000.00</span>
              <span>84.2%</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full mt-1 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '84.2%' }}></div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Completed Sessions</span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-lg">event_available</span>
              </div>
            </div>
            <div className="my-3">
              <div className="font-headline text-3xl text-on-surface font-semibold tracking-tight">28 <span className="text-sm font-normal text-on-surface-variant">clients</span></div>
              <div className="flex items-center gap-1 mt-1 text-xs text-secondary font-medium">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>100% 5-star verified reviews</span>
              </div>
            </div>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-on-surface-variant">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
              <span>16 Bridal • 12 Red Carpet/Editorial</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Platform Fee (10%)</span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">handshake</span>
              </div>
            </div>
            <div className="my-3">
              <div className="font-headline text-3xl text-on-surface font-semibold tracking-tight">$842.00</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">shield</span>
                <span>Fair Flat Fee • No Hidden Ad Cuts</span>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs text-secondary font-medium">
              <span>Escrow Concierge Protection</span>
              <span className="material-symbols-outlined text-xs">info</span>
            </div>
          </div>

          <div className="bg-surface-container-high border border-white/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-on-surface font-semibold">Net Payout Scheduled</span>
              <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">account_balance</span>
              </div>
            </div>
            <div className="my-3">
              <div className="font-headline text-3xl text-primary font-semibold tracking-tight">$7,578.00</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-on-surface font-medium">
                <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                <span>Stripe Direct deposit pending</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 text-on-surface flex items-center justify-between text-xs">
              <span>Arriving: <strong>Tue, Oct 21</strong></span>
              <button className="text-primary font-semibold cursor-pointer">Manage Bank</button>
            </div>
          </div>
        </section>

        {/* Revenue Chart & Studio Controls */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Artisanal Revenue Growth</span>
                <h2 className="font-headline text-xl text-on-surface font-semibold mt-1">Revenue Trajectory (Past 6 Months)</h2>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full text-on-surface-variant text-xs">
                <button className="px-3 py-1 rounded-full bg-white text-on-surface font-semibold shadow-xs">Monthly</button>
                <button className="px-3 py-1 rounded-full hover:text-on-surface">Quarterly</button>
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="mt-6 w-full">
              <div className="h-60 w-full flex items-end justify-between gap-3 px-2 pt-6">
                {[
                  { month: 'May', height: '50%', value: '$4.2k' },
                  { month: 'Jun', height: '60%', value: '$5.1k' },
                  { month: 'Jul', height: '72%', value: '$6.4k' },
                  { month: 'Aug', height: '78%', value: '$6.9k' },
                  { month: 'Sep', height: '82%', value: '$7.1k' },
                  { month: 'Oct', height: '96%', value: '$8.4k', current: true }
                ].map(bar => (
                  <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className={`text-[10px] ${bar.current ? 'font-bold text-primary opacity-100' : 'text-on-surface-variant opacity-0 group-hover:opacity-100'} transition-opacity`}>
                      {bar.value}
                    </span>
                    <div
                      className={`w-full max-w-[48px] rounded-t-lg transition-all ${
                        bar.current ? 'bg-primary shadow-sm' : 'bg-surface-container-high group-hover:bg-primary-container'
                      }`}
                      style={{ height: bar.height }}
                    ></div>
                    <span className={`text-xs ${bar.current ? 'font-semibold text-primary' : 'text-on-surface-variant'}`}>{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 bg-surface-container-low/50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs border border-outline-variant/20">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-on-surface">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  Bridal &amp; Wedding Parties (62%)
                </span>
                <span className="flex items-center gap-1.5 text-on-surface">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  Red Carpet &amp; Fashion (38%)
                </span>
              </div>
              <span className="text-on-surface-variant font-medium">Average booking value: <strong>$300.71</strong></span>
            </div>
          </div>

          {/* Studio Controls */}
          <div className="bg-white/80 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Live Operational Status</span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  Accepting Bookings
                </span>
              </div>
              <h3 className="font-headline text-lg text-on-surface font-semibold">Studio Controls</h3>

              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    <div>
                      <div className="text-xs text-on-surface font-semibold">Standard Working Hours</div>
                      <div className="text-[11px] text-on-surface-variant">9:00 AM – 7:00 PM EST</div>
                    </div>
                  </div>
                  <button className="text-primary text-xs font-semibold hover:underline cursor-pointer">Edit</button>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">explore</span>
                    <div>
                      <div className="text-xs text-on-surface font-semibold">Travel Radius</div>
                      <div className="text-[11px] text-on-surface-variant">Up to 25 miles from SoHo, NYC</div>
                    </div>
                  </div>
                  <button className="text-primary text-xs font-semibold hover:underline cursor-pointer">Edit</button>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-tertiary">lock_clock</span>
                    <div>
                      <div className="text-xs text-on-surface font-semibold">Sanitation Buffer</div>
                      <div className="text-[11px] text-on-surface-variant">30 minutes between clients</div>
                    </div>
                  </div>
                  <button className="text-primary text-xs font-semibold hover:underline cursor-pointer">Edit</button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 bg-surface-container p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface text-xs font-medium">
                <span className="material-symbols-outlined text-secondary text-base">beach_access</span>
                <span>Vacation Mode</span>
              </div>
              <input
                type="checkbox"
                checked={vacationMode}
                onChange={e => setVacationMode(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Priority Incoming Requests Section */}
        <section className="bg-white/80 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Priority Booking Requests</span>
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              </div>
              <h2 className="font-headline text-2xl text-on-surface font-semibold mt-1">Pending Approval ({3 - acceptedRequests.length})</h2>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-base">timer</span>
              <span>Auto-expires after 24 hours of client submission</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Clara Vance',
                tag: 'New Client • Wedding Season',
                urgent: 'Urgent: 14h Left',
                service: 'Deluxe Bridal Master Package',
                price: '$295.00',
                duration: '120 mins duration',
                payout: 'Payout: $265.50',
                date: 'Saturday, Nov 08 • 10:30 AM',
                location: 'On-Location: The Liberty Warehouse, DUMBO',
                notes: 'Looking for a dewy bridal aesthetic with romantic textured updo. Sensitive combination skin.',
                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtCGsWEdtC4Aun1ZItRRrvKZbH45gurBkxmtF5PGQZ_dujRILGZbt0_DMXwgUNUmY704UnAxL9QZrho_Fc0IOrWrxH3H22c6foy2K6SzlXhyGldo-Lf5LB0Zc-ZTsVjrGrvyG517RcAcd4uaZuyWmvPkor3TUTwcloWaKcGUhAAc3qoMHBeGzeYDX-eNspODYDdgM4mUTKMIzNQppDMhEOkIMJ-90h_KlmGK0A4pFjuhUi3Q_eCXce6Q'
              },
              {
                name: 'Marcus Zhao',
                tag: 'Returning Client (3 bookings)',
                urgent: null,
                service: 'Signature Soft Glam & Contouring',
                price: '$185.00',
                duration: '75 mins duration',
                payout: 'Payout: $166.50',
                date: 'Thursday, Nov 13 • 4:00 PM',
                location: 'In-Studio: SoHo Flagship Suite 4B',
                notes: 'Pre-gala look for Art Basel preview dinner. Warm bronze palette requested.',
                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXs5KRcP6rFglVsHU_NcXJHd7PKS_xOYEQrIZgOc0EhOfp1UE0y3ES1BVqYnxuT5bTs9GUmX22EbVCFH5m8_ZXpS75hAOTF63uC26GCkX19YI3Z1V2Su80cxZBbELylbQ65oW_Id7JLEvlZkv3OfKgFQbmBAQq59X78bT3c8fgLdhpZa7pNII-J6SbydHZ-RUfONOUfK_xMyHsIbquiQ-B-foVoLfqrIZ_NeagjrZfX1K5QyJH0DTslg'
              },
              {
                name: 'Vivienne Moreau',
                tag: 'Vogue Editorial Referral',
                urgent: null,
                service: 'Editorial Runway & Editorial Session',
                price: '$340.00',
                duration: '150 mins duration',
                payout: 'Payout: $306.00',
                date: 'Friday, Nov 14 • 1:00 PM',
                location: 'Travel: Spring Studios, Tribeca',
                notes: 'Editorial moodboard attached via profile. High-gloss lids and glass skin concept.',
                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2Pefp85kBDoFNfs9j-DqbZDWtnT_wnr4pQoqRw226uVeqlkl8JiNOT3uogr9BfSAz-HffjHkSa5BkGUoAlnFVRlu0tYJBbWT5b25MCvj7PTL_bPlSDn0HhSqFB24q-5fnEis3_EQmyQmJ69TJc6xRdoM9ocT3LPC4IoxBhU1nMiboaDb8irXb1qfTPwD3XkwV2a-65jTdDYCxvFBSJrS3X-yugY4ATzG-ucOR4DqnEmqNSR10kW8kcQ'
              }
            ].map(req => {
              const isAccepted = acceptedRequests.includes(req.name)
              return (
                <div key={req.name} className="bg-surface-container-low p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-outline-variant/30">
                  {req.urgent && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-white text-[11px] rounded-bl-xl font-semibold">
                      {req.urgent}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <img className="w-12 h-12 rounded-full object-cover shadow-xs" src={req.avatar} alt={req.name} />
                      <div>
                        <h4 className="text-base text-on-surface font-semibold">{req.name}</h4>
                        <span className="text-xs text-secondary font-medium">{req.tag}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white mb-3 border border-outline-variant/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-on-surface">{req.service}</span>
                        <span className="font-bold text-primary">{req.price}</span>
                      </div>
                      <div className="text-on-surface-variant text-[11px] mt-1 flex items-center gap-2">
                        <span>{req.duration}</span>
                        <span>•</span>
                        <span className="text-on-surface font-medium">{req.payout}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-primary">calendar_today</span>
                        <span className="text-on-surface font-medium">{req.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-primary">location_on</span>
                        <span>{req.location}</span>
                      </div>
                      <div className="p-2.5 bg-white/60 rounded-lg text-on-surface text-xs italic mt-2 border border-outline-variant/20">
                        "{req.notes}"
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 flex items-center gap-2">
                    {isAccepted ? (
                      <span className="w-full py-2.5 px-4 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold text-center flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        Confirmed &amp; Added to Calendar
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAccept(req.name)}
                          className="flex-1 py-2.5 px-4 rounded-full bg-primary text-white hover:bg-on-primary-fixed-variant text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                        >
                          Accept Booking
                        </button>
                        <button className="py-2.5 px-4 rounded-full bg-white hover:bg-surface-container text-on-surface text-xs font-semibold transition-colors border border-outline-variant/30 cursor-pointer">
                          Propose Time
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
