import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Header */}
      <header
        className="fixed top-0 inset-x-0 z-50 bg-surface-bright/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.03)]"
        style={{
          backgroundColor: 'rgba(255, 248, 248, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 20px -2px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link className="flex items-center gap-2 group" to="/">
              <img
                alt="BeautyConnect Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WFQOM9PVQ-graz7eJRdLou2nVFIJ1rWA2qS9pMBhPqIWcs1fBJzDG8v23v8_iIVom1epEJtQyHbYDmECaY77cOrOwZRt444uXEt1GoPfwxCht7K7HF-7Vb8yWFJk5X9VIVCC2v_WxGZl32aUMXlsRDmj1Qm2nlQ-QmG8spgW63uTgMfi4slE6nncAzcQ8nxcXunmwoMB_ndeJmo-Bw-wWMMHvYHFwmm7EDAIYLPKHJFPCJIHOIS2-0jjGi"
              />
              <span className="font-headline text-2xl tracking-tight text-on-surface font-semibold group-hover:text-primary transition-colors">
                BeautyConnect
              </span>
            </Link>
            <nav className="hidden lg:flex items-center gap-6 ml-4">
              <Link aria-current="page" className="transition-colors py-1 text-primary font-semibold text-sm" to="/">
                Explore Services
              </Link>
              <Link className="text-sm text-on-surface-variant hover:text-on-surface transition-colors py-1" to="/search">
                Featured Artists
              </Link>
              <Link className="text-sm text-on-surface-variant hover:text-on-surface transition-colors py-1" to="/search">
                Bridal &amp; Editorial
              </Link>
              <a className="text-sm text-on-surface-variant hover:text-on-surface transition-colors py-1" href="#how-it-works">
                How It Works
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              className="hidden sm:inline-flex items-center justify-center text-sm font-medium text-on-surface px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
              to="/register"
            >
              Become a Pro
            </Link>
            <button
              aria-label="Saved Artists"
              className="relative p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[22px] leading-none block">favorite</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface-bright"></span>
            </button>
            <div className="flex items-center gap-2 pl-1">
              <Link to="/login" className="relative group flex items-center gap-2 cursor-pointer py-1">
                <img
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXxY2EkNWM8zo9MGJG_-jQByr_fQYVCNA-qKTCEHLoISPGPV5YNUVm12nIi6UzsQEKwxcs31LzpJZqWf1oSRlkf0sR0kcLK7n_AnvfZpWtyIn7ikXpwqhi2OzF0XNCFCL_f5kY0mtIPz9Lr1Go1R4gdjYVj4wvp548t7_cQdx-djGuZzZcUsYDrTC1-CHG0qWsxJ8kTZkH4EJkCXOxuFPzopHmYp-BWEIJ3TR7k8ZWbxecx5I65k_kDA"
                />
                <div className="hidden md:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] leading-4 text-on-surface font-medium">Elena Vance</span>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">expand_more</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-secondary font-semibold">Customer View</span>
                </div>
              </Link>
              <Link
                className="hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold text-on-secondary bg-secondary hover:bg-on-secondary-container px-2.5 py-1 rounded-full transition-colors"
                to="/pro-dashboard"
              >
                <span className="material-symbols-outlined text-xs leading-none">sync_alt</span>
                <span>Pro Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="w-full flex-1 pt-20 bg-background">
        <div className="flex flex-col w-full">
          {/* HERO SECTION */}
          <section className="relative w-full -mt-20 pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-background">
            <div className="absolute -top-16 -left-20 w-96 h-96 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/3 -right-24 w-[30rem] h-[30rem] rounded-full bg-secondary-fixed/25 blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
              <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                {/* Editorial Micro Kicker */}
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-surface-container-high/80 text-on-surface-variant text-[11px] uppercase tracking-widest shadow-sm mb-4 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span>Independent Freelance Collective</span>
                  <span className="text-outline-variant font-normal">/</span>
                  <span className="text-primary font-semibold">Season Lookbook 2025</span>
                </div>

                {/* High-Contrast Headline */}
                <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl text-on-surface tracking-tight max-w-3xl leading-tight font-semibold">
                  Exceptional Beauty Artistry, <br className="hidden sm:inline" />
                  <span className="italic font-normal text-primary">Curated for You.</span>
                </h1>

                {/* Subtitle */}
                <p className="mt-4 text-on-surface-variant text-base sm:text-lg max-w-2xl leading-relaxed">
                  Connect directly with verified independent freelance makeup artists, couture hair sculptors, and aesthetic specialists for on-demand atelier appointments or luxury travel directly to your door.
                </p>

                {/* FLOATING MULTI-PARAMETER SEARCH BAR */}
                <div
                  className="w-full mt-10 bg-surface-container-lowest rounded-2xl shadow-xl p-2 sm:p-4 transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    boxShadow: 'rgba(149, 71, 65, 0.08) 0px 20px 40px -15px, rgba(0, 0, 0, 0.05) 0px 1px 3px',
                  }}
                >
                  <form
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-left"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    {/* Specialty Selector */}
                    <div className="md:col-span-4 bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl p-3 flex flex-col justify-center">
                      <label className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-primary">palette</span>
                        Specialty Craft
                      </label>
                      <div className="relative mt-0.5">
                        <select className="w-full bg-transparent text-base font-semibold text-on-surface outline-none cursor-pointer appearance-none pr-6 truncate">
                          <option defaultValue="Bridal & Event Glam">Bridal &amp; Event Glam</option>
                          <option>Editorial Couture Hair</option>
                          <option>Minimalist Gel &amp; Nail Art</option>
                          <option>Clean Skincare &amp; Facials</option>
                          <option>Aesthetic Lash &amp; Brow</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                          unfold_more
                        </span>
                      </div>
                    </div>

                    {/* Location Selector */}
                    <div className="md:col-span-3 bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl p-3 flex flex-col justify-center">
                      <label className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-secondary">location_on</span>
                        Location or Studio
                      </label>
                      <div className="relative mt-0.5">
                        <input
                          className="w-full bg-transparent text-base font-semibold text-on-surface placeholder:text-on-surface-variant/60 outline-none truncate"
                          placeholder="e.g. SoHo, Manhattan"
                          type="text"
                          defaultValue="Manhattan, NY • In-Studio"
                        />
                      </div>
                    </div>

                    {/* Date / Time */}
                    <div className="md:col-span-3 bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl p-3 flex flex-col justify-center">
                      <label className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-tertiary">calendar_today</span>
                        Appointment Time
                      </label>
                      <div className="relative mt-0.5 flex items-center justify-between">
                        <span className="text-base font-semibold text-on-surface truncate">This Weekend (Sat/Sun)</span>
                        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
                      </div>
                    </div>

                    {/* Search CTA Button */}
                    <div className="md:col-span-2 h-full flex">
                      <Link
                        to="/search"
                        className="w-full h-14 md:h-full rounded-xl bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-semibold text-base flex items-center justify-center gap-1 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[20px]">search</span>
                        <span>Discover</span>
                      </Link>
                    </div>
                  </form>
                </div>

                {/* Trust Badges Under Search */}
                <div className="w-full mt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-on-surface-variant text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    <span>100% Verified Identity &amp; Licensure</span>
                  </div>
                  <span className="hidden sm:inline text-outline-variant font-thin">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[18px]">receipt_long</span>
                    <span>Transparent Pricing &amp; No Hidden Fees</span>
                  </div>
                  <span className="hidden sm:inline text-outline-variant font-thin">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">lock</span>
                    <span>Protected Stripe Escrow Payments</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* EDITORIAL CATEGORIES SECTION */}
          <section className="w-full py-12 bg-surface-container-low/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-secondary tracking-widest uppercase font-semibold">01 / Curated Disciplines</span>
                    <div className="h-[1px] w-12 bg-secondary-container"></div>
                  </div>
                  <h2 className="font-headline text-3xl sm:text-4xl text-on-surface tracking-tight font-semibold">
                    Artisanal Specialties
                  </h2>
                </div>
                <p className="text-sm text-on-surface-variant max-w-md">
                  Meticulously categorized crafts. Each portfolio undergoes strict aesthetic scrutiny before publication.
                </p>
              </div>

              {/* Bento 5-Category Mosaic */}
              <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
                {/* Category 1: Bridal */}
                <Link
                  to="/search"
                  className="group md:col-span-3 lg:col-span-4 relative rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end min-h-[360px]"
                  style={{
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: 'rgba(0, 0, 0, 0.04) 0px 4px 20px -2px',
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDnT6YyV3HUNYkcUyvMzDafcIYIvkB0Y9ZYeersuuzp7PWBk2x311ruGHltxxDLSjKRNRtIyxnRhKHpxYjh93ya_4Cgbfo_Xwus_VBj5ImOIinA10oQF4ygZA4p0wy5zVcs6gz443c-mwjnLLLh7qQfCBoVdD5uQGJYniesFQJMJ5PaC2yZ0c2QnyK6ZIg7tRElINDAQJ3xe2E0ubpnl8E3WlHc_WmhVnaeqiIjbFvzHFnFIPrlcgDtgw')",
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/30 to-transparent"></div>
                  <div className="relative z-10 p-6 text-surface-bright">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-bright/20 backdrop-blur-md text-[11px] uppercase tracking-wider font-semibold inline-block mb-1">
                      Couture Bridal
                    </span>
                    <h3 className="font-headline text-xl tracking-tight text-white group-hover:text-primary-fixed transition-colors font-semibold">
                      Bridal &amp; Gala Glam
                    </h3>
                    <p className="text-surface-dim mt-1 text-sm line-clamp-2">
                      Tailored lookbooks, heirloom trials, and full bridal party styling suites.
                    </p>
                    <div className="mt-4 flex items-center text-primary-fixed-dim text-sm font-medium group-hover:translate-x-1 transition-transform">
                      <span>Explore 140+ Artists</span>
                      <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                    </div>
                  </div>
                </Link>

                {/* Category 2: Hair */}
                <Link
                  to="/search"
                  className="group md:col-span-3 lg:col-span-4 relative rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end min-h-[360px]"
                  style={{
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: 'rgba(0, 0, 0, 0.04) 0px 4px 20px -2px',
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBq-XLsx1linSfhcfeDUuVoHFkDTRmPIte2ugEGwps3W2NRcCgvxOI-fknrTu5OwsYxM_Vv-EngrHb_0ZI1X5YgRuJnyN8aeKkbyqbqx4plEb2qRbgAkgbuwDEZVujC5FU4fsoBsb56On8RFsD_9r5RNG4Zeiz5DJpBNl5Clqkwb0Kjh0YylJ1Tr22je3t2yXpOfq-xuKY-78zlya1e1ot7Bo69T9GI269B8BoXuQ8MePxRugPunK-Irg')",
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/30 to-transparent"></div>
                  <div className="relative z-10 p-6 text-surface-bright">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-bright/20 backdrop-blur-md text-[11px] uppercase tracking-wider font-semibold inline-block mb-1">
                      Sculpt &amp; Texture
                    </span>
                    <h3 className="font-headline text-xl tracking-tight text-white group-hover:text-primary-fixed transition-colors font-semibold">
                      Editorial Hair Styling
                    </h3>
                    <p className="text-surface-dim mt-1 text-sm line-clamp-2">
                      Runway-trained sculptors, botanical balayage, and dimensional cuts.
                    </p>
                    <div className="mt-4 flex items-center text-primary-fixed-dim text-sm font-medium group-hover:translate-x-1 transition-transform">
                      <span>Explore 96 Artists</span>
                      <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                    </div>
                  </div>
                </Link>

                {/* Category 3: Nails */}
                <Link
                  to="/search"
                  className="group md:col-span-6 lg:col-span-4 relative rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end min-h-[360px]"
                  style={{
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: 'rgba(0, 0, 0, 0.04) 0px 4px 20px -2px',
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4tU98_9h9066LvE2XSmx1_HG3wZl2fu1u5ARwQmO5flthUR3f2uIB4_tnlqloRd4yeu0QSp93_MWfK148ZeFdeIu1I5il5YavHuEjYix-UH2GdGmpTPcDtLKd_-G_JtcP4xEKfrPwD6WrPVJ-QtoLs2nE4Xb-XE0j0mAtjXyK963hX4Hz-pdnLmrsnTYOIdgC9jkjHQhnZdvHIbHyUTh6BzpLv11Zm9atVQjzAq_1kkSC-Csr54D-Wg')",
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/30 to-transparent"></div>
                  <div className="relative z-10 p-6 text-surface-bright">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-bright/20 backdrop-blur-md text-[11px] uppercase tracking-wider font-semibold inline-block mb-1">
                      Atelier Detail
                    </span>
                    <h3 className="font-headline text-xl tracking-tight text-white group-hover:text-primary-fixed transition-colors font-semibold">
                      Nail Architecture &amp; Art
                    </h3>
                    <p className="text-surface-dim mt-1 text-sm line-clamp-2">
                      Apres gel-x, non-toxic Russian manicures, and bespoke hand-painted motifs.
                    </p>
                    <div className="mt-4 flex items-center text-primary-fixed-dim text-sm font-medium group-hover:translate-x-1 transition-transform">
                      <span>Explore 78 Ateliers</span>
                      <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                    </div>
                  </div>
                </Link>

                {/* Category 4: Skincare */}
                <Link
                  to="/search"
                  className="group md:col-span-3 lg:col-span-6 relative rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end min-h-[280px]"
                  style={{
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: 'rgba(0, 0, 0, 0.04) 0px 4px 20px -2px',
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAt5o-9gevPvkpcUSGif3oi_mH5wJ9DEyjq_Enazh1lK9Q_5AyWxu7TdR3Qzr8Gy-X3Q1gbUXYLbiAcuFctX7Km_J9hQ4Kvgjlcekia5_yMdIyN9DQprw5skqTyeJpQ5KOSJoTOf7-sIvAIyvwZlBxOrLwPA6WXKefDUq2aar-YEMILhj7ln7cJWmBQ0NS5dNWscwj-7KKOJJxoQ8tBwfhKwCdaBdzfB9pCjTmTlqHrWju4voxNCgyrWw')",
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/20 to-transparent"></div>
                  <div className="relative z-10 p-6 text-surface-bright">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-bright/20 backdrop-blur-md text-[11px] uppercase tracking-wider font-semibold inline-block mb-1">
                          Dermal Holism
                        </span>
                        <h3 className="font-headline text-xl tracking-tight text-white group-hover:text-primary-fixed transition-colors font-semibold">
                          Skincare Prep &amp; Glow Facials
                        </h3>
                        <p className="text-surface-dim mt-1 text-sm">
                          Lymphatic drainage, buccal sculpting, and restorative chemical peels.
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-primary-fixed p-3 rounded-full bg-surface-container-lowest/20 backdrop-blur-md">
                        spa
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Category 5: Lash & Brow */}
                <Link
                  to="/search"
                  className="group md:col-span-3 lg:col-span-6 relative rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end min-h-[280px]"
                  style={{
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: 'rgba(0, 0, 0, 0.04) 0px 4px 20px -2px',
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA05WeTn5hBCQmA9ikom_GiW-_ZoAHT7OLpIIG5O_I1l_OdJW-a81pqySj-gG-9yVIlLS6kWIvKNeUWaVcIjiBvSJlBURsEG_kZFcHyMrjVkkUBDepo4_kNZje5AfD_jDPNljkE1WhdJyOTqNbssMXmhm6HMGHY7ImZtvq4bxNNW3iocp4cOkHzfWWLm2VNCqDggf4GVp2Ke1MhoAGYu1PJswSQ3SWfMhsgy9bk-msKxRT03E2H_PZEog')",
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/20 to-transparent"></div>
                  <div className="relative z-10 p-6 text-surface-bright">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-bright/20 backdrop-blur-md text-[11px] uppercase tracking-wider font-semibold inline-block mb-1">
                          Facial Geometry
                        </span>
                        <h3 className="font-headline text-xl tracking-tight text-white group-hover:text-primary-fixed transition-colors font-semibold">
                          Editorial Lash &amp; Brow
                        </h3>
                        <p className="text-surface-dim mt-1 text-sm">
                          Keratin lash infills, hyper-realistic micro-stroking, and tailored lamination.
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-primary-fixed p-3 rounded-full bg-surface-container-lowest/20 backdrop-blur-md">
                        visibility
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* FEATURED ARTISTS SECTION */}
          <section className="w-full py-12 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-secondary tracking-widest uppercase font-semibold">02 / Verified Masters</span>
                    <div className="h-[1px] w-12 bg-secondary-container"></div>
                  </div>
                  <h2 className="font-headline text-3xl sm:text-4xl text-on-surface tracking-tight font-semibold">
                    Featured Artists of the Month
                  </h2>
                </div>

                {/* Filter Pills Bar */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-sm font-semibold transition-all">
                    All Curations
                  </button>
                  <button className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high text-sm font-medium transition-all">
                    Manhattan In-Studio
                  </button>
                  <button className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high text-sm font-medium transition-all">
                    Travel to Client
                  </button>
                  <button className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high text-sm font-medium transition-all">
                    Bridal Specialist
                  </button>
                </div>
              </div>

              {/* Artist Cards Grid (4 Featured Profiles) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Artist 1: Aria Sterling */}
                <div
                  className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(14px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 24px -1px',
                  }}
                >
                  <div className="p-2 pb-0">
                    <div className="grid grid-cols-5 gap-1.5 h-64 rounded-xl overflow-hidden">
                      <div className="col-span-3 h-full overflow-hidden">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt="Master bridal makeup portrait"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDASeuys3z8sD6DyehqmblNd70k943VMYAjxnoRVuuYemm6BsHm4g_Lh7A7lUu-lNJNAoPWzuB6heYYvWqhuWLIqIAWN4U_iIckcGTRr1gUjPqVdi9r3Cw-Hvuw0UMWQVdlCNz-3Q3SQmT7qPIorwNKJoAy1If29vYODQnjZ7SF78nvLf83CabRUjGDA0mu2rctougU9NMcY-c5yYssebVpM0NtcLDz5kkbKo746rM-mQZWLz5Oaac5IA"
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-1.5 h-full">
                        <div className="h-1/2 overflow-hidden">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Close-up macro eye makeup"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe1XQxIznvzkoUL2d2MBn9reFkpx9U5yo633uc9NQfX5hzNA5CY_ZbiLsXgeBZtJS0aEsOsCT2rKgYmJeklp16ae4THnvXOvmeCd8sALLvtbMmzwwW1bBwcrkNBn4MkHkSu1WkFLLg7aOQkXLn-VTP6_VgmMBV1TS4WGZwalbon_BVSn7KQBEzYA2DS0lhmAWedVQffx84g2h3lk_Zb0Jxp6m1gm2EIbljVLCp2oqwKhW9mY1_Fx9zJw"
                          />
                        </div>
                        <div className="h-1/2 overflow-hidden">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Lip detail photo"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8Oh1D1hp_QuQyMOd4WQqT8nt6x6njLEtE860yAIguIHcXAjy0M0N6QxxJUuZrF38zD2Xd6Se5ZdhZFSJNLldXAgexLgxve0B4Y_LUrkT8HHXjV-sBDjzUoPSEkxNuPf6rp3DnsT1Ojq00CigZgzwpxXS6yHA1PW_M4i-QrijpoOM3zu3gam3ZoJtlnxybw0oa159X6sNl5hNhNgJ8ZbYrNrcNv5cyRl6n7ubLY0c0P3-nDWZvQIstZA"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0"
                            alt="Aria Sterling"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcftkZUCd2x7jlZN2Z_3AzZavNR-HsS2Di9aVC7n3iMQk8_c5o1txA5yy8sJvnVQDS_Dep7cbvpCjd85w5TcIvMOCJkFWY8GAKQcjDd1fRFqpXR6lRqdYvE4fkV1J8_T24H-jL6MiR5nWVT_pXAR-3bIldWXiEZ5uH9qOSUCBGL6A14piYD9nzpABRpYIxLWQMgf4Cea8Ow9-HXV2S-2-70HwdnrRI-8NlasuvL6BTcDpT5PY1ixmw2w"
                          />
                          <div className="min-w-0">
                            <h4 className="text-base font-semibold text-on-surface truncate">Aria Sterling</h4>
                            <p className="text-[12px] text-on-surface-variant truncate">Master Bridal &amp; Editorial</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-high text-on-surface shrink-0">
                          <span className="material-symbols-outlined text-[15px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="text-[13px] font-bold">5.0</span>
                          <span className="text-[11px] text-on-surface-variant">(148)</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-[12px]">verified</span> Verified Pro
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold">
                          Top Rated 2025
                        </span>
                      </div>

                      <div className="mt-2 text-[12px] text-on-surface-variant flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px] text-primary">storefront</span> SoHo Studio
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px] text-secondary">flight</span> Travels to You
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 flex items-center justify-between border-t border-surface-container">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Starting at</span>
                        <p className="font-headline text-lg text-on-surface font-semibold leading-none">$185</p>
                      </div>
                      <Link
                        to="/artist/aria-sterling"
                        className="px-4 py-2 rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface text-sm font-semibold transition-all"
                      >
                        Lookbook
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Artist 2: Marcus Chen */}
                <div
                  className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(14px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 24px -1px',
                  }}
                >
                  <div className="p-2 pb-0">
                    <div className="grid grid-cols-5 gap-1.5 h-64 rounded-xl overflow-hidden">
                      <div className="col-span-3 h-full overflow-hidden">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt="Hair sculpture"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV5-RkPBSJsKM7xPXftMdXc3nBWkO6wWn0yjbZr-8t-HzRvub-t0UXUIzuyN7yarKdZJ2fVd7wLVeWJRbHuEDctv8cWPL1wfdBUXCfxidvn0CCE7uzph2Meic62xJ8kw-kMzwEQttyegruIgpqLFKThNeiJWpjrYjs0ZkZCGJMSyS2eEa8N_9vExbH3KbRs7xy92V8bJsBpVt24YYC1f450r4VuxCmyN1fsjHRo82S76s5lgg0jRXQiQ"
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-1.5 h-full">
                        <div className="h-1/2 overflow-hidden">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Balayage detail"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAbROXf1raD4SRlkSY3YMq0GjveYi8EUdkdaFIZvzcmfUIketxigp2EETZVBJhbAKZmV6yY9ZB7BgC1auCZNz_Pi2hFNfAxjf-5-eId1fD6rUVQjvcKILaJ8cqbRcKwvIduRLnK3NXKM6GvdKziOUE3EQZzsJyDwmouQ_nOi-BvtC5_e5AcMrxzXsKAhq0_S3N3MlDLrozBPUwQB20r6QKm0NCz94oUiv-i7r6rnXFKjnJZ-wRGivSkw"
                          />
                        </div>
                        <div className="h-1/2 overflow-hidden">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Updo architectural bun"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2HXtaFfm9aWJhvkN4slsldBr9NqoLriqmjJe42QrnVxBV7hn7NxC_EJn5VZ9urm-ZQHM6jUHdQY-zrJ_U1PFDZT8-I6Vf5SITPbwabTfc6pWkt01F2guQypY1AqrmtVJI-MhfBri-3D2IEDcKEKvz7mspGgdJ9YlMss7kSsYXKnR7iMaKlm1Uwg5Oz9ZyX3ZWk4_993Qxt3Tk5utLMZHN-xbqTmmyIJ9RhKvPtnQf2yAJuGFaJdGmAQ"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0"
                            alt="Marcus Chen"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDW7S18a23s9wZgjsXKTyRwgWmYTXA_5KBWyTJMT1SJ319Ol2b5ndN7kEfx6ndGxRL_uZG2TXNX60mgvmCGC1fFmfLegytFoPPRlyGcYzn9Dw-tzjqKOJzBv-s-ROd8bhZxblySQ6okl6trDc9McfJ0GLcWCbDR60oCIOyksHK4_nrOj1advFnZKsTZIbcY0836Py6K1F0IVwnzNMTUYN2yrNCBNgMxNYJUgvyFgxUs1yihObHm7WMFCA"
                          />
                          <div className="min-w-0">
                            <h4 className="text-base font-semibold text-on-surface truncate">Marcus Chen</h4>
                            <p className="text-[12px] text-on-surface-variant truncate">Couture Hair &amp; Balayage</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-high text-on-surface shrink-0">
                          <span className="material-symbols-outlined text-[15px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="text-[13px] font-bold">4.9</span>
                          <span className="text-[11px] text-on-surface-variant">(92)</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-[12px]">verified</span> Verified Pro
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">
                          Runway Certified
                        </span>
                      </div>

                      <div className="mt-2 text-[12px] text-on-surface-variant flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px] text-primary">storefront</span> Tribeca Atelier
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px] text-secondary">flight</span> On-Location
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 flex items-center justify-between border-t border-surface-container">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Starting at</span>
                        <p className="font-headline text-lg text-on-surface font-semibold leading-none">$210</p>
                      </div>
                      <Link
                        to="/artist/aria-sterling"
                        className="px-4 py-2 rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface text-sm font-semibold transition-all"
                      >
                        Lookbook
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Artist 3: Sora Kim */}
                <div
                  className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(14px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 24px -1px',
                  }}
                >
                  <div className="p-2 pb-0">
                    <div className="grid grid-cols-5 gap-1.5 h-64 rounded-xl overflow-hidden">
                      <div className="col-span-3 h-full overflow-hidden">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt="Artistic gel manicure"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnBaDqCcYQQbzqsRBAyDxvJnIckjxAXyRVf5yUYbaKW6I40I0GPUJSHFZ3dK29lUU1lAs6vcUaveKUCQ_bWu8ViLP52uCXAiki_dWdM1GaJwskip8XVbZ_gkO-UrZQuOzTJ4jlBmQRMaHRpIfa9F06u30pZl9VKVgSWMXKOFYxQjsWp0mkxEaoGwMyQ2TcYt7hYKu6beER7WYxbIaIPcJk2J5q3wjxzjlKnGo8u0oEM_AZhy65WCatww"
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-1.5 h-full">
                        <div className="h-1/2 overflow-hidden">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Glazed donut chrome gel"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1tbOpdXwJRB56pw5K-anb2oTTDnvnj4LvJGL3ALdypdRy9OzpqKmaarKpG7OkWDgaJMVY2lCh7u9VYHPeOMB7jD3ExES8uCMLNUafHEFH0y51E-52UKff2diUEL9uQH8P7ZwaxYYxkA9hb0UUD83gpZwFXUzQfXyP5qSCOtg7p0O9itoQFBZP6o5dJFt8I4KtjcIedYTlWSN8CxmDN-hW0sNVoh1XYXNyx0kSkQgjLfJZyoPz9dLidA"
                          />
                        </div>
                        <div className="h-1/2 overflow-hidden">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Modern French manicure"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaLifU6EFaWrwGpTyBtOhynKvQpNCGnPU8m5ESsI8j86-kVFnSxKUEASnctsQTfPLffWtYXjvQXHwj-1GOjFhAERySxZLoO2CyVTavfjOu2kz7S_mavC43iz4jAMtoyWNewo9qg_LEQNDVKxly2m7yGJoS_4kkUeXLJQjuUAFcdkOTGiJ3mWWPICTjE5SloGdIw5YNp0dmsSUmJJIQfM7cJs7kQICqU39rcDXq1AKpiidlr4PsdLaRnw"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0"
                            alt="Sora Kim"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2k57bRUYuAhrZmoe1VPxzVqPwhTDJ3-ugh_KcwH2V78A76Zk2pPuDCqJnc9FJLrR5ub86UZQBjQ-OV7UiTBVATz8BgHoiARUBcPFLaLh5So5XUTEvAYlK7SpNfXwavhfRGwi6hMbp2eVX8vYlP1OrUoExTNIC4zoDGlwzoaIWCW1g6Xr0ziXq-m3ZiyOf3ItsyLnK5HBbyaG-5k59dh9zwJqTldlnnhPmfXErmGYOmEaeZJXRPjiXPQ"
                          />
                          <div className="min-w-0">
                            <h4 className="text-base font-semibold text-on-surface truncate">Sora Kim</h4>
                            <p className="text-[12px] text-on-surface-variant truncate">Minimalist Gel Atelier</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-high text-on-surface shrink-0">
                          <span className="material-symbols-outlined text-[15px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="text-[13px] font-bold">5.0</span>
                          <span className="text-[11px] text-on-surface-variant">(214)</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-[12px]">verified</span> Verified Pro
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-semibold">
                          Master Artist
                        </span>
                      </div>

                      <div className="mt-2 text-[12px] text-on-surface-variant flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px] text-primary">storefront</span> Williamsburg Loft
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px] text-secondary">check</span> Non-Toxic Only
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 flex items-center justify-between border-t border-surface-container">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Starting at</span>
                        <p className="font-headline text-lg text-on-surface font-semibold leading-none">$95</p>
                      </div>
                      <Link
                        to="/artist/aria-sterling"
                        className="px-4 py-2 rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface text-sm font-semibold transition-all"
                      >
                        Lookbook
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Artist 4: Camila Rossi */}
                <div
                  className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(14px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 24px -1px',
                  }}
                >
                  <div className="p-2 pb-0">
                    <div className="grid grid-cols-5 gap-1.5 h-64 rounded-xl overflow-hidden">
                      <div className="col-span-3 h-full overflow-hidden">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt="Dewy glass skin portrait"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqeg6jYv3jr_bKDsqJ5CLAq20_gF2zTfgFTgbT0KRRKCXhbwf_ppxTLG9FGLpc9LDKtU9pRpScHvrtNKldVV1STWSXLiquaMWMUv0W5fKHBrD0LvyOFoExH-ga-btxP7Cnm1oBvXkAd85qfxqSBV3QnGP4pnq5eCKm6FhS5bEAVLuSf5QE4mkMjTUAkfFOjBz1PS6kfZj9VE_vqyk5KOqO8X9XeH-BIrlQ_LhdPIJTVDs7YwpPqNZqHA"
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-1.5 h-full">
                        <div className="h-1/2 overflow-hidden">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Facial mask application"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBinRywU8wqRK7ghJgsOjgSh2LDZm767avqAKU5nFm0ioQO3H8FOBoGD0syHId-GtOJ06Nli1kO1x0yK3Nalwpary4vOM-PK--tvdu2hWELttuDQ8koJNxUzZFkLgBY1QD5Q7uORG7AsgCE4TtBQPUnGc95b0flwyFlwnE26qy_hEpr04rMGHV8cqH3AZi1ZsPeGgxtAzbOrmQNMmKtxsgCgUhaXnt6MbqhPXXCxcnrjvptag0FG-pTbw"
                          />
                        </div>
                        <div className="h-1/2 overflow-hidden">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Glossy cheekbone detail"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7Kh1sx0pLa-rX0QKWp0S-509WyfP60Yp0rfqXF6ryCofft4jghzyW63LmeGD541lccEpCQ4uYSxMdRmvA_MHPEgMJrIwapvXUzLE1RNX6rV8YitiyljdCTRiy5zGNiUa_K3ZLirHBuvcDDO03L2559A9mktQRnkD-txf8ofVR9dZzsmm_-1LP5SS-vJ-EQeqCXRQSY2BbPAOu6l7nBhXME8e6dUgcz4_VN0EgCn4N1Ob6bY-MymBkgg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0"
                            alt="Camila Rossi"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5Wx9UUIJZ0YaQq9wxYBsDRSutu7mmmtoPJf0aEVWI9I0pcqNWglhAuQeE4XOQ1N2cODPYUVTkW7r7P2DBrB4iS66pCL9uBUG7DptNK18P_Gh-gnKa3IrNp9i4D7chp3-2UuZNiS2gLDRXu2zE2UmsJD63Ac9MvPLDYOaOkTNOQGgbuqaAkQdhV3-LMVUSsLB9VrI-zjT4Amz_32E6uI5Jtc_22m5iAWvzZWcW4BV4E7gMHs0Z_ro7Mw"
                          />
                          <div className="min-w-0">
                            <h4 className="text-base font-semibold text-on-surface truncate">Camila Rossi</h4>
                            <p className="text-[12px] text-on-surface-variant truncate">Skin Prep &amp; Soft Glam</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-high text-on-surface shrink-0">
                          <span className="material-symbols-outlined text-[15px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="text-[13px] font-bold">4.9</span>
                          <span className="text-[11px] text-on-surface-variant">(88)</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-[12px]">verified</span> Verified Pro
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">
                          Clean Beauty
                        </span>
                      </div>

                      <div className="mt-2 text-[12px] text-on-surface-variant flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px] text-primary">storefront</span> DUMBO Studio
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px] text-secondary">flight</span> In-Home Prep
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 flex items-center justify-between border-t border-surface-container">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Starting at</span>
                        <p className="font-headline text-lg text-on-surface font-semibold leading-none">$160</p>
                      </div>
                      <Link
                        to="/artist/aria-sterling"
                        className="px-4 py-2 rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface text-sm font-semibold transition-all"
                      >
                        Lookbook
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discovery View All CTA Link */}
              <div className="mt-10 text-center">
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-base transition-all"
                >
                  <span>Explore All 380+ Verified Artists</span>
                  <span className="material-symbols-outlined text-[18px]">east</span>
                </Link>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how-it-works" className="w-full py-12 bg-surface-container-low">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-secondary tracking-widest uppercase font-semibold">03 / The Experience</span>
                </div>
                <h2 className="font-headline text-3xl sm:text-4xl text-on-surface tracking-tight font-semibold">
                  How BeautyConnect Works
                </h2>
                <p className="mt-2 text-on-surface-variant text-base">
                  A seamless bridge between discerning clients and premier independent talent. No booking surprises.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {/* Step 1 */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-headline text-2xl text-primary font-bold">01</span>
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">auto_stories</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-on-surface mb-1">Explore Curated Lookbooks</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Browse authentic portfolios, unfiltered client results, and transparent fixed menus without having to direct message back and forth for rates.
                    </p>
                  </div>
                  <div className="mt-4 pt-1">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
                      Verified Portfolios Only
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-headline text-2xl text-primary font-bold">02</span>
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-on-surface mb-1">Select Time &amp; Location</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Check real-time synced calendars. Choose between visiting the professional's bespoke studio loft or requesting luxury on-site door travel.
                    </p>
                  </div>
                  <div className="mt-4 pt-1">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
                      Direct Live Scheduling
                    </span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-headline text-2xl text-primary font-bold">03</span>
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined text-[20px]">shield_lock</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-on-surface mb-1">Transparent Checkout</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Complete bookings with clear price breakdowns. Stripe-powered escrow reserves funds securely until your appointment is concluded.
                    </p>
                  </div>
                  <div className="mt-4 pt-1">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
                      Escrow Payment Hold
                    </span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-headline text-2xl text-primary font-bold">04</span>
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">magic_button</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-on-surface mb-1">Glow &amp; Review</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Enjoy your personalized, high-touch luxury session. Leave authentic verified feedback that elevates your artist's community standing.
                    </p>
                  </div>
                  <div className="mt-4 pt-1">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-secondary">
                      Honest Verification Loop
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TRUST CHARTER (DARK STATEMENT CARD) */}
          <section className="w-full py-12 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
              <div className="relative rounded-3xl bg-inverse-surface text-inverse-on-surface p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
                <div className="absolute left-1/3 -top-24 w-72 h-72 rounded-full bg-secondary/15 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <span className="text-primary-fixed text-[11px] uppercase tracking-widest font-semibold mb-1">
                      The Collective Charter
                    </span>
                    <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-white font-semibold tracking-tight leading-snug">
                      Elevating Creative Independence, Safeguarding Quality.
                    </h2>
                    <p className="text-sm text-surface-variant/80 mt-2 leading-relaxed">
                      Traditional salons claim excessive cuts; generic aggregators lack editorial nuance. BeautyConnect honors the craftsmanship of freelance masters while providing clients with ironclad guarantees.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <Link
                        to="/how-it-works"
                        className="px-6 py-3 rounded-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-semibold text-sm transition-colors shadow-md"
                      >
                        Read Guarantee Terms
                      </Link>
                      <div className="flex items-center gap-2 text-surface-variant text-xs">
                        <span className="material-symbols-outlined text-[18px] text-secondary-fixed">verified_user</span>
                        <span>Licensed &amp; Insured Network</span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Guarantees */}
                  <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface-bright/5 backdrop-blur-sm p-4 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-fixed flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
                        </div>
                        <h4 className="font-semibold text-white mb-1 text-base">Vetted Standards</h4>
                        <p className="text-[13px] text-surface-dim/80 leading-relaxed">
                          Only 14% of applicants receive active listings after comprehensive sanitation and technical review.
                        </p>
                      </div>
                      <div className="mt-4 pt-1 flex items-center gap-1 text-[11px] text-primary-fixed uppercase tracking-wider font-semibold">
                        <span>100% Verified</span>
                        <span className="material-symbols-outlined text-[13px]">done</span>
                      </div>
                    </div>

                    <div className="bg-surface-bright/5 backdrop-blur-sm p-4 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-secondary-fixed-dim/20 text-secondary-fixed flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined text-[22px]">payments</span>
                        </div>
                        <h4 className="font-semibold text-white mb-1 text-base">Fair Pro Model</h4>
                        <p className="text-[13px] text-surface-dim/80 leading-relaxed">
                          Independent artists keep 92% of gross earnings. You directly empower solo entrepreneurship.
                        </p>
                      </div>
                      <div className="mt-4 pt-1 flex items-center gap-1 text-[11px] text-secondary-fixed uppercase tracking-wider font-semibold">
                        <span>Fair Pay Policy</span>
                        <span className="material-symbols-outlined text-[13px]">done</span>
                      </div>
                    </div>

                    <div className="bg-surface-bright/5 backdrop-blur-sm p-4 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-tertiary-fixed-dim/20 text-tertiary-fixed flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined text-[22px]">sentiment_very_satisfied</span>
                        </div>
                        <h4 className="font-semibold text-white mb-1 text-base">Delight Guarantee</h4>
                        <p className="text-[13px] text-surface-dim/80 leading-relaxed">
                          If an artist must cancel due to emergency, our VIP concierge rebooks an equivalent master artist instantly.
                        </p>
                      </div>
                      <div className="mt-4 pt-1 flex items-center gap-1 text-[11px] text-tertiary-fixed uppercase tracking-wider font-semibold">
                        <span>24/7 Concierge</span>
                        <span className="material-symbols-outlined text-[13px]">done</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TESTIMONIALS & PRESS MENTIONS */}
          <section className="w-full py-12 bg-surface-container-low/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-2">
                <div>
                  <span className="text-[11px] text-secondary tracking-widest uppercase font-semibold">04 / Authentic Stories</span>
                  <h2 className="font-headline text-3xl sm:text-4xl text-on-surface tracking-tight font-semibold mt-1">
                    Loved by Discerning Clients
                  </h2>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-container-lowest shadow-sm">
                  <div className="flex text-tertiary">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <span className="text-base font-bold text-on-surface">4.96 / 5.0</span>
                  <span className="text-[12px] text-on-surface-variant">(Over 3,400 Verified Bookings)</span>
                </div>
              </div>

              {/* Testimonials 3-Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-tertiary mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-base text-on-surface italic leading-relaxed">
                      "Booking Aria for my Plaza Hotel wedding morning was the single easiest part of planning. Her lookbook was 100% reflective of her magic. She arrived 15 minutes early and brought total calm."
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-9 h-9 rounded-full object-cover"
                        alt="Claire Davenport"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5dcd_9I_hRTBuBYpnl_Fg-ZdNWvAQCOZaW7D0lSo1XwFlQw0J3Ze3qJBMLCsPlQvH8cR-vQnUtdJ1P3ZQNid-9vOapX5oomdptI-xCYKshCi6aJSntpP4x3kvG3sSaujED6zkAJCPqw203qqYz0lSCvcvtU9ioSbspV7TGoDFhsLc5nu7NWkLkaoEz-7jdlk4KYGhgI3dcRIUU6cumj30BKnUdhdk_GQR1tVstMALR07fun783r9wPg"
                      />
                      <div>
                        <h5 className="font-semibold text-sm text-on-surface leading-tight">Claire Davenport</h5>
                        <span className="text-[11px] text-on-surface-variant">Bridal Makeup Client</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-secondary font-semibold uppercase tracking-wider">Verified Stay</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-tertiary mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-base text-on-surface italic leading-relaxed">
                      "Marcus sculpted my hair for the Tribeca Film premiere. No awkward salon chatter or inflated upsells. Just pristine runway-level execution and transparent pricing right up front."
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-9 h-9 rounded-full object-cover"
                        alt="Vivienne Laurent"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBInYrQhwnuMpOZZoZVcxr4q_dKm8035a2DaqNdlwyu-RIGR4J4GQTkvQv_CbuFKX_hCXcfm3t_4RUqsqiHSjfQYVPZg6p3IgUH1f8B0r8y3eh-ewZca1Zckh-JJJiUzmm6qUd2W7gj6o1RAQvFG7DYcCcGv8K37MNNA_25Tqeq6bk543aIM_FH91hAyXuoaFew1rb5W7_K99wlBr88XXfsG4qAESJcUl4WQP4xzJ9hapJUBT-Og6_ifQ"
                      />
                      <div>
                        <h5 className="font-semibold text-sm text-on-surface leading-tight">Vivienne Laurent</h5>
                        <span className="text-[11px] text-on-surface-variant">Editorial Hair Client</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-secondary font-semibold uppercase tracking-wider">Verified Stay</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-tertiary mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-base text-on-surface italic leading-relaxed">
                      "Finding Sora Kim on BeautyConnect saved my nail beds. Her Japanese gel technique lasted 4 weeks with zero lifting. The booking and payment system feels like modern bespoke luxury."
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-9 h-9 rounded-full object-cover"
                        alt="Naomi Tanaka"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZph9pNAsqr9lH7bYjE5net3GuBjlWXIvIxkksRj_pv2ezn878C66exjCFY844yQ9vVYGtrJ4v8wSrVTRyPLd9-BuT17O-bJSeXLcBotr330mlzN2pGsxCGZWYz07RLzFUXGegdbHNULz0m_WfKmau9mbEzB2812jAIsRklhpwWtk-gkpc-b9Vk6g7RdMaFD8CTLKodIPN5krCp5hVUcBqi_1BRSHsxqm0FJCKeRRbdhe7jVz93xOUJw"
                      />
                      <div>
                        <h5 className="font-semibold text-sm text-on-surface leading-tight">Naomi Tanaka</h5>
                        <span className="text-[11px] text-on-surface-variant">Atelier Gel Client</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-secondary font-semibold uppercase tracking-wider">Verified Stay</span>
                  </div>
                </div>
              </div>

              {/* Editorial Press Mentions Ticker */}
              <div className="mt-12 pt-8 border-t border-surface-container flex flex-col items-center">
                <span className="text-[11px] text-on-surface-variant uppercase tracking-widest font-semibold mb-6">
                  Featured In Curated Publications
                </span>
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
                  <span className="font-headline text-2xl italic text-on-surface tracking-wider">VOGUE EDITORIAL</span>
                  <span className="text-2xl uppercase font-bold text-on-surface tracking-widest font-body">ELLE BEAUTÉ</span>
                  <span className="font-headline text-2xl uppercase tracking-widest text-on-surface">HARPER'S BAZAAR</span>
                  <span className="text-2xl tracking-tight font-semibold text-on-surface font-body">ALLURE CURATION</span>
                </div>
              </div>
            </div>
          </section>

          {/* BOTTOM CONCIERGE CALLOUT BANNER */}
          <section className="w-full py-12 bg-surface-container">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
              <div className="inline-flex p-3 rounded-full bg-surface-bright text-primary mb-2 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">diamond</span>
              </div>
              <h2 className="font-headline text-3xl sm:text-4xl text-on-surface tracking-tight font-semibold">
                Planning an Editorial Campaign or Destination Wedding?
              </h2>
              <p className="text-base text-on-surface-variant max-w-xl mx-auto mt-2 mb-8">
                Our BeautyConnect Private Concierge coordinates multi-artist teams, travel riders, and bespoke lookbook direction for large private events.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/search"
                  className="px-8 py-3.5 rounded-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-semibold text-sm transition-all shadow-md"
                >
                  Request Concierge Curation
                </Link>
                <Link
                  to="/search"
                  className="px-8 py-3.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-all"
                >
                  Explore Artist Portfolios
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-low mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            <div className="lg:col-span-2 flex flex-col gap-4 pr-4">
              <div className="flex items-center gap-2">
                <img
                  alt="BeautyConnect Logo"
                  className="h-7 w-auto object-contain"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WFQOM9PVQ-graz7eJRdLou2nVFIJ1rWA2qS9pMBhPqIWcs1fBJzDG8v23v8_iIVom1epEJtQyHbYDmECaY77cOrOwZRt444uXEt1GoPfwxCht7K7HF-7Vb8yWFJk5X9VIVCC2v_WxGZl32aUMXlsRDmj1Qm2nlQ-QmG8spgW63uTgMfi4slE6nncAzcQ8nxcXunmwoMB_ndeJmo-Bw-wWMMHvYHFwmm7EDAIYLPKHJFPCJIHOIS2-0jjGi"
                />
                <span className="font-headline text-xl text-on-surface tracking-tight font-semibold">
                  BeautyConnect
                </span>
              </div>
              <p className="text-sm text-on-surface-variant max-w-sm">
                An artisanal marketplace uniting master beauty artists with clients seeking thoughtful, high-touch services. Curated with editorial precision and authentic trust.
              </p>
              <div className="flex items-center gap-4 pt-1">
                <span className="text-[11px] text-secondary font-semibold uppercase tracking-wider">
                  Editorial Portfolio Lookbook
                </span>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-base hover:text-primary transition-colors cursor-pointer">photo_camera</span>
                  <span className="material-symbols-outlined text-base hover:text-primary transition-colors cursor-pointer">auto_stories</span>
                  <span className="material-symbols-outlined text-base hover:text-primary transition-colors cursor-pointer">spa</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-on-surface">Curation</h4>
              <nav className="flex flex-col gap-1.5 text-sm">
                <Link className="text-primary font-medium" to="/search">Bridal Makeup</Link>
                <Link className="text-primary font-medium" to="/search">Editorial Hair</Link>
                <Link className="text-primary font-medium" to="/search">Clean Skincare</Link>
                <Link className="text-primary font-medium" to="/search">Precision Nails</Link>
                <Link className="text-primary font-medium" to="/search">Aesthetic Lash &amp; Brow</Link>
              </nav>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-on-surface">Professionals</h4>
              <nav className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
                <Link className="hover:text-on-surface transition-colors" to="/register">Become a Pro Partner</Link>
                <Link className="hover:text-on-surface transition-colors" to="/pro-dashboard">Pro Studio Portal</Link>
                <a className="hover:text-on-surface transition-colors" href="#how-it-works">Standards &amp; Verification</a>
                <a className="hover:text-on-surface transition-colors" href="#how-it-works">Artist Community</a>
              </nav>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-on-surface">Trust &amp; Safety</h4>
              <nav className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
                <a className="hover:text-on-surface transition-colors" href="#how-it-works">Verified Pro Guarantee</a>
                <a className="hover:text-on-surface transition-colors" href="#how-it-works">Transparent Pricing Policy</a>
                <a className="hover:text-on-surface transition-colors" href="#how-it-works">Hygiene &amp; Safety Code</a>
                <a className="hover:text-on-surface transition-colors" href="#how-it-works">Cancellation Terms</a>
              </nav>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-on-surface">Client Care</h4>
              <nav className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
                <a className="hover:text-on-surface transition-colors" href="#how-it-works">Help Center</a>
                <Link className="hover:text-on-surface transition-colors" to="/customer-dashboard">Saved Portfolios</Link>
                <a className="hover:text-on-surface transition-colors" href="#how-it-works">Concierge Inquiries</a>
              </nav>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4 text-on-surface-variant">
            <p className="text-xs">© 2025 BeautyConnect Inc. Pure craft, authentic care. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs">
              <a className="hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-on-surface transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-on-surface transition-colors" href="#">Editorial Standards</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
