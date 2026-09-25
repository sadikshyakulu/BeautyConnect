import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('verification') // 'verification' | 'disputes' | 'analytics'
  const [approvedList, setApprovedList] = useState([])

  const handleApprove = (name) => {
    setApprovedList([...approvedList, name])
  }

  return (
    <div className="w-full min-h-screen bg-background text-on-surface">
      {/* Sub-Header Ribbon */}
      <section className="w-full bg-surface-bright/80 backdrop-blur-md border-b border-white/60 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container animate-pulse"></span>
            <span className="text-xs text-on-surface-variant font-medium">Platform Trust &amp; Integrity Console</span>
            <span className="text-outline-variant">•</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold tracking-wide">
              {6 - approvedList.length} ACTION ITEMS REQUIRING STEWARD AUDIT
            </span>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant text-xs">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>Escrow Reserves Secure ($182,410.00 Held)</span>
            <span>•</span>
            <span className="text-on-surface font-semibold">Jurisdiction: NY / CA / FL</span>
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 flex flex-col lg:flex-row gap-6">
        {/* Left Operations Rail */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm flex flex-col gap-1 border border-white/60">
            <div className="px-2 py-1 mb-1 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-outline font-semibold">Governance Rails</span>
              <span className="text-[11px] text-secondary font-medium">v2.4 Live</span>
            </div>

            <button
              onClick={() => setActiveTab('verification')}
              className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'verification' ? 'bg-surface-container-high text-primary' : 'hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">badge</span>
                Verification Queue
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px]">
                {4 - approvedList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('disputes')}
              className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'disputes' ? 'bg-surface-container-high text-primary' : 'hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">gavel</span>
                Dispute Resolution
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px]">2</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics' ? 'bg-surface-container-high text-primary' : 'hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">insights</span>
                Platform Analytics
              </span>
              <span className="material-symbols-outlined text-sm text-outline">arrow_forward</span>
            </button>

            <Link
              to="/search"
              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-container text-on-surface-variant text-xs font-semibold transition-all"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">groups</span>
                Artist Directory
              </span>
              <span className="text-[11px] text-outline">382 Pros</span>
            </Link>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-4 shadow-sm flex flex-col gap-2 border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary font-bold uppercase tracking-wider">System Status</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              License cross-checks SLA currently at <strong className="text-on-surface">99.2% compliance</strong>. All escrow rails active.
            </p>
          </div>
        </aside>

        {/* Center Operations Canvas */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Macro Executive KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total GMV (MTD)</span>
                <span className="p-1 rounded-lg bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-base">payments</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl text-on-surface font-semibold">$342,800</span>
                <span className="text-xs text-emerald-700 font-bold">+24.2%</span>
              </div>
              <span className="text-[11px] text-outline mt-0.5">Platform take-rate: 14.5%</span>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Verified Artists</span>
                <span className="p-1 rounded-lg bg-secondary-fixed text-on-secondary-fixed">
                  <span className="material-symbols-outlined text-base">workspace_premium</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl text-on-surface font-semibold">382 Pros</span>
                <span className="text-xs text-primary font-bold">+18 this wk</span>
              </div>
              <span className="text-[11px] text-outline mt-0.5">94% portfolio completion</span>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Active Client Base</span>
                <span className="p-1 rounded-lg bg-surface-container text-tertiary">
                  <span className="material-symbols-outlined text-base">person_check</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl text-on-surface font-semibold">14,250</span>
                <span className="text-xs text-emerald-700 font-bold">+8.1%</span>
              </div>
              <span className="text-[11px] text-outline mt-0.5">Repeat interval: 22 days</span>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Avg Trust Rating</span>
                <span className="p-1 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed">
                  <span className="material-symbols-outlined text-base">star</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl text-on-surface font-semibold">4.94</span>
                <span className="text-xs text-secondary font-bold">/ 5.00</span>
              </div>
              <span className="text-[11px] text-outline mt-0.5">Dispute index low: 0.08%</span>
            </div>
          </section>

          {/* Verification Queue Section */}
          {activeTab === 'verification' && (
            <section className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-headline text-xl text-on-surface font-semibold">Artist Credentialing &amp; Verification</h2>
                  <p className="text-xs text-on-surface-variant">Review state-issued credentials, liability binders, and bespoke portfolio submissions.</p>
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant">Sort: Oldest Pending First</span>
              </div>

              {/* Applicant 1: Camila Rossi */}
              <div className="bg-white/85 backdrop-blur-md border border-white/70 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCphxnpki2rET5U80jf7FQeTzD-sES2oriIP1EBAQ3ir_6VMdu1Y-yt0jKzGJTs5C4mFG-S7E3saMqHQ09S61aB7h3uB6tPpGIkKt_txepIOLzllsySssLxXIG6O1tq5sFCzJRQ1kWm60d39wY_00z1K4qRB2NA3q5lG6_NFETiWBNRfZcHfTo-3Qv72eck_6WGN96tAx2YheG_bvoPAnfebwVpsVjf36khXDdOT0NT8kHeeqjbT6PrPA"
                      alt="Camila Rossi"
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline text-lg text-on-surface font-semibold">Camila Rossi</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-secondary-fixed text-on-secondary-fixed font-semibold">Pending Review</span>
                        <span className="text-xs text-outline">Submitted 3h ago</span>
                      </div>
                      <span className="text-xs text-primary font-medium block mt-0.5">Licensed Master Esthetician &amp; Dermaplane Specialist</span>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap text-outline text-xs">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary">verified</span> NY Cosmetology #CO-89421-B</span>
                        <span>•</span>
                        <span>8 Yrs Professional Experience</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-low p-2 rounded-xl text-xs">
                    <span className="px-2 py-1 rounded bg-white text-emerald-800 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span> ID Cleared
                    </span>
                    <span className="px-2 py-1 rounded bg-white text-emerald-800 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-emerald-600">shield_with_heart</span> $2M Policy Active
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBQYlJvJjW6hFwhTuqzkWLC8KqNYSCoiqBOdL2MXBHy1MZkJpGN4-lj1LBOWYtMqYCEAYT36S8lbtnoGurIjbMoMF2-c5PMZ-PCESbOe1b_Pv-OVuYgp_-mCdhe9Vry-7Ii2eYA6wk3x6dB5xLDXIB2cDXehl85xcQ65nZgZu8sFTqwO_T7uEO5Amcy0yllhoF2TJ9SsRsIs1k_G1G4tB-D1vvfv3-bYRis5IbpuHfI1Ltc0gfPc3Cnw"
                      alt="License Scan"
                      className="w-20 h-14 object-cover rounded-lg shadow-sm"
                    />
                    <div>
                      <span className="text-xs text-on-surface font-semibold block">NY_State_License_Scan_Exp2027.pdf</span>
                      <span className="text-[11px] text-outline">Verified valid expiry: 11/2027 • Board confirmed</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJvLuy2NgCcBdD__NBhpSdg7BEK4x5rLOsA7m9DzlEL3vZ4zMGu0zSU0iMe7pUnvWrz1sTq4aHB1KfHM1wRvpJ08QprTfaiCLwxE1te47tdhoFDM2L7ut1mZoCVbp5K8HURLRB2E77jJOiJ-gDY8NuPIK88xIgsLBB2xm2GGWXrTCbf7zhm0JclSg_0K57OCGoRQ2Qvg7ZyFVm_-BTyChL-ZspyQ0Ne9B2EYhytJRkvxf3kFULa1HhAg" alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE0cTMOqSUc4hAysfCV_Um7BS1LrtBaO57up0pt_XdrKbQzBov7sFNGss2xX_YAMK-ZPnCRyouOjfk1G-blugXSrc7-GPvFGAH8bL9TjdXh1QX6o-a4bP5_L3HXpLp8VHqr354K_sxBWQfg3d5IaX4SL24z3r58fdExCoivNgfttnYv2EeXx9qWYZ15dfRFcIPSYtXBg5MLfKIqfkqxuMKJmMxa6SnBwlwXOGBXr4kcj1cWSk85uLJ0Q" alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4AnxiXWko7Wgob9m3eHvQR8J7y_nsClQT14Doy5j8eYw-jbCKYSxrHd6UEG6uojGuw1BAduXqVdCADzZWmMsPjAXi1werhzR9UsINeWfa9abWWZ1Kkp32uEGvxxV6j09xqGB3-ssip73csqh9L0_9ikHD8XKP0OxLMihBOSwvrytmp01G3ibITkzKlM6scXuK48CU4I0L0ArfsqzS8bMybhSn06sRfhfnV-wNe_jNq_8svPdfco4CtQ" alt="" className="w-12 h-12 rounded-lg object-cover" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <span className="text-xs text-outline">State verification: Automated Cross-Check 100% Match</span>
                  <div className="flex items-center gap-2 justify-end">
                    {approvedList.includes('Camila Rossi') ? (
                      <span className="px-4 py-2 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">verified</span> Approved &amp; Published
                      </span>
                    ) : (
                      <>
                        <button className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface cursor-pointer">
                          Request Docs
                        </button>
                        <button
                          onClick={() => handleApprove('Camila Rossi')}
                          className="px-4 py-2 rounded-full bg-primary hover:bg-on-primary-fixed-variant text-white text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">verified</span>
                          Approve &amp; Issue Verified Badge
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Applicant 2: Maya Lin */}
              <div className="bg-white/85 backdrop-blur-md border border-white/70 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiDQVgIRI3iSYvztULz2Z1QNxN1BxGAktUFTpJzT14SCQu0OcUDR9PrLKi-2qh6PgM-WZMUKK3IwWf9F4y1VCr-PNHTgbjgj4rLp_Bl3H8Ww9-DMU3i4lcNDWEy-Js16KhlCLOZx5PleQFBwAeYXOPyKdO3cZ7Ub5HHXGhsaSvRSFultVjZZOj4Ma90vwJgE8BcU4voek8JSMMtzVP83_EA2ERvMYJB96R8mVA2CbhvFZ08FSvAAtacw"
                      alt="Maya Lin"
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline text-lg text-on-surface font-semibold">Maya Lin</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-secondary-fixed text-on-secondary-fixed font-semibold">Pending Review</span>
                        <span className="text-xs text-outline">Submitted 5h ago</span>
                      </div>
                      <span className="text-xs text-primary font-medium block mt-0.5">Editorial &amp; Bridal Hair Architecture</span>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap text-outline text-xs">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary">verified</span> CA Board #289014</span>
                        <span>•</span>
                        <span>11 Yrs Experience</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-low p-2 rounded-xl text-xs">
                    <span className="px-2 py-1 rounded bg-white text-emerald-800 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span> ID Match
                    </span>
                    <span className="px-2 py-1 rounded bg-white text-emerald-800 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-emerald-600">shield_with_heart</span> Hiscox Current
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-outline">Automated State Board check: PASSED</span>
                  <div className="flex items-center gap-2">
                    {approvedList.includes('Maya Lin') ? (
                      <span className="px-4 py-2 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">verified</span> Approved &amp; Published
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApprove('Maya Lin')}
                        className="px-4 py-2 rounded-full bg-primary hover:bg-on-primary-fixed-variant text-white text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Approve &amp; Issue Badge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Dispute Resolution Section */}
          {activeTab === 'disputes' && (
            <section className="bg-white/85 backdrop-blur-md border border-white/70 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h2 className="font-headline text-xl text-on-surface font-semibold">Active Escrow Mediation &amp; Disputes (2)</h2>
              <p className="text-xs text-on-surface-variant">Stripe Escrow holds client funds until both parties agree or a platform steward renders a ruling.</p>
              <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-on-surface">Dispute #DS-1092: Booking Reschedule Conflict</span>
                  <span className="text-primary font-bold">$185.00 Escrow Held</span>
                </div>
                <p className="text-xs text-on-surface-variant">Client requested 24h cancellation refund due to emergency flight delay; artist offered 100% store credit.</p>
                <div className="flex justify-end gap-2 pt-2">
                  <button className="px-3 py-1.5 rounded-lg bg-white text-xs font-semibold text-on-surface border border-outline-variant/30">Release to Artist</button>
                  <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold">Issue Client Refund</button>
                </div>
              </div>
            </section>
          )}

          {/* Analytics Section */}
          {activeTab === 'analytics' && (
            <section className="bg-white/85 backdrop-blur-md border border-white/70 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h2 className="font-headline text-xl text-on-surface font-semibold">Platform Financial &amp; Operational Analytics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface-container-low">
                  <span className="text-xs text-on-surface-variant uppercase font-semibold">Escrow Velocity</span>
                  <p className="font-headline text-2xl text-on-surface font-semibold mt-1">2.4 Days</p>
                  <span className="text-[11px] text-outline">Average hold until client release</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low">
                  <span className="text-xs text-on-surface-variant uppercase font-semibold">License Pass Rate</span>
                  <p className="font-headline text-2xl text-on-surface font-semibold mt-1">14.2%</p>
                  <span className="text-[11px] text-outline">Stringent editorial gatekeeper</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low">
                  <span className="text-xs text-on-surface-variant uppercase font-semibold">Net Payouts Handled</span>
                  <p className="font-headline text-2xl text-primary font-semibold mt-1">$292,840</p>
                  <span className="text-[11px] text-outline">92% paid directly to artists</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
