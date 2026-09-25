import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function SearchPage() {
  const [mapOpen, setMapOpen] = useState(false)
  const [activeQuickFilter, setActiveQuickFilter] = useState('All Results')
  const [priceMax, setPriceMax] = useState(350)
  const [activeTimePref, setActiveTimePref] = useState('Afternoon')
  const [serviceSetting, setServiceSetting] = useState('all')

  const artists = [
    {
      id: 'aria-sterling',
      name: 'Aria Sterling',
      location: 'Manhattan • Brooklyn • On-Location Travel',
      rating: '5.0',
      reviews: 148,
      spotlight: 'Bridal Spotlight',
      bio: "Vogue and Harper's Bazaar credited bridal artisan. Known for sculptural lit-from-within complexion and tailored skin preparation rituals.",
      service1Name: 'Signature Soft Bridal Glam',
      service1Price: '$220',
      service1Time: '90m',
      service2Name: 'Red Carpet Skin & Eyes',
      service2Price: '$185',
      service2Time: '75m',
      nextSlot: 'Tomorrow, 2:00 PM',
      startPrice: '$185',
      mainImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCySapZvsf-NsnW8OL1zKbqcb4vxCrcFQ1nIsUUcKqDgwm8Je16yirSQRXf-mHXIOBqL2CohNKmy1y957H3DKO57kP8-QBfn6KhdpdPXVfitkkFrUPeA3vc7wxORH-EYrC9Kv9N3IiQlQuyZ7dKttHPexxaokMPJk5iaQ2cSfLhSvSUG9kBMPd6EayFPQCG4SGNtng-UqHjJ5iUAGRJe6MRdYQhZOoTkyQScgY2M06rJP2ZA1imIMeFoQ',
      subImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1CEhCOEHgwbcpbgXPuw0gJn5zDNtqDK5_RgPDjDTt83BnPzTpt4m-XP7PWHPktaokdSyVqW1z5ekFJG_zUxEW_Q43nsvS13PomWlNOlXSq-LfcecWVByuIJ_ZjamfqWpjT6nzCTf1zsJZADHzyh4k9e82cU7LPALqLNrVrDbfehasbcat4EQPJuTol9eD3S8uKy_j0Mu2McCABx8dTGowVT21gsB1wxRCnnG8LHt4iS6x7ef5aO9L5w',
      subImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjB0DZMrnFtXqlVp94DCOtRObCtAREKDMEqUeZ5dDFyec1vrNA9oy-QUyfRzTguarvW88q05qo3z43oR2aUsaPiREUHffJFgKX-yqOf0-rmT6U1blsobcUVQMGbSJY_a0briW5AUd6_4NXF1bDuS2Bnasp5B1DFC2AqLHUsir5MJeY5FB8EeGNpZmrDCmnBOkVqLq0mrIUveFLKhIGan-XYRRc125pAhkfK6BxBklFqbTw-j8cVcwYgQ'
    },
    {
      id: 'marcus-chen',
      name: 'Marcus Chen',
      location: 'SoHo Atelier • Travel by Request',
      rating: '4.9',
      reviews: 92,
      spotlight: null,
      bio: 'Sculptural hairstyling, couture bridal chignons, and signature glass-shine blowouts. Master educator with 12 years of runway experience.',
      service1Name: 'Couture Wedding Updo Styling',
      service1Price: '$260',
      service1Time: '90m',
      service2Name: 'Signature Editorial Blowout',
      service2Price: '$140',
      service2Time: '60m',
      nextSlot: 'Thursday, 11:30 AM',
      startPrice: '$210',
      mainImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIdwfWhi68OCp7ANd7g9yv18BEDevfDA-KF53Jc3HbspN_bwLZtB27gPMznfLkoop88cj66Hd91-hv0FxBb8xR8Q5Zk88d8ibCJx97NweuKL0Q2k4Q6FC-cViDAA3VZB_0R7bJi6Df8Gjs0Vhd84IqKIrqOCyXvSbPrXmMXtMJ7mRa2mEFPygF-B6W1nA5EqFl58MI27J3I4PUlIgYa41FfZCAeXRy9UzLfV-2CUAhFA-pBJA7PwVRGQ',
      subImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArZRmljtrlEhWji-HHDPvz1PnpCjk8S80fGvnl30OJXDaLnUXw7sO3TAl56KHrk2sXzwDD0w03u1kNcT5-2hRl_QAAR5vHgzXs_hxHzmPdFssqq2fWw_wEiICHEyLLclJxQU_WARXRRW6vSaDZyRaYfpCQ4UWeL0vutq1l29pfPG08pV8IzQJUr-2flVLNrXiOIzlJgnz-A1tQNISSVzu1IJ8PyS1s911TKKDjBU8fSeBvKVmkVSiGXA',
      subImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHSfKjyHNM_Tpb5IOQNGlzoGnCTlYw2dVxwHZRvCoJfxIzt1QAd1XtDjByveJs_qNPDJgI0CLOvEZ425AEC9ZOkSj5g2B9QK_TecHGdJoZ41x6AhnSDCqfnQA7woLmXt_8d1DNehLjB6Fx3EOoLKPAjgP2v6uyy4iEVFctJG3nM8Y167sAKfI2ESRQVYu1z0YoMgdZr1TcuKTRH5e2J41Q_ivfPA7I8Qb-3NxbyNr6FudLl-FTCJP5FA'
    },
    {
      id: 'sora-kim',
      name: 'Sora Kim',
      location: 'Lower East Side Studio Exclusive',
      rating: '5.0',
      reviews: 214,
      spotlight: null,
      bio: 'Precision structured Japanese gel overlays and freehand architectural nail art. Emphasizing natural nail health with no harsh drilling.',
      service1Name: 'Custom Tier 3 Handpainted Art',
      service1Price: '$135',
      service1Time: '90m',
      service2Name: 'Structured Gel Overlay & Cuticle Care',
      service2Price: '$95',
      service2Time: '60m',
      nextSlot: 'Friday, 10:00 AM',
      startPrice: '$95',
      mainImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpgAhS1W4HVSso5Ai8Aq966CzQyt2TnowouCxcBXYxrK3Sf-tGFaNx1yyXLkwepbsqeOmH-C3B1m4QwPkxqvKXOO6YQ87taIDi3iqBRjVE7ky7_6S47IB3PABdIHsBwvZSqNtvjpYS6-s21-7Pt_QTC66IQer2Wr2X4byWXc__OHokbqDITc8ne-n0VgsLBAdkmXJpy6ulwZH_fE0dnfcOGyxQCsA2iFy1EdJO-9TST9IBc4dG49_usg',
      subImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDg20P02vJz56EZm7N_Y7FtUxFJ7Z0Yo4BstzjFwJKr1WoYFc_sRugW-MPyGUSqhnPYH9OAYbXiuf4N6JuQN1Z5LBaQnnFxcO2f_C6FBr0ScmakKR6QxbYZGfb54mbz_rFN9GdR6Gt2urYb5AtUy9IzmY8lDgBFnvR3pUNLRsIWapMi7G2mYf-ehzx9DQdkYOU9mJV70tjnvKKXlRedlgCWtnVXFypMUb3VhEKN7D17L7Nq2x1V0Zs2rA',
      subImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIXc6IJFAhxoGdZFPQ2AvODHZCYVPb6jNNkCRxhWM-BGrUf2hnXHaccKdsWy3KlHWaZVpT4dTd4yy5js7sIx2YkW6QCp699eWKKYsEoHqqqtKBnV_zFl9BMsr0T-fssyuK_4aiOfBawyWILtDc8YwVJ19uHAogdzzEwpdT2EzwPTE8iPiTJcCn5TQPb5yRtOYg98HWSWURDIyMkZ0HI1u8avxn51ZwHB0jI-hGlix1fEhEEkwhf7ur-Q'
    },
    {
      id: 'camila-rossi',
      name: 'Camila Rossi',
      location: 'Travel Concierge Only (NYC & Hamptons)',
      rating: '4.9',
      reviews: 88,
      spotlight: null,
      bio: 'Licensed Esthetician blending lymphatic drainage massage and breathable, non-comedogenic soft glam for film, red carpet, and private clients.',
      service1Name: 'Pre-Event Lymphatic Prep & Soft Glam',
      service1Price: '$210',
      service1Time: '80m',
      service2Name: 'Gua Sha Radiance Facial Only',
      service2Price: '$160',
      service2Time: '50m',
      nextSlot: 'Tomorrow, 4:30 PM',
      startPrice: '$160',
      mainImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0ZHMmGfz6-_kH-jUBl9b_SUKGy4CnfQA6vD6va-f_MgL8xbNzm8omN4mhYdQ2Q_7f_Kf-4O72i79ts35-oelSfZrvnqieFFzxppBwq6BEnCQYkGDNHUI5KkjFzeOo3c3SsmubtPgBZiwjZYpLNMIGbEl7DzGwqKrRtB19SIMx5Pq-jzqZGBYtZw1fwXKREm2vtgtQn2RyQt9QwS7NwFZMdzr7bv_AJMbjNDhJdnfmCWq-hjAPnVOgZw',
      subImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUVajGQ0pnSkvp-hpxTbnZ7_fSl7f1atdgmf1rDLSPurDx3mTQ-iX93JIw2ZW3NKCEWFkT_fwVs26ns6okRAXvm6h_JoCBS51EntyLqrEmlLmMLWZNGFU090vflXU52VCakJIg2V0hSDd8NEdrkvUjKIVh5Okd_vmCpT_P5tk7j2N0egAnGL9iRTHfzTT3jckdxOAQC9gEcs_cvPC47OAVhV0QM_kMjd3vPoPyclxAaKHykYiQ3vr_YQ',
      subImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWs-4V9S2W1L8aRswcKt5lmpFdi_mxdItXT4tbPs3_ghwm6qPNdy2ILoQI0IWqmNNWTYE0l7G_sqp_nFatoU8U6YrRkBXiMgtJcXbrTNmPFF-Oaw4seO4vd4RFGS3A55F72NGCqeFbam2E3uxVu0DSQ5jcZ_ZqdYVtCLrnVMwJyoAkIH1zRzZJ9hVXVL5JrT3rUJ8-hN4zbAdfarOpl5E4PWhIm38f6sCXqA_V0xf0e0Rm1U0WPiO98A'
    },
    {
      id: 'david-laurent',
      name: 'David Laurent',
      location: 'Tribeca Loft • Travel Available',
      rating: '4.8',
      reviews: 64,
      spotlight: null,
      bio: 'Paris-trained hair craftsman specializing in dry cutting, effortless French bobs, and low-maintenance dimensional gloss tones.',
      service1Name: 'Bespoke Precision Dry Cut & Style',
      service1Price: '$175',
      service1Time: '60m',
      service2Name: 'Gloss & Botanical Conditioning Glaze',
      service2Price: '$120',
      service2Time: '45m',
      nextSlot: 'Saturday, 1:00 PM',
      startPrice: '$175',
      mainImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO6nM1Pu9mr8GHpzJK3wZ1ifc4kU-XX3mGEHoTDMIvhEo4t0BND3zWP5vGwcyLJFNOTQkukJiDKsr1dxpn1R0y1xM0blVpfHOjlw1pV4bkfyFM53lN1lEq_1SzX2kRtEJnvgtEirvwXwxSSPkY2H0i-SxhkDtRqHc-MOViQ_aoxUyYhq-IziaeDqurj4bq1VQm2bChUYC18sjIpsgF70YXcgN7XrvfH3DIxbj8_eVqESM2F3pHi48Dwg',
      subImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk3dpTcXeqRaBV-NqjrmH5IZABVmj2pE0k7ZHfrncyEjm9_S0Ij_0_-IFz-0RReJ4fS5IbwFXqDHyvCBs3Tkyl1VD_K7Ov-zCpe8QLKQu7NibB8sgbtUO3GMQLTu-Ydv3Dogct4nMRFDye99mcphzBf8gYUYg7lWxh3kiptxab7JZ6aR4jOjbm9D6ZC3mwyEruSldnozuf6ki2Nf4yiYRRCHeJPDk2wqenCDniOMHYVY7gjZRJ-5MZBQ',
      subImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA28w_BXaewM99rGJhj9ye1NqkOSITUYhEBvQ4U5GypyLS6DZiN-ig-QskQB3rEtgnXTwhFUlD1VKOE1lOjtU5qwm8lCEWXcJQ4lXsglC4cKSN3_vZVx5fCa_Z_BhDkVRnVmKOfrlIpazfsHoSEm34DvdbzzyQZzAG83X6K4cxNpcgsMk4C4Qtx3TXPwAc2qFRKNwOIXXbrq97Onq4gee32qyyPUbDEGWDR88CrjDQxD5xdEAOEPWwz1Q'
    },
    {
      id: 'amara-okafor',
      name: 'Amara Okafor',
      location: 'Bed-Stuy Studio • NYC Metro Travel',
      rating: '5.0',
      reviews: 116,
      spotlight: null,
      bio: 'Master of tension-free protective styles, editorial crown braiding, and gentle botanical steam therapies for textured and natural curl patterns.',
      service1Name: 'Editorial Knotless Crown Braiding',
      service1Price: '$240',
      service1Time: '150m',
      service2Name: 'Scalp Detox & Hydration Silk Wrap',
      service2Price: '$150',
      service2Time: '75m',
      nextSlot: 'Friday, 3:30 PM',
      startPrice: '$150',
      mainImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH8hXK9oxLtOCX37h_r15dKMlMiz-PPej5b4COeY-Ak6UhLPVJWieXkkrhBgNOR9Z2d5z7MbpapzIOOnpyMQkfwY51QI3z6cg2Bol1RFDzb4vmf0EcGOdArKa7vDWEfke7Kwdce6KEir-ZBPmpeabUjDWdofEOu1x4ltVXq38j0WOrRtRQCUqu-j9XS49Xo35NcqQAwXjMNURNK9hf3ICMOIOJDQJWFxp_bUgrGdXMXMszxjA6ecmyNw',
      subImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGLDA0l9TJQu6l-u-xB3GNtC31WlqvodYB3IcGBLoq2-BUJPG-iC4axFNFKcL-Lldf5KmUZFB-TI0hSXSlBTVDygjgNgeNmpUkVUSjnL_zzZ3URB1i3Zg3zFHvNgsgdZCovleBHH5lffFpJIClotMHUvsyc8_UVt9xPRsECXDP6hnYwNm3dA4jwfgLcaPNbHRIx1T0YdfaGhl31IMrH3tUDlEozDkLRxii60aygnIXLEto3aWL_F1gRA',
      subImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8O_WuC33TUwDpWeKbsGnNWav3gJX1bV877qwvcTFcFvCj2XHZTkVg_1PkV7nXlI7AXemkjVg5uezkpvqKSF_ac-h5jPUJMp-yITlmtWNu09wBtrI5XtNwRHQCQIcS6K7t_m3Zi99U_RY4wjD5aaZOaKfnkaV1gN7qis6zSWczQKAmpibB71xkEgFicyAWv30lznr_EypZmusNpiDheyN6yfeWnROJFvdvVUbCnGQI8iW9wWattsvn-w'
    }
  ]

  const quickFilters = [
    { label: 'All Results', icon: 'check' },
    { label: 'Instant Book Only', icon: 'flash_on' },
    { label: 'Travels to Client', icon: 'directions_car' },
    { label: 'Bridal Specialist', icon: 'favorite' },
    { label: 'Eco / Clean Beauty', icon: 'eco' },
    { label: 'Top Rated (4.9+)', icon: 'star' },
    { label: 'Licensed Esthetician', icon: 'verified' }
  ]

  return (
    <div className="w-full flex-1 pt-6 pb-16 bg-background text-on-surface">
      {/* Ambient Glows */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none"></div>
        <div className="absolute top-48 right-0 w-80 h-80 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 lg:px-12 py-6">
          {/* Top Query Hero & Breadcrumb Row */}
          <section className="mb-8">
            <div className="flex flex-wrap items-center gap-1.5 text-on-surface-variant text-xs mb-2">
              <span>Explore Directory</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-secondary font-semibold">New York Metropolitan Area</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-on-surface">Curated Portfolios</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-secondary-container text-xs font-semibold tracking-wider uppercase mb-2">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  Live Editorial Roster
                </div>
                <h1 className="font-headline text-3xl lg:text-4xl text-on-surface tracking-tight">
                  Curated Artists in <span className="italic font-normal text-primary">New York</span>
                </h1>
                <p className="text-base text-on-surface-variant mt-1">
                  Showing <span className="font-semibold text-on-surface">42 Verified Beauty Professionals</span> • Available This Week in Manhattan, Brooklyn &amp; Surrounds
                </p>
              </div>

              {/* Interactive Search Pill Bar & Sort Dropdown */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select className="appearance-none bg-surface-container-low text-on-surface text-xs py-2.5 pl-4 pr-10 rounded-full cursor-pointer focus:outline-none focus:bg-surface-container shadow-sm border border-outline-variant/30">
                    <option>Highest Rated (5.0 &amp; Above)</option>
                    <option>Starting Price: Low to High</option>
                    <option>Starting Price: High to Low</option>
                    <option>Most Popular (Bookings)</option>
                    <option>Distance: Closest to Current</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base">expand_more</span>
                </div>

                {/* View Map Toggle Button */}
                <button
                  onClick={() => setMapOpen(!mapOpen)}
                  className={`inline-flex items-center gap-1.5 font-semibold text-xs px-4 py-2.5 rounded-full transition-colors shadow-sm cursor-pointer ${
                    mapOpen ? 'bg-on-secondary-container text-white' : 'bg-secondary text-white hover:bg-on-secondary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">map</span>
                  <span>{mapOpen ? 'Hide Map View' : 'View Map Preview'}</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-2 no-scrollbar">
              {quickFilters.map(filter => (
                <button
                  key={filter.label}
                  onClick={() => setActiveQuickFilter(filter.label)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                    activeQuickFilter === filter.label
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Interactive Map Panel (Collapsible/Toggled) */}
          {mapOpen && (
            <section className="mb-8 transition-all duration-300">
              <div className="bg-surface-container-low rounded-2xl p-4 shadow-md border border-white/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">pin_drop</span>
                    <h3 className="text-base font-semibold text-on-surface">Ateliers &amp; Travel Zones in Greater New York</h3>
                  </div>
                  <div className="flex items-center gap-4 text-on-surface-variant text-xs">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span> Private Studio</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span> Travel Concierge</span>
                  </div>
                </div>
                <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-inner">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_ZPyYNHP-4rxcoTdyqFpClkLOYDBTMsW13Z3x3f-PNspAnI9xYsQHG10vu7tYf4hqNhovQdJiHj-E01-gJwq65BnRlNvsTeSModhJiKkZtiSvSgyeEgwO42gfgs3KBC2-Thgucd7gT8FkV3CqDYHLs9n8AeSp8MX3p0aDdVI6xxhyICkBVaqwvd-erTqcHWFrb2NSnm0chNEy-mS_h-jDSaKOfuwaO9MSeCAUJUJ7QBIQXMy2C7v0Iw')` }}
                  ></div>
                  <div className="absolute top-6 left-12 bg-white/95 backdrop-blur-md rounded-lg p-3 shadow-md flex items-center gap-2 pointer-events-none">
                    <span className="material-symbols-outlined text-primary text-base">switch_video</span>
                    <div>
                      <p className="text-xs font-semibold text-on-surface">SoHo Atelier Cluster</p>
                      <p className="text-[10px] text-on-surface-variant">14 Active Artists</p>
                    </div>
                  </div>
                  <div className="absolute bottom-8 right-16 bg-white/95 backdrop-blur-md rounded-lg p-3 shadow-md flex items-center gap-2 pointer-events-none">
                    <span className="material-symbols-outlined text-secondary text-base">directions_car</span>
                    <div>
                      <p className="text-xs font-semibold text-on-surface">Brooklyn On-Location</p>
                      <p className="text-[10px] text-on-surface-variant">Instant Travel Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Main Layout: Sidebar & Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ==================== LEFT FILTER SIDEBAR ==================== */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
              <div
                className="rounded-2xl p-6 shadow-sm backdrop-blur-md border border-white/60"
                style={{ background: 'rgba(255, 248, 248, 0.72)', boxShadow: 'rgba(149, 71, 65, 0.05) 0px 8px 32px 0px' }}
              >
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/30">
                  <h2 className="text-lg text-on-surface font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">tune</span>
                    Filter Artists
                  </h2>
                  <button className="text-xs text-secondary hover:text-primary transition-colors font-medium cursor-pointer">Reset All</button>
                </div>

                {/* Service Categories */}
                <div className="space-y-3 mb-6">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold block">Service Discipline</span>
                  
                  {/* Makeup Group */}
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2.5">
                        <input defaultChecked className="w-4 h-4 rounded text-primary accent-primary cursor-pointer" type="checkbox" />
                        <span className="text-sm text-on-surface font-medium group-hover:text-primary transition-colors">Makeup Artistry</span>
                      </div>
                      <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">24</span>
                    </label>
                    <div className="pl-7 space-y-1 text-on-surface-variant text-xs">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-on-surface">
                        <input defaultChecked className="w-3.5 h-3.5 rounded text-primary accent-primary" type="checkbox" />
                        <span>Bridal &amp; Nuptial</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-on-surface">
                        <input defaultChecked className="w-3.5 h-3.5 rounded text-primary accent-primary" type="checkbox" />
                        <span>Editorial &amp; Runway</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-on-surface">
                        <input className="w-3.5 h-3.5 rounded text-primary accent-primary" type="checkbox" />
                        <span>Soft Natural Glam</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-on-surface">
                        <input className="w-3.5 h-3.5 rounded text-primary accent-primary" type="checkbox" />
                        <span>SFX &amp; Performance</span>
                      </label>
                    </div>
                  </div>

                  {/* Hair Group */}
                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2.5">
                        <input defaultChecked className="w-4 h-4 rounded text-primary accent-primary cursor-pointer" type="checkbox" />
                        <span className="text-sm text-on-surface font-medium group-hover:text-primary transition-colors">Hair &amp; Updo Architecture</span>
                      </div>
                      <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">18</span>
                    </label>
                    <div className="pl-7 space-y-1 text-on-surface-variant text-xs">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-on-surface">
                        <input defaultChecked className="w-3.5 h-3.5 rounded text-primary accent-primary" type="checkbox" />
                        <span>Couture Updos</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-on-surface">
                        <input className="w-3.5 h-3.5 rounded text-primary accent-primary" type="checkbox" />
                        <span>Textured &amp; Protective Styles</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-on-surface">
                        <input className="w-3.5 h-3.5 rounded text-primary accent-primary" type="checkbox" />
                        <span>Signature Blowouts</span>
                      </label>
                    </div>
                  </div>

                  {/* Nails */}
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input defaultChecked className="w-4 h-4 rounded text-primary accent-primary cursor-pointer" type="checkbox" />
                      <span className="text-sm text-on-surface font-medium">Japanese Gel &amp; Editorial Nails</span>
                    </div>
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">9</span>
                  </label>

                  {/* Skincare */}
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input className="w-4 h-4 rounded text-primary accent-primary cursor-pointer" type="checkbox" />
                      <span className="text-sm text-on-surface font-medium">Skincare &amp; Holistic Facials</span>
                    </div>
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">11</span>
                  </label>

                  {/* Lashes */}
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input className="w-4 h-4 rounded text-primary accent-primary cursor-pointer" type="checkbox" />
                      <span className="text-sm text-on-surface font-medium">Lash &amp; Brow Sculpting</span>
                    </div>
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">7</span>
                  </label>
                </div>

                {/* Service Location Type */}
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold block mb-2">Service Setting</span>
                  <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-1 rounded-xl">
                    <button
                      onClick={() => setServiceSetting('all')}
                      className={`py-2 px-3 rounded-lg text-center text-xs font-semibold transition-colors cursor-pointer ${
                        serviceSetting === 'all' ? 'bg-surface-bright text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      All Locations
                    </button>
                    <button
                      onClick={() => setServiceSetting('travel')}
                      className={`py-2 px-3 rounded-lg text-center text-xs font-semibold transition-colors cursor-pointer ${
                        serviceSetting === 'travel' ? 'bg-surface-bright text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Travel Only
                    </button>
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs uppercase tracking-wider text-on-surface font-bold">Starting Price</span>
                    <span className="text-xs font-bold text-primary bg-primary-fixed/60 px-2 py-0.5 rounded-md">$50 – ${priceMax}+</span>
                  </div>
                  <input
                    className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                    max="500"
                    min="50"
                    type="range"
                    value={priceMax}
                    onChange={e => setPriceMax(Number(e.target.value))}
                  />
                  <div className="flex items-center gap-2 mt-2.5">
                    <div className="flex-1 bg-surface-bright px-3 py-2 rounded-xl flex items-center gap-1.5 border border-outline-variant shadow-sm focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
                      <span className="text-on-surface-variant text-xs font-semibold">$</span>
                      <input
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: '600' }}
                        type="number"
                        defaultValue="50"
                      />
                    </div>
                    <span className="text-on-surface-variant text-xs font-medium px-1">to</span>
                    <div className="flex-1 bg-surface-bright px-3 py-2 rounded-xl flex items-center gap-1.5 border border-outline-variant shadow-sm focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
                      <span className="text-on-surface-variant text-xs font-semibold">$</span>
                      <input
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: '600' }}
                        type="number"
                        value={priceMax}
                        onChange={e => setPriceMax(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Desired Date & Time */}
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-wider text-on-surface font-bold block mb-1.5">Desired Date</span>
                  <div className="flex items-center gap-2 bg-surface-bright px-3 py-2.5 rounded-xl mb-3 border border-outline-variant shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-all">
                    <span className="material-symbols-outlined text-secondary text-base">calendar_today</span>
                    <input
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.75rem', color: 'var(--on-surface)', fontWeight: '500', cursor: 'pointer' }}
                      readOnly
                      type="text"
                      defaultValue="This Week (Oct 24 - Oct 30)"
                    />
                  </div>

                  <span className="text-xs uppercase tracking-wider text-on-surface font-bold mb-1.5 block">Time Preference</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Morning', 'Afternoon', 'Evening'].map(time => (
                      <button
                        key={time}
                        onClick={() => setActiveTimePref(time)}
                        className={`py-2 px-2 rounded-xl text-xs transition-all text-center cursor-pointer font-medium ${
                          activeTimePref === time
                            ? 'bg-primary text-white font-semibold shadow-sm'
                            : 'bg-surface-bright border border-outline-variant/60 text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality & Safety Assurance */}
                <div className="mb-6 space-y-3">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold block">Quality &amp; Safety Assurance</span>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-on-surface font-medium">Verified Pro Guarantee</span>
                      <span className="text-[11px] text-on-surface-variant">Identity &amp; artistry vetted</span>
                    </div>
                    <div className="w-10 h-5 bg-secondary rounded-full flex items-center px-0.5 cursor-pointer">
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm ml-auto"></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-on-surface font-medium">Licensed Cosmetologist</span>
                      <span className="text-[11px] text-on-surface-variant">Official state board license</span>
                    </div>
                    <div className="w-10 h-5 bg-secondary rounded-full flex items-center px-0.5 cursor-pointer">
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm ml-auto"></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-on-surface font-medium">Accepts Same-Day</span>
                      <span className="text-[11px] text-on-surface-variant">Emergency or last-minute</span>
                    </div>
                    <div className="w-10 h-5 bg-surface-container-high rounded-full flex items-center px-0.5 cursor-pointer">
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                    </div>
                  </div>
                </div>

                {/* Travel Radius */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Service Radius</span>
                    <span className="text-xs font-semibold text-secondary">Within 15 Miles</span>
                  </div>
                  <input className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-secondary" defaultValue="15" max="50" min="5" type="range" />
                  <div className="flex justify-between text-[11px] text-on-surface-variant mt-1">
                    <span>5 mi</span>
                    <span>25 mi</span>
                    <span>50 mi</span>
                  </div>
                </div>
              </div>

              {/* Editorial Tip Banner */}
              <div
                className="rounded-2xl p-4 shadow-sm backdrop-blur-md border border-white/60"
                style={{ background: 'rgba(252, 241, 242, 0.72)', boxShadow: 'rgba(149, 71, 65, 0.04) 0px 4px 20px 0px' }}
              >
                <div className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-secondary text-2xl">auto_stories</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-on-surface">The Editorial Standard</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Portfolios in BeautyConnect are curated against high-fashion lighting and authentic un-retouched skin textures. You always book the hand that crafted the image.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* ==================== SEARCH RESULTS GRID ==================== */}
            <main className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* 6 Editorial Lookbook Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {artists.map(artist => (
                  <article
                    key={artist.id}
                    className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group backdrop-blur-md border border-white/70"
                    style={{ background: 'rgba(255, 248, 248, 0.82)', boxShadow: 'rgba(134, 82, 37, 0.06) 0px 4px 20px -2px' }}
                  >
                    {/* Lookbook Mini-Mosaic Header */}
                    <div className="p-3 bg-surface-container-low">
                      <div className="grid grid-cols-12 gap-2 h-64 rounded-xl overflow-hidden">
                        {/* Main Image */}
                        <div className="col-span-8 h-full relative overflow-hidden group-hover:opacity-95 transition-opacity">
                          <img
                            src={artist.mainImg}
                            alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5">
                            <span className="inline-flex items-center gap-1 bg-surface-bright/95 backdrop-blur-md px-2.5 py-1 rounded-full text-secondary text-xs font-semibold shadow-sm">
                              <span className="material-symbols-outlined text-sm">verified</span>
                              Verified Pro
                            </span>
                          </div>
                          {artist.spotlight && (
                            <div className="absolute bottom-2.5 left-2.5 bg-inverse-surface/85 backdrop-blur-sm text-inverse-on-surface px-2 py-0.5 rounded text-[11px] uppercase tracking-wider font-medium">
                              {artist.spotlight}
                            </div>
                          )}
                        </div>

                        {/* Stacked Images */}
                        <div className="col-span-4 flex flex-col gap-2 h-full">
                          <div className="h-1/2 overflow-hidden rounded-r-lg">
                            <img
                              src={artist.subImg1}
                              alt=""
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="h-1/2 overflow-hidden rounded-r-lg">
                            <img
                              src={artist.subImg2}
                              alt=""
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="font-semibold text-lg text-on-surface group-hover:text-primary transition-colors">
                              {artist.name}
                            </h3>
                            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-sm text-secondary">location_on</span>
                              {artist.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-full text-on-surface">
                            <span className="material-symbols-outlined text-sm text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-xs font-bold">{artist.rating}</span>
                            <span className="text-[11px] text-on-surface-variant">({artist.reviews})</span>
                          </div>
                        </div>

                        <p className="text-xs text-on-surface-variant line-clamp-2 mt-2 leading-relaxed">
                          {artist.bio}
                        </p>

                        {/* Key Services Snippet */}
                        <div className="mt-3 space-y-1.5 bg-surface-container-low/60 p-2.5 rounded-xl border border-outline-variant/20">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-on-surface truncate">{artist.service1Name}</span>
                            <span className="font-semibold text-primary ml-2">{artist.service1Price} <span className="text-[11px] font-normal text-on-surface-variant">/ {artist.service1Time}</span></span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-on-surface truncate">{artist.service2Name}</span>
                            <span className="font-semibold text-primary ml-2">{artist.service2Price} <span className="text-[11px] font-normal text-on-surface-variant">/ {artist.service2Time}</span></span>
                          </div>
                        </div>

                        {/* Next Availability */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            Next: {artist.nextSlot}
                          </span>
                          <span className="text-on-surface-variant text-[11px]">Starts at {artist.startPrice}</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-4 mt-3 flex items-center gap-2 border-t border-surface-container">
                        <Link
                          to={`/booking?artist=${artist.id}`}
                          className="flex-1 py-2 px-3 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors text-center shadow-sm"
                        >
                          Book Service
                        </Link>
                        <Link
                          to={`/artist/${artist.id}`}
                          className="py-2 px-4 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold text-center"
                        >
                          Lookbook
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination & Counter */}
              <div
                className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl shadow-sm border border-white/65"
                style={{ background: 'rgba(255, 248, 248, 0.75)' }}
              >
                <span className="text-xs text-on-surface-variant">
                  Showing 1 – 6 of 42 Available Artists
                </span>
                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 cursor-pointer" disabled>
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                  </button>
                  <button className="w-9 h-9 rounded-full bg-primary text-white text-xs font-semibold shadow-sm cursor-pointer">1</button>
                  <button className="w-9 h-9 rounded-full bg-surface-container text-on-surface text-xs hover:bg-surface-container-high transition-colors cursor-pointer">2</button>
                  <button className="w-9 h-9 rounded-full bg-surface-container text-on-surface text-xs hover:bg-surface-container-high transition-colors cursor-pointer">3</button>
                  <span className="text-on-surface-variant px-1 text-xs">...</span>
                  <button className="w-9 h-9 rounded-full bg-surface-container text-on-surface text-xs hover:bg-surface-container-high transition-colors cursor-pointer">7</button>
                  <button className="w-9 h-9 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Trust & Authenticity Security Callout */}
              <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm border border-outline-variant/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                  </div>
                  <div>
                    <h4 className="text-sm text-on-surface font-semibold">100% Identity &amp; Skill Vetted Professionals</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      All professionals have passed comprehensive state licensing verification, hygiene standard checks, and editorial portfolio audits.
                    </p>
                  </div>
                </div>
                <Link to="/#how-it-works" className="shrink-0 text-xs text-secondary hover:text-primary font-semibold transition-colors flex items-center gap-1">
                  Read Our Quality Code
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
