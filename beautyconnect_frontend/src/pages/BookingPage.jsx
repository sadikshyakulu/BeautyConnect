import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
      <div className="w-full flex-1 pt-12 pb-20 bg-background text-on-surface">
        <div className="max-w-2xl mx-auto px-4 text-center py-16 bg-surface-bright rounded-2xl shadow-xl border border-white">
          <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">verified</span>
          </div>
          <h1 className="font-headline text-3xl text-on-surface font-semibold mb-2">Booking Request Confirmed!</h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-6">
            Your appointment with <strong className="text-on-surface">Aria Sterling</strong> for Saturday, Oct 18, 2025 at 1:30 PM EDT has been submitted. Your payment of ${total} is secured in escrow.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/dashboard/customer" className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-semibold shadow-md">
              View in Customer Dashboard
            </Link>
            <Link to="/" className="px-6 py-2.5 rounded-full bg-surface-container text-on-surface text-xs font-semibold">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex-1 pt-8 pb-20 bg-background text-on-surface">
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-12">
        {/* Stepper Navigation */}
        <nav aria-label="Checkout Progress" className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-surface-container -z-0"></div>
            <div className="absolute top-1/2 left-0 w-1/2 -translate-y-1/2 h-[2px] bg-primary -z-0 transition-all duration-500"></div>

            {/* Step 1: Completed */}
            <div className="relative z-10 flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[20px]">check</span>
              </div>
              <span className="text-xs text-on-surface font-semibold">Service &amp; Time</span>
              <span className="text-[11px] text-secondary font-medium">Oct 18, 1:30 PM</span>
            </div>

            {/* Step 2: Active */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-white text-primary shadow-md flex items-center justify-center ring-4 ring-primary/20">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <span className="text-xs text-primary font-bold">Details &amp; Location</span>
              <span className="text-[11px] text-on-surface-variant">In Progress</span>
            </div>

            {/* Step 3: Upcoming */}
            <div className="relative z-10 flex flex-col items-center gap-1 opacity-60">
              <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center">
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
            <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-xl p-6 shadow-sm ring-1 ring-surface-bright border border-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      className="w-14 h-14 rounded-full object-cover shadow-sm"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_hzUaVMPElYuw3PL5fs6kvsVFfCaW8lGxoAPdFjFe6l4fqFzLsUoewY_vMTa2wmH_ixYva24zfQ8h0XbCusl363PFn6wCzybd1UXNGY1tnqEZLye0j92GmABeXV2CZXxk8rR2LjSGxU0p2v9GDZQye1PuaePr02Hl5AbRTywsXnwdOMNMcnxj6OWYl9oBMPE4TDP8NrS-ojjqnq5aFTF1w4DcEBS-HDqIH7KqQXka5QCeB8gA6cH7uA"
                      alt="Aria Sterling"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 text-secondary">
                      <span className="material-symbols-outlined text-[16px] block" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base text-on-surface font-semibold">Aria Sterling</h3>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs uppercase tracking-wider font-semibold">Master Pro</span>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                      <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-semibold text-on-surface">5.0</span>
                      <span>(142 curated reviews)</span>
                    </div>
                  </div>
                </div>
                <Link to="/artist/aria-sterling" className="text-xs text-primary hover:text-on-primary-container font-semibold transition-colors flex items-center gap-0.5">
                  Edit Choice <span className="material-symbols-outlined text-sm">edit</span>
                </Link>
              </div>

              <div className="bg-surface-container-low/70 backdrop-blur-md rounded-lg p-4 flex flex-col gap-1 border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-headline text-lg text-on-surface font-semibold">Deluxe Bridal Master Package</span>
                  <span className="text-base text-primary font-bold">${basePrice.toFixed(2)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-on-surface-variant text-xs pt-1">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">schedule</span> 100 Minutes</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">event</span> Saturday, Oct 18, 2025 at 1:30 PM EDT</span>
                </div>
                <div className="mt-2 pt-2 flex items-center justify-between bg-white px-3 py-1.5 rounded shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary">add_circle</span>
                    <span className="text-xs font-medium text-on-surface">Luxury Airbrush Foundation Upgrade</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">+${airbrushUpgrade.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Location Selection */}
            <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-xl p-6 shadow-sm ring-1 ring-surface-container flex flex-col gap-4 border border-white">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-lg text-on-surface font-semibold">Service Location</h2>
                <span className="text-xs uppercase tracking-wider text-secondary font-semibold">On-Demand Concierge</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setLocationChoice('travel')}
                  className={`relative flex flex-col p-4 rounded-xl cursor-pointer shadow-sm transition-all border ${
                    locationChoice === 'travel'
                      ? 'bg-surface-container-low/80 ring-2 ring-primary/30 border-primary'
                      : 'bg-white border-outline-variant/30 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">directions_car</span>
                      <span className="text-sm text-on-surface font-semibold">Travel to Me</span>
                    </div>
                    <input
                      checked={locationChoice === 'travel'}
                      onChange={() => setLocationChoice('travel')}
                      className="accent-primary w-4 h-4 cursor-pointer mt-1"
                      name="service_location"
                      type="radio"
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant">Artist arrives with fully sanitized mobile kit &amp; daylight lighting rig.</p>
                  <span className="mt-2 text-xs font-semibold text-secondary">Travel Fee Applied: +$35.00</span>
                </label>

                <label
                  onClick={() => setLocationChoice('studio')}
                  className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all border ${
                    locationChoice === 'studio'
                      ? 'bg-surface-container-low/80 ring-2 ring-primary/30 border-primary'
                      : 'bg-white border-outline-variant/30 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-on-surface-variant">storefront</span>
                      <span className="text-sm text-on-surface font-semibold">Aria’s Private Studio</span>
                    </div>
                    <input
                      checked={locationChoice === 'studio'}
                      onChange={() => setLocationChoice('studio')}
                      className="accent-primary w-4 h-4 cursor-pointer mt-1"
                      name="service_location"
                      type="radio"
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant">428 Broome St, 3rd Floor, SoHo, New York, NY 10013.</p>
                  <span className="mt-2 text-xs text-on-surface-variant">No travel surcharge</span>
                </label>
              </div>

              {locationChoice === 'travel' && (
                <div className="pt-2 flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-xs text-on-surface font-medium" htmlFor="street-address">Street Address</label>
                      <input className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/30" id="street-address" type="text" defaultValue="85 Adams Street, Apt 14B" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-on-surface font-medium" htmlFor="suite-unit">Apt / Suite</label>
                      <input className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/30" id="suite-unit" type="text" defaultValue="14B" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2 sm:col-span-2 flex flex-col gap-1">
                      <label className="text-xs text-on-surface font-medium" htmlFor="city">City / Borough</label>
                      <input className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/30" id="city" type="text" defaultValue="Brooklyn, DUMBO" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-on-surface font-medium" htmlFor="state">State</label>
                      <input className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/30" id="state" type="text" defaultValue="NY" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-on-surface font-medium" htmlFor="zipcode">Zip Code</label>
                      <input className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/30" id="zipcode" type="text" defaultValue="11201" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface font-medium flex items-center justify-between" htmlFor="arrival-notes">
                      <span>Building Access / Arrival Directions</span>
                      <span className="text-[11px] text-on-surface-variant font-normal">Optional</span>
                    </label>
                    <textarea className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/30" id="arrival-notes" defaultValue="Buzz 1402 on callbox, concierge desk takes elevator key. Valet parking on front drive." rows={2}></textarea>
                  </div>
                </div>
              )}
            </div>

            {/* Consultation Intake */}
            <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-xl p-6 shadow-sm ring-1 ring-surface-container flex flex-col gap-4 border border-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">palette</span>
                <h2 className="font-headline text-lg text-on-surface font-semibold">Artist Consultation Intake</h2>
              </div>
              <p className="text-xs text-on-surface-variant">Aria reviews these details 24 hours prior to curate tailored primers, hydration serums, and product pairings.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-on-surface font-medium">Skin Profile</label>
                  <select className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/30">
                    <option>Combination / Sensitive (Prone to redness)</option>
                    <option>Dry &amp; Dehydrated</option>
                    <option>Oily / Matte Finish Preference</option>
                    <option>Normal / Balanced</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-on-surface font-medium">Event Lighting Environment</label>
                  <select className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/30">
                    <option>Golden Hour Outdoor &amp; Candlelit Ballroom</option>
                    <option>Bright Daylight / Garden Ceremony</option>
                    <option>Indoor Studio Flash &amp; Video</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface font-medium" htmlFor="allergies">Allergies, Sensitivities &amp; Brand Exclusions</label>
                <input className="w-full bg-surface-container-low rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/30" id="allergies" type="text" defaultValue="Lanolin allergy. Prefers cruelty-free, fragrance-free skincare prep." />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-xl p-6 shadow-sm ring-1 ring-surface-container flex flex-col gap-4 border border-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">lock</span>
                  <h2 className="font-headline text-lg text-on-surface font-semibold">Secure Payment Method</h2>
                </div>
                <span className="text-xs text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-sm text-secondary">verified_user</span> Encrypted via Stripe</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button className="flex items-center justify-center py-2 px-3 rounded-lg bg-inverse-surface text-white text-xs font-semibold cursor-pointer">
                  <span> Pay</span>
                </button>
                <button className="flex items-center justify-center py-2 px-3 rounded-lg bg-surface-container text-on-surface text-xs font-semibold cursor-pointer">
                  <span className="text-primary font-bold">G</span>&nbsp;Pay
                </button>
                <button className="flex items-center justify-center py-2 px-3 rounded-lg bg-surface-container text-secondary text-xs font-bold uppercase tracking-wider cursor-pointer">
                  Klarna.
                </button>
              </div>

              <div className="relative flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center"><div className="w-full bg-surface-container h-[1px]"></div></div>
                <span className="relative bg-white px-3 text-[11px] text-on-surface-variant uppercase tracking-wider">or pay with card</span>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-3 border border-outline-variant/30">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-on-surface font-medium flex items-center justify-between">
                    <span>Cardholder Name</span>
                    <span className="material-symbols-outlined text-secondary text-sm">person</span>
                  </label>
                  <input className="w-full bg-white rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/20" type="text" defaultValue="Elena Vance" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-on-surface font-medium flex items-center justify-between">
                    <span>Card Information</span>
                    <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-bold">
                      <span className="bg-surface-container px-1 rounded">VISA</span>
                      <span className="bg-surface-container px-1 rounded">MC</span>
                      <span className="bg-surface-container px-1 rounded">AMEX</span>
                    </div>
                  </label>
                  <div className="relative flex items-center">
                    <input className="w-full bg-white rounded-lg pl-3 pr-10 py-2 text-xs text-on-surface tracking-wider focus:outline-none border border-outline-variant/20" type="text" defaultValue="•••• •••• •••• 8842" />
                    <span className="absolute right-3 material-symbols-outlined text-secondary text-base">credit_card</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface font-medium">Expires (MM/YY)</label>
                    <input className="w-full bg-white rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/20" type="text" defaultValue="09/28" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface font-medium flex items-center justify-between">
                      <span>CVC / CVV</span>
                      <span className="material-symbols-outlined text-xs text-on-surface-variant">help</span>
                    </label>
                    <input className="w-full bg-white rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none border border-outline-variant/20" type="password" defaultValue="•••" />
                  </div>
                </div>
              </div>

              {/* Escrow Guarantee */}
              <div className="bg-secondary-fixed/30 rounded-xl p-4 flex items-start gap-3 border border-secondary-fixed">
                <div className="p-1 bg-secondary-fixed text-on-secondary-fixed rounded-full shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-base block">shield</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface font-semibold">BeautyConnect Escrow Guarantee</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Your payment of <strong className="text-on-surface font-semibold">${total}</strong> is safely held in third-party escrow. Funds are strictly released to Aria Sterling only 24 hours after your session is completed to complete satisfaction.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-on-surface-variant text-[11px] font-semibold">
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-secondary">lock</span><span>256-Bit SSL Protection</span></div>
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-secondary">verified</span><span>PCI-DSS Level 1 Compliant</span></div>
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-secondary">handshake</span><span>100% Punctuality Guarantee</span></div>
              </div>
            </div>
          </section>

          {/* Right Column: Transparent Summary & Sticky Drawer (5/12 cols) */}
          <aside className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-surface-bright/80 backdrop-blur-md rounded-xl p-6 shadow-md border border-white flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Investment Summary</span>
                  <h3 className="font-headline text-lg text-on-surface font-semibold">Order Breakdown</h3>
                </div>
                <span className="px-2.5 py-1 bg-surface-container rounded-full text-xs text-on-surface font-medium">1 Session</span>
              </div>

              <div className="flex flex-col gap-2 text-on-surface text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">Deluxe Bridal Master Package</span>
                    <span className="text-[11px] text-on-surface-variant">100 min full application &amp; lashes</span>
                  </div>
                  <span className="font-semibold">${basePrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">Airbrush Foundation Upgrade</span>
                    <span className="text-[11px] text-on-surface-variant">Silicone-based 16hr HD finish</span>
                  </div>
                  <span className="font-semibold">${airbrushUpgrade.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">Travel Convenience Fee</span>
                    <span className="text-[11px] text-on-surface-variant">{locationChoice === 'travel' ? 'Manhattan Studio to Brooklyn (8.2 mi)' : 'Studio Visit (No travel fee)'}</span>
                  </div>
                  <span className="font-semibold">${travelFee.toFixed(2)}</span>
                </div>

                <div className="w-full h-[1px] bg-surface-container my-1"></div>

                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-semibold text-on-surface">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1">Estimated Local Sales Tax (8.875%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1">Platform Protection &amp; Care</span>
                    <span className="text-[10px] text-secondary">Verified insurance &amp; Concierge</span>
                  </div>
                  <span>${platformProtection.toFixed(2)}</span>
                </div>

                <div className="mt-2 bg-surface-container-low p-3.5 rounded-xl flex items-center justify-between border border-outline-variant/30">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-bold tracking-wider text-secondary">Total Due Today</span>
                    <span className="text-[11px] text-on-surface-variant">Includes all fees &amp; local taxes</span>
                  </div>
                  <span className="font-headline text-xl text-primary font-bold tracking-tight">${total}</span>
                </div>
              </div>

              {/* Cancellation */}
              <div className="bg-white p-3.5 rounded-lg flex items-start gap-2 text-on-surface-variant text-xs border border-outline-variant/20">
                <span className="material-symbols-outlined text-[18px] text-tertiary mt-0.5">event_available</span>
                <div>
                  <span className="font-semibold text-on-surface block">Flexible Cancellation Window</span>
                  <p className="mt-0.5">100% full refund until <strong className="text-on-surface">Thursday, Oct 16 at 1:30 PM</strong> (48h prior).</p>
                </div>
              </div>

              <button
                onClick={() => setConfirmed(true)}
                className="w-full bg-primary hover:bg-on-primary-fixed-variant text-white font-semibold text-sm py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">lock</span>
                <span>Confirm &amp; Pay ${total}</span>
              </button>

              <p className="text-[11px] text-center text-on-surface-variant">
                By confirming, you agree to BeautyConnect's <a className="underline hover:text-on-surface" href="#">Terms of Service</a> and Aria Sterling’s <a className="underline hover:text-on-surface" href="#">Artist Code</a>.
              </p>
            </div>

            {/* Direct Concierge Callout */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface font-semibold">Priority Concierge Active</span>
                  <span className="text-[11px] text-on-surface-variant">Dispatch support standing by for this booking</span>
                </div>
              </div>
              <button className="px-4 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface cursor-pointer">
                Chat
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
