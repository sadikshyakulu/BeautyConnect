import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './ArtistProfilePage.css'

export default function ArtistProfilePage() {
  const navigate = useNavigate()
  const [galleryTab, setGalleryTab] = useState('all')
  const [selectedService, setSelectedService] = useState({
    name: 'Deluxe Bridal Master Package',
    price: 295,
    duration: '100 min'
  })
  const [locationType, setLocationType] = useState('studio') // 'studio' | 'travel'
  const [selectedDate, setSelectedDate] = useState('Fri, Nov 15')
  const [selectedTime, setSelectedTime] = useState('1:30 PM')
  const [addons, setAddons] = useState({
    underEye: false,
    airbrush: false,
    hairWave: false
  })
  const [isSaved, setIsSaved] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const travelFee = locationType === 'travel' ? 40 : 0
  const addonsTotal = 
    (addons.underEye ? 25 : 0) + 
    (addons.airbrush ? 45 : 0) + 
    (addons.hairWave ? 60 : 0)
  const totalPrice = selectedService.price + travelFee + addonsTotal

  const galleryItems = [
    {
      category: 'bridal',
      title: 'Glowy Bridal Glam • Golden Hour',
      sub: 'Tribeca Rooftop Ceremony',
      badge: 'Bridal Master Look',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA60gB8tGh_ONlUjAWPPZL58MfYmD-8iLRnrUK2kDiDUbzNhskTipyppoMgYZdVLRoIvrjq2pZqG-ZHRrO3s3Cv4Zy1B1mpS03zoBolBTPMbW_mBUtHL61rKm3_G0ggBjHhkCamPPJ_B_ybjrcLRnkIZ1XsRw857uttEGmEmbFwZ0o9KpJseiusO4RjrCcVokfZ9gABppwhj1lClCDFZG1zAN599xp4CmhbQWDq4jDpbqcvw3_N7fKhJw'
    },
    {
      category: 'editorial',
      title: 'Clean Editorial Skin Prep',
      sub: 'Vogue Scandinavia Print',
      badge: 'Magazine Campaign',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOEgy87e3Ffas9XrDYKb81gXV1HEd0iLlhaqyyBm37PT9n0jnVdMJ78cGBq1P99wOevn7WUGWxqRybZ1PMnqhGShkunyMeAgqxE5x6ir7ncoTpEkGyBmVEGp-khorajrY6lQ0bdF_EepHEeUrgyydE6Gzo51qdPacX_oyL5wzieWUR8HXfB56v3N2xOSqzOzCTG7g4K3PI63SsrRNUceCSXT-zpLAWyUdfxyt7teNuunpkzGqups0zIg'
    },
    {
      category: 'glam',
      title: 'Graphic Wing & Velvet Lip',
      sub: 'Film Premiere Red Carpet',
      badge: 'Met Gala Afterparty',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY16wdczeQ2tTZhU0MOfu-lBJnKk8NImEGfRcvViOY0itMPlhcVuuF9d7fgm7rO_8D6nzFDg0hWFnfGCONNH0f4_cHJTg3wdfoqNosRZfdr-WvyYcXjUBC9-a8KfOmT_D2sFZPVHywZrM4unekftJ74hgnaA-Pc-w44pLa9xuIR_TnbKn-CEnHpW2OvwcW4pfn1yAOV-cDHE4Fq1K_GCZgk6QbXAqgjn2ZIIIvLkzVpNnkmqhAW0P18g'
    },
    {
      category: 'bridal',
      title: 'Hudson Valley Summer Wedding',
      sub: '12-Hour Weatherproof Finish',
      badge: 'Bridal Elegance',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI7-IFZ9r6iFQonveIi6_IAPSKHbnnfuQq0JdCdNYdNvIExVEY9p2uiw8FeCm2CZ-O5Hham-RAGPnUpiBTjSAQAPbmmTmK52UTJhF-F9zOjHCjPziEaKzjzPSOc4dEr8qDIFGu3OKf-fQHZi2WqoGkuG_zMFvhcWFcvJIkmf0SW3Y-s_8PE0Omu9MZtUKu825Q0PIzcyjTajHifO5vzdx61Hw93JLhtUzGCG9cpYt-unyhnZSnNPKRsg'
    },
    {
      category: 'selfies',
      title: 'Lauren S. • 1:00 AM Reception',
      sub: '"Literally didn\'t budge through 6 hrs of dancing!"',
      badge: 'Unfiltered Client Photo',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsup-14QFZ3kIy2UdqLzlXG4TTHxw5sQquCmLyM9YjiDsXaoWoFgIa08p2OpAId74VW59ek9-cw1RxwQ8ttJ195Wco4IDsNJf17qEJ6_rRsCQUDQzjZRj54ml2XdqazGHN6XdL4BHSajLVphqMxYSrad3Aoddfj1q0ZMBqiuv8rpv8aRGicuugl3swgtosletdV51Z4ePv6k5xQPF0l13cx67qAzwrMHGfKseGwEtOXGQe2LkwU5tVsQ'
    },
    {
      category: 'editorial',
      title: 'Clean Mineral Radiance',
      sub: 'Brand Lookbook Campaign',
      badge: 'Commercial Beauty',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm_RBLOKNo7iV2Z2l25mBldsaaxNAHaxze0I0iYgMXwIifE0U-AsVICw13kazssxZJj7kU63oR9X_v8IDhhGDm4qljEIwgejHr0xJZCbI1n5Ss9BmQIiSc__ZEq0ZnIbu259e44fpR8OHi6cML0goH1i6FQqxzAkA2QNLRJp943WL7eezaNKdpesKgivIGuhZmymbqREYtY7nbofi6GZQoi6tuhidqlZKgrJSxlE-ssZJP2PQl1MU1aQ'
    }
  ]

  const filteredGallery = galleryTab === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === galleryTab)

  const handleBookingContinue = () => {
    navigate(`/booking?artist=aria-sterling&service=${encodeURIComponent(selectedService.name)}&price=${totalPrice}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`)
  }

  return (
    <div className="w-full flex-1 bg-background text-on-surface">
      {/* Immersive Editorial Top Cover */}
      <section className="relative w-full overflow-hidden bg-surface-container-high pb-6">
        <div className="w-full h-80 md:h-[400px] relative">
          <div className="artist-cover-grid grid grid-cols-12 h-full w-full gap-1">
            <div className="artist-cover-main col-span-12 md:col-span-7 h-full relative overflow-hidden group">
              <img
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcDge5HmGT5tzkahGNG1noOLK02S6hx4SXozT-BtIj62KDw1m8clKyjSRfvyFdSJ5EtOD1wzbReoWuKC1eJYNJXviy8fhr8Ex_pQVTIcnRQ2_JaN2wQgq9VDdLc3FbDllijbTeQG_gZ5-17Wfhp-8iwaVCohk4SWgv7mgOkIjSeOC_ofQAcb_Rcae4VYiKLWM_IyGnfqV1CWgk1JDR3SOV8zrQCnmOlrP1txzWFMNHF19bWJ9jCcwb1A"
                alt="Aria Sterling Lookbook"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-6 hidden md:block">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-bright/80 backdrop-blur-md text-on-surface text-xs font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Fall 2025 Lookbook Feature
                </span>
              </div>
            </div>
            <div className="artist-cover-side hidden md:grid md:col-span-5 grid-rows-2 h-full gap-1">
              <div className="relative overflow-hidden group">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF6H3U_JGIA4fxgcwaETIqTcJR3961l2t5Iglqntn3vZc8NoAW9VSciig9csqy1EH8DTIl3g8wSJJaqVqAtRxZwqZ16_TGsbphRiCVM2oRXjn-BcSbRJgnBjILhJtFwrEmzpadTTlE-Fh1yLykxAROk0tFpAuDSAHkdsC96EaOYOOG7ubrenJRoZiUZjJTRyH_SNn-qhRCwXkZtvxIMY0E6ypH9ZGzN7IsMH5kkEbtPV-U1loKxUgfIw"
                  alt="Skin Ritual"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/40 to-transparent"></div>
                <span className="absolute bottom-3 right-4 text-xs text-white/90 bg-inverse-surface/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full">Skin Ritual Detail</span>
              </div>
              <div className="relative overflow-hidden group">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuATyX9PlAXTRV_LY8Gjv6WQOgIRgP3tKqGz56s_74qnuueIeXgyiOh3Vj9kiZ84D5La8QTJrpv2ydMEHHKFYctJGfpMqkZQe3cADYWoqGkBHuRV6KySSb4b0tCgs-u1j5HeNfcu-CkqODNati2yGKJ4N0UJBhhMRdpJfE9lTwhKxf9cly1LjlfEO_7caRDQ-ij8n7-zz5H_uk1UMly_fL-ExP9gRTNjyARYmkolyNZdgwqGOeIf2BafHw"
                  alt="SoHo Atelier"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/40 to-transparent"></div>
                <span className="absolute bottom-3 right-4 text-xs text-white/90 bg-inverse-surface/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full">SoHo Atelier View</span>
              </div>
            </div>
          </div>
        </div>

        {/* Artist Identification Overlap Bar */}
        <div className="max-w-7xl mx-auto px-4 lg:px-12 -mt-16 md:-mt-20 relative z-20">
          <div
            className="rounded-2xl shadow-xl p-4 lg:p-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border border-white/80 backdrop-blur-md"
            style={{ background: 'rgba(255, 248, 248, 0.85)' }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-lg ring-4 ring-white">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-y-QVNr3pV7r9XzZaAtm-PNZNTIvaK6Svu8ozNV4Wl0KWlH6TVmVN0Hk26pVdXHvto8eI3fms2EFuNSarMtQiqgV5JRF8doztddvo5fqCH7KH4bUUwa-ZD-fHDWZTUNcaqbFL_ZPSDubsp2vi2POYOOC9VofrKOjmyQDHpjAZ8Zrvuse_qa9cXXsN7GYOCEs8x-t_tEfpgXIbDT1HwX-XBnsW7bJAQdRwdTGOpFdcJHOMQ_h4lcy54A"
                    alt="Aria Sterling"
                  />
                </div>
                <span className="artist-verified-badge absolute flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-white shadow-md">
                  <span className="material-symbols-outlined text-[17px]">verified</span>
                </span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="font-headline text-2xl sm:text-3xl text-on-surface tracking-tight font-semibold">Aria Sterling</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">workspace_premium</span> Top 1% Artist '24/'25
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant font-medium">Master Bridal &amp; Editorial Makeup Artist</p>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-on-surface-variant text-xs pt-0.5">
                  <span className="flex items-center gap-1 text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-base">location_on</span> SoHo, New York
                  </span>
                  <span>•</span>
                  <span>Travels within 25 miles</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-on-surface font-semibold">
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    5.0 <span className="font-normal text-on-surface-variant">(148 reviews)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
              <button
                onClick={() => {
                  setIsSaved(!isSaved)
                  showToast(isSaved ? 'Removed from Lookbook' : 'Aria Sterling saved to your Private Lookbook')
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-sm cursor-pointer border border-outline-variant/30 ${
                  isSaved ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href)
                  showToast('Lookbook profile link copied to clipboard!')
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-xs font-semibold text-on-surface shadow-sm cursor-pointer border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-lg">ios_share</span>
                <span>Share</span>
              </button>
              <a
                href="#booking-card"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary hover:bg-on-primary-fixed-variant transition-colors text-white text-xs font-semibold shadow-md"
              >
                <span className="material-symbols-outlined text-lg">chat_bubble</span>
                <span>Inquire / Book</span>
              </a>
            </div>
          </div>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-surface-bright/80 backdrop-blur-md rounded-xl p-3 shadow-sm border border-white/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-xl">verified_user</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-on-surface font-semibold leading-tight">Licensed Esthetician</div>
                <div className="text-[11px] text-on-surface-variant">8+ Years Master Practice</div>
              </div>
            </div>
              <div className="bg-surface-bright/80 backdrop-blur-md rounded-xl p-3 shadow-sm border border-white/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-xl">schedule</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-on-surface font-semibold leading-tight">&lt; 15 min Reply</div>
                <div className="text-[11px] text-on-surface-variant">100% On-Time Response</div>
              </div>
            </div>
              <div className="bg-surface-bright/80 backdrop-blur-md rounded-xl p-3 shadow-sm border border-white/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
                <span className="material-symbols-outlined text-xl">clean_hands</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-on-surface font-semibold leading-tight">Certified Sanitation</div>
                <div className="text-[11px] text-on-surface-variant">EPA Hospital Certified Kit</div>
              </div>
            </div>
            <div className="bg-surface-bright/80 backdrop-blur-md rounded-xl p-3 shadow-sm border border-white/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                <span className="material-symbols-outlined text-xl">hotel_class</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-on-surface font-semibold leading-tight">Vogue &amp; Brides</div>
                <div className="text-[11px] text-on-surface-variant">Editorial Published Artist</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout Grid */}
      <section className="max-w-7xl mx-auto px-4 lg:px-12 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: 65% width */}
          <div className="lg:col-span-8 flex flex-col gap-8 min-w-0">
            {/* Editorial Biography Card */}
            <article className="bg-surface-bright/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">Artist Manifesto</span>
                  <span className="w-6 h-[1px] bg-outline-variant"></span>
                </div>
                <span className="text-xs text-secondary bg-surface-container px-3 py-1 rounded-full border border-outline-variant/30 font-medium">New York Fashion Week Lead</span>
              </div>
              <h2 className="font-headline text-xl text-on-surface font-semibold">"Skin first. Dimension always. Never a mask."</h2>
              <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
                <p>Trained in Paris and refined across high-fashion runways in Milan and New York, Aria Sterling specializes in high-touch, luminous makeup designed to seamlessly transition from 4K close-up photography to intimate candlelit receptions.</p>
                <p>Every session begins with an individualized Japanese lymphatic facial massage and barrier-nourishing prep using biocompatible botanical serums. Aria's signature kit is rigorously curated: 100% cruelty-free, luxury clean formulas (Westman Atelier, Augustinus Bader, Charlotte Tilbury, and bespoke hand-mixed mineral pigments) chosen specifically to withstand heat, happy tears, and continuous motion without caking or creasing.</p>
              </div>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface font-medium border border-outline-variant/30">Luxury Skin Rituals</span>
                <span className="px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface font-medium border border-outline-variant/30">Biocompatible Clean Kit</span>
                <span className="px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface font-medium border border-outline-variant/30">HD Camera Contouring</span>
                <span className="px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface font-medium border border-outline-variant/30">Inclusive Complexion Specialist</span>
              </div>
            </article>

            {/* Lookbook Portfolio Section with Interactive Filters */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs uppercase tracking-widest text-secondary font-semibold">Curated Gallery</span>
                  <h3 className="font-headline text-xl text-on-surface font-semibold">The Editorial Lookbook</h3>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'all', label: 'All (42)' },
                    { id: 'bridal', label: 'Bridal' },
                    { id: 'glam', label: 'Red Carpet' },
                    { id: 'editorial', label: 'Editorial' },
                    { id: 'selfies', label: 'Client Snaps' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setGalleryTab(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                        galleryTab === tab.id
                          ? 'bg-primary text-white'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Bento Gallery Grid */}
              <div className="artist-gallery-grid">
                {filteredGallery.map((item, idx) => (
                  <div key={idx} className="artist-gallery-card group">
                    <img src={item.img} alt={item.title} className="artist-gallery-image" />
                    <div className="artist-gallery-caption">
                      <span className="artist-gallery-badge">{item.badge}</span>
                      <p className="artist-gallery-title">{item.title}</p>
                      <p className="artist-gallery-subtitle">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Menu with Expandable Details */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">Transparent Rates</span>
                  <h3 className="font-headline text-xl text-on-surface font-semibold">Service Offerings &amp; Packages</h3>
                </div>
                <span className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-sm text-primary">check_circle</span> Includes Luxury Prep Kit
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'Signature Soft Glam',
                    price: 185,
                    duration: '75 min',
                    desc: 'Full face radiant finish, luxury biocompatible skin preparation ritual, and custom individual flutter lashes.',
                    features: ['Augustinus Bader Rich Cream Prep', 'Bespoke Mink/Silk Cluster Lashes', 'Complimentary Lip Touch-Up Pot', '16-Hour Sweatproof Barrier Seal']
                  },
                  {
                    name: 'Deluxe Bridal Master Package',
                    price: 295,
                    duration: '100 min',
                    badge: 'Recommended for Brides',
                    desc: 'Extended cryo-wand depuffing ritual, chest and collarbone body shimmer contouring, full waterproof locking veil, and deluxe take-home touch-up kit.',
                    features: ['Cryo Ice-Wand Lymphatic Ritual', 'Veil Placement Coordination', 'Full-Size Matte Lipstick + Blotting Papers', '4K Photo Micro-Powder Diffusion']
                  },
                  {
                    name: 'Editorial & Commercial Creative',
                    price: 350,
                    duration: '120 min',
                    badge: 'High Fashion / On-Set',
                    desc: 'High-definition camera-ready contouring, custom runway texture placement, multi-look adaptation, and 30-min on-set monitor standby.',
                    features: ['Runway Multi-Look Adapting', '30-Min On-Set Monitor Standby', 'Custom Texture Placement', 'Studio Strobe Diffuser Shield']
                  },
                  {
                    name: 'Bridal Trial & In-Studio Consultation',
                    price: 195,
                    duration: '90 min',
                    desc: 'Comprehensive moodboard design, dual-look side-by-side skin and eye testing, lighting simulation, and digital face-chart archiving.',
                    features: ['Moodboard & Skin Analysis', 'Dual-Look Testing', 'Lighting Simulation', 'Digital Face-Chart Archiving']
                  }
                ].map(svc => (
                  <div
                    key={svc.name}
                    onClick={() => setSelectedService(svc)}
                    className={`bg-surface-bright rounded-2xl p-4 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                      selectedService.name === svc.name ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base text-on-surface font-semibold">{svc.name}</span>
                          {svc.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">
                              {svc.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">{svc.desc}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-lg font-bold ${selectedService.name === svc.name ? 'text-primary' : 'text-on-surface'}`}>
                          ${svc.price}
                        </span>
                        <div className="text-xs text-on-surface-variant">{svc.duration}</div>
                      </div>
                    </div>
                    {/* Feature Chips */}
                    <div className="mt-3 pt-3 border-t border-surface-container-high grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant">
                      {svc.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary text-sm">verified</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Add-ons Section */}
              <div className="bg-surface-container rounded-2xl p-4 mt-2">
                <h4 className="text-sm text-on-surface font-semibold mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">tune</span> Artisanal Add-ons to Elevate Your Service
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-surface-bright shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addons.underEye}
                        onChange={e => setAddons({ ...addons, underEye: e.target.checked })}
                        className="w-4 h-4 rounded text-primary accent-primary"
                      />
                      <span className="text-xs text-on-surface font-medium">Under-Eye 24K Mask</span>
                    </div>
                    <span className="text-xs text-secondary font-semibold">+$25</span>
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl bg-surface-bright shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addons.airbrush}
                        onChange={e => setAddons({ ...addons, airbrush: e.target.checked })}
                        className="w-4 h-4 rounded text-primary accent-primary"
                      />
                      <span className="text-xs text-on-surface font-medium">Airbrush HD Skin</span>
                    </div>
                    <span className="text-xs text-secondary font-semibold">+$45</span>
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl bg-surface-bright shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addons.hairWave}
                        onChange={e => setAddons({ ...addons, hairWave: e.target.checked })}
                        className="w-4 h-4 rounded text-primary accent-primary"
                      />
                      <span className="text-xs text-on-surface font-medium">Hair Wave Touch-Up</span>
                    </div>
                    <span className="text-xs text-secondary font-semibold">+$60</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Verified Reviews Section */}
            <div className="bg-surface-bright/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-secondary font-semibold">Client Testimonials</span>
                  <h3 className="font-headline text-xl text-on-surface font-semibold">Authentic Client Experiences</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-headline text-3xl text-on-surface leading-none font-bold">5.0</span>
                  <div>
                    <div className="flex text-tertiary">
                      {[1, 2, 3, 4, 5].map(i => (
                        <span key={i} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <div className="text-xs text-on-surface-variant font-medium">148 Verified Appointments</div>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-container border border-outline-variant/20">
                <div>
                  <div className="flex justify-between text-xs text-on-surface mb-1 font-medium"><span>Artistry Quality</span><span className="font-bold">5.0</span></div>
                  <div className="w-full bg-outline-variant/40 rounded-full h-1.5 overflow-hidden"><div className="bg-primary h-full w-full"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-on-surface mb-1 font-medium"><span>Punctuality</span><span className="font-bold">5.0</span></div>
                  <div className="w-full bg-outline-variant/40 rounded-full h-1.5 overflow-hidden"><div className="bg-primary h-full w-full"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-on-surface mb-1 font-medium"><span>Communication</span><span className="font-bold">4.9</span></div>
                  <div className="w-full bg-outline-variant/40 rounded-full h-1.5 overflow-hidden"><div className="bg-primary h-full w-[98%]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-on-surface mb-1 font-medium"><span>Sanitization</span><span className="font-bold">5.0</span></div>
                  <div className="w-full bg-outline-variant/40 rounded-full h-1.5 overflow-hidden"><div className="bg-primary h-full w-full"></div></div>
                </div>
              </div>

              {/* Review 1 */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlrM_J5S5uurNhHHQYRpaQ0G9Tfr9uN02JMmXigkP9RbqUObJpLQe_7gUhMZkgoNXlkhff1Ni9kQO-Mx14dZELLa7CrgpNdm0VkcT9v_Sqyu3pAqmsUcvC8rFIEaRaa5ZbSSs5nVqQUUsB-aiNbqBFtIaq83JQKw6yyrqv792GVrj9cq4aqImAeJpjOkbiRYoT5pLwnG9gjDMIB_767L64Vc1Kgysx5ZX_vh3QFcNTeriAD7QhbYkq7g"
                      alt="Genevieve M."
                    />
                    <div>
                      <h5 className="text-sm text-on-surface font-semibold">Genevieve M.</h5>
                      <div className="text-xs text-on-surface-variant"><span className="text-secondary font-semibold">Verified Bride</span> • Booked Deluxe Bridal Package • Oct 18, 2024</div>
                    </div>
                  </div>
                  <div className="flex text-tertiary">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  "Aria is a true artist and calming presence on what could have been a very chaotic morning. She did my makeup along with my mother and maid of honor in Hudson Valley. Her skin prep feels like a high-end spa facial and our makeup looked immaculate until 2 AM despite humidity and endless hugs. She is worth every single dollar!"
                </p>
                <div className="bg-surface-container-low p-3 rounded-xl ml-4 text-xs border border-outline-variant/30">
                  <span className="font-semibold text-primary">Aria Sterling (Pro Response):</span> "Genevieve, it was such an absolute honor to be a part of your morning! You radiated pure elegance and light. Wishing you and Marcus endless joy!"
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 35% width Sticky Booking Card */}
          <div className="lg:col-span-4 w-full lg:sticky lg:top-24" id="booking-card">
            <div
              className="rounded-2xl shadow-xl border border-white/80 p-5 flex flex-col space-y-4 backdrop-blur-md"
              style={{ background: 'rgba(255, 248, 248, 0.85)' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                <div>
                  <span className="text-xs uppercase tracking-wider text-primary font-semibold">Direct Atelier Booking</span>
                  <h3 className="font-headline text-lg text-on-surface font-semibold">Reserve Your Date</h3>
                </div>
                <span className="px-2 py-1 rounded bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">Instant Request</span>
              </div>

              {/* Service Select Dropdown */}
              <div>
                <label className="block text-xs text-on-surface font-semibold mb-1">Selected Master Service</label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-bright text-on-surface py-2.5 px-3 rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer pr-10 border border-outline-variant/40"
                    value={selectedService.name}
                    onChange={e => {
                      const names = {
                        'Signature Soft Glam': { name: 'Signature Soft Glam', price: 185, duration: '75 min' },
                        'Deluxe Bridal Master Package': { name: 'Deluxe Bridal Master Package', price: 295, duration: '100 min' },
                        'Editorial & Commercial Creative': { name: 'Editorial & Commercial Creative', price: 350, duration: '120 min' },
                        'Bridal Trial & In-Studio Consultation': { name: 'Bridal Trial & In-Studio Consultation', price: 195, duration: '90 min' }
                      }
                      if (names[e.target.value]) setSelectedService(names[e.target.value])
                    }}
                  >
                    <option value="Signature Soft Glam">Signature Soft Glam ($185 • 75 min)</option>
                    <option value="Deluxe Bridal Master Package">Deluxe Bridal Master Package ($295 • 100 min)</option>
                    <option value="Editorial & Commercial Creative">Editorial &amp; Commercial Creative ($350 • 120 min)</option>
                    <option value="Bridal Trial & In-Studio Consultation">Bridal Trial &amp; In-Studio Consultation ($195 • 90 min)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base">expand_more</span>
                </div>
              </div>

              {/* Session Location */}
              <div>
                <label className="block text-xs text-on-surface font-semibold mb-1">Session Location</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationType('studio')}
                    className={`p-2.5 rounded-xl text-xs text-left transition-all flex flex-col justify-between cursor-pointer ${
                      locationType === 'studio'
                        ? 'bg-primary-fixed text-on-primary-fixed font-semibold shadow-sm'
                        : 'bg-surface-bright text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
                    }`}
                  >
                    <span className="flex items-center gap-1 font-semibold"><span className="material-symbols-outlined text-base">storefront</span> SoHo Studio</span>
                    <span className="text-[11px] opacity-80">No travel fee</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationType('travel')}
                    className={`p-2.5 rounded-xl text-xs text-left transition-all flex flex-col justify-between cursor-pointer ${
                      locationType === 'travel'
                        ? 'bg-primary-fixed text-on-primary-fixed font-semibold shadow-sm'
                        : 'bg-surface-bright text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
                    }`}
                  >
                    <span className="flex items-center gap-1 font-semibold"><span className="material-symbols-outlined text-base">directions_car</span> Mobile Pro</span>
                    <span className="text-[11px] opacity-80">+$40 flat travel</span>
                  </button>
                </div>
              </div>

              {/* Date & Time Picker */}
              <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-2.5 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface font-semibold">November 2025</span>
                  <div className="flex items-center gap-1">
                    <button className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-on-surface"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                    <button className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-on-surface"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1 text-center">
                  {[
                    { day: 'Thu', date: '14' },
                    { day: 'Fri', date: '15' },
                    { day: 'Sat', date: '16' },
                    { day: 'Sun', date: '17', disabled: true },
                    { day: 'Mon', date: '18' }
                  ].map(d => {
                    const fullDate = `${d.day}, Nov ${d.date}`
                    const isSelected = selectedDate === fullDate
                    return (
                      <button
                        key={d.date}
                        disabled={d.disabled}
                        onClick={() => setSelectedDate(fullDate)}
                        className={`p-1.5 rounded-lg flex flex-col items-center cursor-pointer transition-all ${
                          d.disabled
                            ? 'opacity-40 cursor-not-allowed bg-transparent'
                            : isSelected
                            ? 'bg-primary text-white shadow-sm font-semibold'
                            : 'bg-white hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <span className="text-[10px]">{d.day}</span>
                        <span className="text-xs">{d.date}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Times */}
                <div className="pt-1">
                  <span className="block text-[11px] text-on-surface-variant mb-1 font-medium">Available for {selectedDate}:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['10:00 AM', '1:30 PM', '4:00 PM'].map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-1.5 px-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer ${
                          selectedTime === time
                            ? 'bg-primary text-white font-semibold'
                            : 'bg-white text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 pt-2 text-xs text-on-surface-variant">
                <div className="flex justify-between items-center">
                  <span>{selectedService.name}</span>
                  <span className="text-on-surface font-semibold">${selectedService.price}.00</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Artisanal Add-ons</span>
                    <span className="text-on-surface font-semibold">+${addonsTotal}.00</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Location Fee ({locationType === 'studio' ? 'SoHo Studio' : 'Mobile Travel'})</span>
                  <span className="text-on-surface font-semibold">${travelFee}.00</span>
                </div>
                <div className="flex justify-between items-center text-secondary font-medium">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">verified</span> BeautyConnect Trust Guarantee</span>
                  <span>Included ($0)</span>
                </div>
                <div className="h-[1px] bg-surface-container-high my-2"></div>
                <div className="flex justify-between items-center text-on-surface">
                  <div>
                    <span className="text-sm font-bold block">Estimated Total</span>
                    <span className="text-[10px] text-on-surface-variant">State taxes calculated at final step</span>
                  </div>
                  <span className="font-headline text-xl font-bold text-primary">${totalPrice}.00</span>
                </div>
              </div>

              {/* CTA button */}
              <div className="pt-2">
                <button
                  onClick={handleBookingContinue}
                  className="w-full py-3 px-4 rounded-full bg-primary hover:bg-on-primary-fixed-variant transition-all text-xs font-semibold text-white text-center shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Booking</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
                <p className="text-[11px] text-center text-on-surface-variant mt-2">
                  <span className="material-symbols-outlined text-xs align-middle text-secondary">lock</span> Zero charge until Aria confirms your date. Free cancellation up to 48 hours prior.
                </p>
              </div>

              {/* Sanitation & Policy Accordion */}
              <div className="pt-2 border-t border-surface-container-high">
                <details className="group cursor-pointer">
                  <summary className="flex items-center justify-between text-xs text-on-surface font-semibold list-none">
                    <span>Sanitation &amp; Atelier Policies</span>
                    <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="pt-2 text-[11px] text-on-surface-variant space-y-1 leading-relaxed">
                    <p>• <strong>Sanitation:</strong> All brushes UV-sanitized and dipped in 99% isopropyl alcohol between sessions. Disposable mascara wands, lip palettes, and spatula decanting only.</p>
                    <p>• <strong>Cancellations:</strong> 100% refund up to 48 hours prior. Bridal packages retain a $50 trial prep retainer within 14 days.</p>
                    <p>• <strong>Travel:</strong> Mobile bookings outside Manhattan require a confirmed parking space or valet reimbursement.</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <span className="material-symbols-outlined text-primary-fixed text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
