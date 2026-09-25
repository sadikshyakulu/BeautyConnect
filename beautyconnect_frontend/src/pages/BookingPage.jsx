import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './BookingPage.css'

export default function BookingPage() {
  const navigate = useNavigate()
  const [locationChoice, setLocationChoice] = useState('travel') // 'travel' | 'studio'
  const [confirmed, setConfirmed] = useState(false)

  const basePrice = 295.00
  const airbrushUpgrade = 45.00
  const travelFee = locationChoice === 'travel' ? 35.00 : 0.00
  const subtotal = basePrice + airbrushUpgrade + travelFee
  const tax = Number((subtotal * 0.08875).toFixed(2))
  const platformProtection = 12.50
  const total = Number((subtotal + tax + platformProtection).toFixed(2))

  if (confirmed) {
    return (
      <div className="booking-page-container flex-1">
        <div className="max-w-2xl mx-auto px-6 text-center py-16 booking-card">
          <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto mb-4 ring-8 ring-primary-fixed/30">
            <span className="material-symbols-outlined text-3xl">verified</span>
          </div>
          <h1 className="font-headline text-3xl text-on-surface font-semibold mb-2">Booking Request Confirmed!</h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed">
            Your appointment with <strong className="text-on-surface font-bold">Aria Sterling</strong> for Saturday, Oct 18, 2025 at 1:30 PM EDT has been submitted. Your payment of <strong className="text-primary font-bold">${total}</strong> is secured in escrow.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/dashboard/customer" className="px-6 py-3 rounded-full bg-primary text-white text-xs font-bold shadow-md hover:bg-on-primary-fixed-variant transition-all">
              View in Customer Dashboard
            </Link>
            <Link to="/" className="px-6 py-3 rounded-full bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-all">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-page-container">
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-12">
        {/* Stepper Navigation */}
        <nav aria-label="Checkout Progress" className="booking-stepper">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-10 right-10 h-[2px] bg-surface-container -z-0"></div>
            <div className="absolute top-5 left-10 w-1/2 h-[2px] bg-primary -z-0 transition-all duration-500"></div>

            {/* Step 1: Completed */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md ring-4 ring-background">
                <span className="material-symbols-outlined text-[20px]">check</span>
              </div>
              <span className="text-xs text-on-surface font-semibold">Service &amp; Time</span>
              <span className="text-[11px] text-secondary font-bold">Oct 18, 1:30 PM</span>
            </div>

            {/* Step 2: Active */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-white text-primary shadow-md flex items-center justify-center ring-4 ring-primary/20 border-2 border-primary">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <span className="text-xs text-primary font-bold">Details &amp; Location</span>
              <span className="text-[11px] text-primary font-semibold">In Progress</span>
            </div>

            {/* Step 3: Upcoming */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 opacity-60">
              <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center ring-4 ring-background">
                <span className="material-symbols-outlined text-[20px]">credit_card</span>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Payment &amp; Final</span>
              <span className="text-[11px] text-on-surface-variant">Instant Confirmation</span>
            </div>
          </div>
        </nav>

        {/* Main Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Booking Configuration (7/12 cols) */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            {/* Service Highlight Summary Card */}
            <div className="booking-card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-primary-fixed"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_hzUaVMPElYuw3PL5fs6kvsVFfCaW8lGxoAPdFjFe6l4fqFzLsUoewY_vMTa2wmH_ixYva24zfQ8h0XbCusl363PFn6wCzybd1UXNGY1tnqEZLye0j92GmABeXV2CZXxk8rR2LjSGxU0p2v9GDZQye1PuaePr02Hl5AbRTywsXnwdOMNMcnxj6OWYl9oBMPE4TDP8NrS-ojjqnq5aFTF1w4DcEBS-HDqIH7KqQXka5QCeB8gA6cH7uA"
                      alt="Aria Sterling"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 text-secondary shadow-xs">
                      <span className="material-symbols-outlined text-[16px] block" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base text-on-surface font-bold">Aria Sterling</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] uppercase tracking-wider font-bold">Master Pro</span>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant text-xs mt-0.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-on-surface">5.0</span>
                      <span className="font-medium">(142 curated reviews)</span>
                    </div>
                  </div>
                </div>
                <Link to="/artist/aria-sterling" className="text-xs text-primary hover:text-on-primary-container font-bold transition-colors flex items-center gap-1 bg-primary-fixed/50 px-3.5 py-1.5 rounded-full shadow-xs">
                  Edit Choice <span className="material-symbols-outlined text-sm">edit</span>
                </Link>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 mt-4 border border-outline-variant/40">
                <div className="flex items-center justify-between">
                  <span className="font-headline text-lg text-on-surface font-semibold">Deluxe Bridal Master Package</span>
                  <span className="text-lg text-primary font-bold">${basePrice.toFixed(2)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-on-surface-variant text-xs">
                  <span className="flex items-center gap-1 font-medium"><span className="material-symbols-outlined text-[18px] text-primary">schedule</span> 100 Minutes</span>
                  <span className="flex items-center gap-1 font-medium"><span className="material-symbols-outlined text-[18px] text-primary">event</span> Saturday, Oct 18, 2025 at 1:30 PM EDT</span>
                </div>
                <div className="mt-1 pt-2 border-t border-outline-variant/30 flex items-center justify-between bg-white px-3.5 py-2 rounded-lg border border-outline-variant/40 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary">add_circle</span>
                    <span className="text-xs font-semibold text-on-surface">Luxury Airbrush Foundation Upgrade</span>
                  </div>
                  <span className="text-xs font-bold text-primary">+${airbrushUpgrade.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Location Selection */}
            <div className="booking-card">
              <div className="booking-card-header">
                <h2 className="font-headline text-lg text-on-surface font-semibold">Service Location</h2>
                <span className="text-xs uppercase tracking-wider text-secondary font-bold bg-secondary-fixed/50 px-2.5 py-0.5 rounded-md">On-Demand Concierge</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setLocationChoice('travel')}
                  className={`relative flex flex-col p-4 rounded-xl cursor-pointer shadow-xs transition-all border ${
                    locationChoice === 'travel'
                      ? 'bg-surface-container-low ring-2 ring-primary border-primary'
                      : 'bg-white border-outline-variant/40 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-lg">directions_car</span>
                      </div>
                      <span className="text-sm text-on-surface font-bold">Travel to Me</span>
                    </div>
                    <input
                      checked={locationChoice === 'travel'}
                      onChange={() => setLocationChoice('travel')}
                      className="accent-primary w-4 h-4 cursor-pointer mt-1"
                      name="service_location"
                      type="radio"
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Artist arrives with fully sanitized mobile kit &amp; daylight lighting rig.</p>
                  <span className="mt-3 text-xs font-bold text-secondary bg-secondary-fixed/40 px-2.5 py-0.5 rounded-md w-fit">Travel Fee: +$35.00</span>
                </label>

                <label
                  onClick={() => setLocationChoice('studio')}
                  className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all border ${
                    locationChoice === 'studio'
                      ? 'bg-surface-container-low ring-2 ring-primary border-primary'
                      : 'bg-white border-outline-variant/40 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-lg">storefront</span>
                      </div>
                      <span className="text-sm text-on-surface font-bold">Aria’s Private Studio</span>
                    </div>
                    <input
                      checked={locationChoice === 'studio'}
                      onChange={() => setLocationChoice('studio')}
                      className="accent-primary w-4 h-4 cursor-pointer mt-1"
                      name="service_location"
                      type="radio"
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">428 Broome St, 3rd Floor, SoHo, New York, NY 10013.</p>
                  <span className="mt-3 text-xs font-medium text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-md w-fit">No travel surcharge</span>
                </label>
              </div>

              {locationChoice === 'travel' && (
                <div className="pt-3 flex flex-col gap-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 booking-input-group">
                      <label className="booking-label" htmlFor="street-address">Street Address</label>
                      <input
                        className="booking-input"
                        id="street-address"
                        type="text"
                        defaultValue="85 Adams Street, Apt 14B"
                      />
                    </div>
                    <div className="booking-input-group">
                      <label className="booking-label" htmlFor="suite-unit">Apt / Suite</label>
                      <input
                        className="booking-input"
                        id="suite-unit"
                        type="text"
                        defaultValue="14B"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2 sm:col-span-2 booking-input-group">
                      <label className="booking-label" htmlFor="city">City / Borough</label>
                      <input
                        className="booking-input"
                        id="city"
                        type="text"
                        defaultValue="Brooklyn, DUMBO"
                      />
                    </div>
                    <div className="booking-input-group">
                      <label className="booking-label" htmlFor="state">State</label>
                      <input
                        className="booking-input"
                        id="state"
                        type="text"
                        defaultValue="NY"
                      />
                    </div>
                    <div className="booking-input-group">
                      <label className="booking-label" htmlFor="zipcode">Zip Code</label>
                      <input
                        className="booking-input"
                        id="zipcode"
                        type="text"
                        defaultValue="11201"
                      />
                    </div>
                  </div>
                  <div className="booking-input-group">
                    <label className="booking-label flex items-center justify-between" htmlFor="arrival-notes">
                      <span>Building Access / Arrival Directions</span>
                      <span className="text-[11px] text-on-surface-variant font-normal normal-case">Optional</span>
                    </label>
                    <textarea
                      className="booking-input"
                      id="arrival-notes"
                      defaultValue="Buzz 1402 on callbox, concierge desk takes elevator key. Valet parking on front drive."
                      rows={2}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            {/* Consultation Intake */}
            <div className="booking-card">
              <div className="booking-card-header">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">palette</span>
                  <h2 className="font-headline text-lg text-on-surface font-semibold">Artist Consultation Intake</h2>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">Step 2 of 3</span>
              </div>
              <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">Aria reviews these details 24 hours prior to curate tailored primers, hydration serums, and product pairings.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="booking-input-group">
                  <label className="booking-label">Skin Profile</label>
                  <select className="booking-input cursor-pointer">
                    <option>Combination / Sensitive (Prone to redness)</option>
                    <option>Dry &amp; Dehydrated</option>
                    <option>Oily / Matte Finish Preference</option>
                    <option>Normal / Balanced</option>
                  </select>
                </div>
                <div className="booking-input-group">
                  <label className="booking-label">Event Lighting Environment</label>
                  <select className="booking-input cursor-pointer">
                    <option>Golden Hour Outdoor &amp; Candlelit Ballroom</option>
                    <option>Bright Daylight / Garden Ceremony</option>
                    <option>Indoor Studio Flash &amp; Video</option>
                  </select>
                </div>
              </div>
              <div className="booking-input-group mt-3">
                <label className="booking-label" htmlFor="allergies">Allergies, Sensitivities &amp; Brand Exclusions</label>
                <input
                  className="booking-input"
                  id="allergies"
                  type="text"
                  defaultValue="Lanolin allergy. Prefers cruelty-free, fragrance-free skincare prep."
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="booking-card">
              <div className="booking-card-header">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">lock</span>
                  <h2 className="font-headline text-lg text-on-surface font-semibold">Secure Payment Method</h2>
                </div>
                <span className="text-xs text-on-surface-variant flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-sm text-secondary">verified_user</span> Encrypted via Stripe
                </span>
              </div>

              {/* Express Payment Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button className="booking-quick-pay-btn bg-inverse-surface text-white shadow-xs">
                  <span> Pay</span>
                </button>
                <button className="booking-quick-pay-btn bg-white border border-outline-variant text-on-surface hover:bg-surface-container">
                  <span className="text-primary font-bold">G</span>&nbsp;Pay
                </button>
                <button className="booking-quick-pay-btn bg-white border border-outline-variant text-secondary font-black uppercase tracking-wider hover:bg-surface-container">
                  Klarna.
                </button>
              </div>

              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full bg-outline-variant/50 h-[1px]"></div></div>
                <span className="relative bg-white px-3 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">or pay with card</span>
              </div>

              <div className="booking-card-inner-box flex flex-col gap-3.5">
                <div className="booking-input-group">
                  <label className="booking-label flex items-center justify-between">
                    <span>Cardholder Name</span>
                    <span className="material-symbols-outlined text-secondary text-base">person</span>
                  </label>
                  <input
                    className="booking-input"
                    type="text"
                    defaultValue="Elena Vance"
                  />
                </div>

                <div className="booking-input-group">
                  <label className="booking-label flex items-center justify-between">
                    <span>Card Information</span>
                    <div className="flex items-center gap-1 text-[10px] text-on-surface font-bold">
                      <span className="bg-white border border-outline-variant px-1.5 py-0.5 rounded shadow-xs">VISA</span>
                      <span className="bg-white border border-outline-variant px-1.5 py-0.5 rounded shadow-xs">MC</span>
                      <span className="bg-white border border-outline-variant px-1.5 py-0.5 rounded shadow-xs">AMEX</span>
                    </div>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      className="booking-input pr-10 tracking-wider"
                      type="text"
                      defaultValue="•••• •••• •••• 8842"
                    />
                    <span className="absolute right-3 material-symbols-outlined text-secondary text-lg pointer-events-none">credit_card</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="booking-input-group">
                    <label className="booking-label">Expires (MM/YY)</label>
                    <input
                      className="booking-input"
                      type="text"
                      defaultValue="09/28"
                    />
                  </div>
                  <div className="booking-input-group">
                    <label className="booking-label flex items-center justify-between">
                      <span>CVC / CVV</span>
                      <span className="material-symbols-outlined text-xs text-on-surface-variant cursor-pointer">help</span>
                    </label>
                    <input
                      className="booking-input"
                      type="password"
                      defaultValue="•••"
                    />
                  </div>
                </div>
              </div>

              {/* Escrow Guarantee */}
              <div className="booking-escrow-box flex items-start gap-3 mt-4">
                <div className="p-1.5 bg-secondary-fixed text-on-secondary-fixed rounded-full shrink-0 mt-0.5 shadow-xs">
                  <span className="material-symbols-outlined text-base block">shield</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface font-bold">BeautyConnect Escrow Guarantee</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Your payment of <strong className="text-on-surface font-bold">${total}</strong> is safely held in third-party escrow. Funds are strictly released to Aria Sterling only 24 hours after your session is completed to complete satisfaction.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-on-surface-variant text-[11px] font-semibold">
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-secondary">lock</span><span>256-Bit SSL Protection</span></div>
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-secondary">verified</span><span>PCI-DSS Level 1 Compliant</span></div>
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-secondary">handshake</span><span>100% Punctuality Guarantee</span></div>
              </div>
            </div>
          </section>

          {/* Right Column: Transparent Summary & Sticky Drawer (5/12 cols) */}
          <aside className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="booking-card flex flex-col gap-4">
              <div className="booking-card-header">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-secondary font-bold">Investment Summary</span>
                  <h3 className="font-headline text-lg text-on-surface font-semibold">Order Breakdown</h3>
                </div>
                <span className="px-3 py-1 bg-surface-container rounded-full text-xs text-on-surface font-bold">1 Session</span>
              </div>

              <div className="flex flex-col gap-3 text-on-surface text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">Deluxe Bridal Master Package</span>
                    <span className="text-[11px] text-on-surface-variant">100 min full application &amp; lashes</span>
                  </div>
                  <span className="font-bold text-on-surface text-sm">${basePrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">Airbrush Foundation Upgrade</span>
                    <span className="text-[11px] text-on-surface-variant">Silicone-based 16hr HD finish</span>
                  </div>
                  <span className="font-bold text-on-surface text-sm">${airbrushUpgrade.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">Travel Convenience Fee</span>
                    <span className="text-[11px] text-on-surface-variant">{locationChoice === 'travel' ? 'Manhattan Studio to Brooklyn (8.2 mi)' : 'Studio Visit (No travel fee)'}</span>
                  </div>
                  <span className="font-bold text-on-surface text-sm">${travelFee.toFixed(2)}</span>
                </div>

                <div className="w-full h-[1px] bg-outline-variant/40 my-1"></div>

                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Subtotal</span>
                  <span className="font-bold text-on-surface text-sm">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1">Estimated Local Sales Tax (8.875%)</span>
                  <span className="font-semibold text-on-surface">${tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1 font-medium">Platform Protection &amp; Care</span>
                    <span className="text-[10px] text-secondary font-bold">Verified insurance &amp; Concierge</span>
                  </div>
                  <span className="font-semibold text-on-surface">${platformProtection.toFixed(2)}</span>
                </div>

                <div className="booking-summary-total-box flex items-center justify-between mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-secondary">Total Due Today</span>
                    <span className="text-[11px] text-on-surface-variant font-medium">Includes all fees &amp; local taxes</span>
                  </div>
                  <span className="font-headline text-2xl text-primary font-bold tracking-tight">${total}</span>
                </div>
              </div>

              {/* Cancellation Window */}
              <div className="bg-surface-bright p-3.5 rounded-xl flex items-start gap-2.5 text-on-surface-variant text-xs border border-outline-variant/40">
                <span className="material-symbols-outlined text-[18px] text-tertiary mt-0.5">event_available</span>
                <div>
                  <span className="font-bold text-on-surface block">Flexible Cancellation Window</span>
                  <p className="mt-0.5 text-on-surface-variant">100% full refund until <strong className="text-on-surface font-bold">Thursday, Oct 16 at 1:30 PM</strong> (48h prior).</p>
                </div>
              </div>

              <button
                onClick={() => setConfirmed(true)}
                className="booking-primary-btn"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>Confirm &amp; Pay ${total}</span>
              </button>

              <p className="text-[11px] text-center text-on-surface-variant leading-relaxed">
                By confirming, you agree to BeautyConnect's <a className="underline hover:text-on-surface font-semibold" href="#">Terms of Service</a> and Aria Sterling’s <a className="underline hover:text-on-surface font-semibold" href="#">Artist Code</a>.
              </p>
            </div>

            {/* Direct Concierge Callout */}
            <div className="booking-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface font-bold">Priority Concierge Active</span>
                  <span className="text-[11px] text-on-surface-variant">Dispatch support standing by for this booking</span>
                </div>
              </div>
              <button className="px-4 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface cursor-pointer border border-outline-variant/40 transition-colors">
                Chat
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
