import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const [specialty, setSpecialty] = useState('Bridal & Event Glam')
  const [location, setLocation] = useState('Manhattan, NY • In-Studio')
  const [activeFilter, setActiveFilter] = useState('All Curations')

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    navigate(`/search?specialty=${encodeURIComponent(specialty)}&loc=${encodeURIComponent(location)}`)
  }

  // 4 Featured Artists from Stitch Spec
  const artists = [
    {
      id: 'aria-sterling',
      name: 'Aria Sterling',
      title: 'Master Bridal & Editorial',
      rating: '5.0',
      reviews: 148,
      price: '$185',
      location: 'SoHo Studio',
      travel: 'Travels to You',
      badge1: 'Verified Pro',
      badge2: 'Top Rated 2025',
      category: 'Bridal Specialist',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcftkZUCd2x7jlZN2Z_3AzZavNR-HsS2Di9aVC7n3iMQk8_c5o1txA5yy8sJvnVQDS_Dep7cbvpCjd85w5TcIvMOCJkFWY8GAKQcjDd1fRFqpXR6lRqdYvE4fkV1J8_T24H-jL6MiR5nWVT_pXAR-3bIldWXiEZ5uH9qOSUCBGL6A14piYD9nzpABRpYIxLWQMgf4Cea8Ow9-HXV2S-2-70HwdnrRI-8NlasuvL6BTcDpT5PY1ixmw2w',
      mainImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDASeuys3z8sD6DyehqmblNd70k943VMYAjxnoRVuuYemm6BsHm4g_Lh7A7lUu-lNJNAoPWzuB6heYYvWqhuWLIqIAWN4U_iIckcGTRr1gUjPqVdi9r3Cw-Hvuw0UMWQVdlCNz-3Q3SQmT7qPIorwNKJoAy1If29vYODQnjZ7SF78nvLf83CabRUjGDA0mu2rctougU9NMcY-c5yYssebVpM0NtcLDz5kkbKo746rM-mQZWLz5Oaac5IA',
      subImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe1XQxIznvzkoUL2d2MBn9reFkpx9U5yo633uc9NQfX5hzNA5CY_ZbiLsXgeBZtJS0aEsOsCT2rKgYmJeklp16ae4THnvXOvmeCd8sALLvtbMmzwwW1bBwcrkNBn4MkHkSu1WkFLLg7aOQkXLn-VTP6_VgmMBV1TS4WGZwalbon_BVSn7KQBEzYA2DS0lhmAWedVQffx84g2h3lk_Zb0Jxp6m1gm2EIbljVLCp2oqwKhW9mY1_Fx9zJw',
      subImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8Oh1D1hp_QuQyMOd4WQqT8nt6x6njLEtE860yAIguIHcXAjy0M0N6QxxJUuZrF38zD2Xd6Se5ZdhZFSJNLldXAgexLgxve0B4Y_LUrkT8HHXjV-sBDjzUoPSEkxNuPf6rp3DnsT1Ojq00CigZgzwpxXS6yHA1PW_M4i-QrijpoOM3zu3gam3ZoJtlnxybw0oa159X6sNl5hNhNgJ8ZbYrNrcNv5cyRl6n7ubLY0c0P3-nDWZvQIstZA'
    },
    {
      id: 'marcus-chen',
      name: 'Marcus Chen',
      title: 'Couture Hair & Balayage',
      rating: '4.9',
      reviews: 92,
      price: '$210',
      location: 'Tribeca Atelier',
      travel: 'On-Location',
      badge1: 'Verified Pro',
      badge2: 'Runway Certified',
      category: 'Manhattan In-Studio',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDW7S18a23s9wZgjsXKTyRwgWmYTXA_5KBWyTJMT1SJ319Ol2b5ndN7kEfx6ndGxRL_uZG2TXNX60mgvmCGC1fFmfLegytFoPPRlyGcYzn9Dw-tzjqKOJzBv-s-ROd8bhZxblySQ6okl6trDc9McfJ0GLcWCbDR60oCIOyksHK4_nrOj1advFnZKsTZIbcY0836Py6K1F0IVwnzNMTUYN2yrNCBNgMxNYJUgvyFgxUs1yihObHm7WMFCA',
      mainImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV5-RkPBSJsKM7xPXftMdXc3nBWkO6wWn0yjbZr-8t-HzRvub-t0UXUIzuyN7yarKdZJ2fVd7wLVeWJRbHuEDctv8cWPL1wfdBUXCfxidvn0CCE7uzph2Meic62xJ8kw-kMzwEQttyegruIgpqLFKThNeiJWpjrYjs0ZkZCGJMSyS2eEa8N_9vExbH3KbRs7xy92V8bJsBpVt24YYC1f450r4VuxCmyN1fsjHRo82S76s5lgg0jRXQiQ',
      subImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAbROXf1raD4SRlkSY3YMq0GjveYi8EUdkdaFIZvzcmfUIketxigp2EETZVBJhbAKZmV6yY9ZB7BgC1auCZNz_Pi2hFNfAxjf-5-eId1fD6rUVQjvcKILaJ8cqbRcKwvIduRLnK3NXKM6GvdKziOUE3EQZzsJyDwmouQ_nOi-BvtC5_e5AcMrxzXsKAhq0_S3N3MlDLrozBPUwQB20r6QKm0NCz94oUiv-i7r6rnXFKjnJZ-wRGivSkw',
      subImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2HXtaFfm9aWJhvkN4slsldBr9NqoLriqmjJe42QrnVxBV7hn7NxC_EJn5VZ9urm-ZQHM6jUHdQY-zrJ_U1PFDZT8-I6Vf5SITPbwabTfc6pWkt01F2guQypY1AqrmtVJI-MhfBri-3D2IEDcKEKvz7mspGgdJ9YlMss7kSsYXKnR7iMaKlm1Uwg5Oz9ZyX3ZWk4_993Qxt3Tk5utLMZHN-xbqTmmyIJ9RhKvPtnQf2yAJuGFaJdGmAQ'
    },
    {
      id: 'sora-kim',
      name: 'Sora Kim',
      title: 'Minimalist Gel Atelier',
      rating: '5.0',
      reviews: 214,
      price: '$95',
      location: 'Williamsburg Loft',
      travel: 'Non-Toxic Only',
      badge1: 'Verified Pro',
      badge2: 'Master Artist',
      category: 'Travel to Client',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2k57bRUYuAhrZmoe1VPxzVqPwhTDJ3-ugh_KcwH2V78A76Zk2pPuDCqJnc9FJLrR5ub86UZQBjQ-OV7UiTBVATz8BgHoiARUBcPFLaLh5So5XUTEvAYlK7SpNfXwavhfRGwi6hMbp2eVX8vYlP1OrUoExTNIC4zoDGlwzoaIWCW1g6Xr0ziXq-m3ZiyOf3ItsyLnK5HBbyaG-5k59dh9zwJqTldlnnhPmfXErmGYOmEaeZJXRPjiXPQ',
      mainImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnBaDqCcYQQbzqsRBAyDxvJnIckjxAXyRVf5yUYbaKW6I40I0GPUJSHFZ3dK29lUU1lAs6vcUaveKUCQ_bWu8ViLP52uCXAiki_dWdM1GaJwskip8XVbZ_gkO-UrZQuOzTJ4jlBmQRMaHRpIfa9F06u30pZl9VKVgSWMXKOFYxQjsWp0mkxEaoGwMyQ2TcYt7hYKu6beER7WYxbIaIPcJk2J5q3wjxzjlKnGo8u0oEM_AZhy65WCatww',
      subImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1tbOpdXwJRB56pw5K-anb2oTTDnvnj4LvJGL3ALdypdRy9OzpqKmaarKpG7OkWDgaJMVY2lCh7u9VYHPeOMB7jD3ExES8uCMLNUafHEFH0y51E-52UKff2diUEL9uQH8P7ZwaxYYxkA9hb0UUD83gpZwFXUzQfXyP5qSCOtg7p0O9itoQFBZP6o5dJFt8I4KtjcIedYTlWSN8CxmDN-hW0sNVoh1XYXNyx0kSkQgjLfJZyoPz9dLidA',
      subImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaLifU6EFaWrwGpTyBtOhynKvQpNCGnPU8m5ESsI8j86-kVFnSxKUEASnctsQTfPLffWtYXjvQXHwj-1GOjFhAERySxZLoO2CyVTavfjOu2kz7S_mavC43iz4jAMtoyWNewo9qg_LEQNDVKxly2m7yGJoS_4kkUeXLJQjuUAFcdkOTGiJ3mWWPICTjE5SloGdIw5YNp0dmsSUmJJIQfM7cJs7kQICqU39rcDXq1AKpiidlr4PsdLaRnw'
    },
    {
      id: 'camila-rossi',
      name: 'Camila Rossi',
      title: 'Skin Prep & Soft Glam',
      rating: '4.9',
      reviews: 88,
      price: '$160',
      location: 'DUMBO Studio',
      travel: 'In-Home Prep',
      badge1: 'Verified Pro',
      badge2: 'Clean Beauty',
      category: 'Bridal Specialist',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5Wx9UUIJZ0YaQq9wxYBsDRSutu7mmmtoPJf0aEVWI9I0pcqNWglhAuQeE4XOQ1N2cODPYUVTkW7r7P2DBrB4iS66pCL9uBUG7DptNK18P_Gh-gnKa3IrNp9i4D7chp3-2UuZNiS2gLDRXu2zE2UmsJD63Ac9MvPLDYOaOkTNOQGgbuqaAkQdhV3-LMVUSsLB9VrI-zjT4Amz_32E6uI5Jtc_22m5iAWvzZWcW4BV4E7gMHs0Z_ro7Mw',
      mainImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqeg6jYv3jr_bKDsqJ5CLAq20_gF2zTfgFTgbT0KRRKCXhbwf_ppxTLG9FGLpc9LDKtU9pRpScHvrtNKldVV1STWSXLiquaMWMUv0W5fKHBrD0LvyOFoExH-ga-btxP7Cnm1oBvXkAd85qfxqSBV3QnGP4pnq5eCKm6FhS5bEAVLuSf5QE4mkMjTUAkfFOjBz1PS6kfZj9VE_vqyk5KOqO8X9XeH-BIrlQ_LhdPIJTVDs7YwpPqNZqHA',
      subImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBinRywU8wqRK7ghJgsOjgSh2LDZm767avqAKU5nFm0ioQO3H8FOBoGD0syHId-GtOJ06Nli1kO1x0yK3Nalwpary4vOM-PK--tvdu2hWELttuDQ8koJNxUzZFkLgBY1QD5Q7uORG7AsgCE4TtBQPUnGc95b0flwyFlwnE26qy_hEpr04rMGHV8cqH3AZi1ZsPeGgxtAzbOrmQNMmKtxsgCgUhaXnt6MbqhPXXCxcnrjvptag0FG-pTbw',
      subImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7Kh1sx0pLa-rX0QKWp0S-509WyfP60Yp0rfqXF6ryCofft4jghzyW63LmeGD541lccEpCQ4uYSxMdRmvA_MHPEgMJrIwapvXUzLE1RNX6rV8YitiyljdCTRiy5zGNiUa_K3ZLirHBuvcDDO03L2559A9mktQRnkD-txf8ofVR9dZzsmm_-1LP5SS-vJ-EQeqCXRQSY2BbPAOu6l7nBhXME8e6dUgcz4_VN0EgCn4N1Ob6bY-MymBkgg'
    }
  ]

  const filteredArtists = activeFilter === 'All Curations' 
    ? artists 
    : artists.filter(a => a.category === activeFilter)

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        {/* Ambient Blur Circles */}
        <div className="hero-glow hero-glow--1"></div>
        <div className="hero-glow hero-glow--2"></div>

        <div className="container hero-content">
          {/* Editorial Micro Kicker */}
          <div className="hero-kicker">
            <span className="hero-kicker-dot"></span>
            <span>Independent Freelance Collective</span>
            <span className="hero-kicker-sep">/</span>
            <span className="hero-kicker-season">Season Lookbook 2025</span>
          </div>

          {/* High-Contrast Headline */}
          <h1 className="hero-title">
            Exceptional Beauty Artistry, <br className="br-hide-mobile" />
            <span className="italic hero-title-accent">Curated for You.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Connect directly with verified independent freelance makeup artists, couture hair sculptors, and aesthetic specialists for on-demand atelier appointments or luxury travel directly to your door.
          </p>

          {/* FLOATING MULTI-PARAMETER SEARCH BAR */}
          <div className="hero-search-wrapper glass">
            <form className="hero-search-form" onSubmit={handleSearchSubmit}>
              {/* Specialty Selector */}
              <div className="hero-search-field">
                <label className="hero-field-label">
                  <span className="material-symbols-outlined icon-primary">palette</span>
                  Specialty Craft
                </label>
                <div className="hero-select-wrap">
                  <select 
                    value={specialty} 
                    onChange={e => setSpecialty(e.target.value)}
                    className="hero-select"
                  >
                    <option>Bridal &amp; Event Glam</option>
                    <option>Editorial Couture Hair</option>
                    <option>Minimalist Gel &amp; Nail Art</option>
                    <option>Clean Skincare &amp; Facials</option>
                    <option>Aesthetic Lash &amp; Brow</option>
                  </select>
                  <span className="material-symbols-outlined hero-field-chevron">unfold_more</span>
                </div>
              </div>

              {/* Location Selector */}
              <div className="hero-search-field">
                <label className="hero-field-label">
                  <span className="material-symbols-outlined icon-secondary">location_on</span>
                  Location or Studio
                </label>
                <div className="hero-input-wrap">
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. SoHo, Manhattan"
                    className="hero-input"
                  />
                </div>
              </div>

              {/* Date / Time */}
              <div className="hero-search-field">
                <label className="hero-field-label">
                  <span className="material-symbols-outlined icon-tertiary">calendar_today</span>
                  Appointment Time
                </label>
                <div className="hero-date-trigger">
                  <span className="hero-date-val">This Weekend (Sat/Sun)</span>
                  <span className="material-symbols-outlined hero-field-chevron">expand_more</span>
                </div>
              </div>

              {/* Search CTA Button */}
              <div className="hero-search-cta">
                <button type="submit" className="hero-btn-discover">
                  <span className="material-symbols-outlined">search</span>
                  <span>Discover</span>
                </button>
              </div>
            </form>
          </div>

          {/* Trust Badges Under Search */}
          <div className="hero-trust-badges">
            <div className="hero-trust-item">
              <span className="material-symbols-outlined icon-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span>100% Verified Identity &amp; Licensure</span>
            </div>
            <span className="hero-trust-dot">•</span>
            <div className="hero-trust-item">
              <span className="material-symbols-outlined icon-secondary">receipt_long</span>
              <span>Transparent Pricing &amp; No Hidden Fees</span>
            </div>
            <span className="hero-trust-dot">•</span>
            <div className="hero-trust-item">
              <span className="material-symbols-outlined icon-tertiary">lock</span>
              <span>Protected Stripe Escrow Payments</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ARTISANAL SPECIALTIES (BENTO MOSAIC) */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-kicker">
                <span className="kicker-tag">01 / Curated Disciplines</span>
                <div className="kicker-line"></div>
              </div>
              <h2 className="section-title">Artisanal Specialties</h2>
            </div>
            <p className="section-desc">
              Meticulously categorized crafts. Each portfolio undergoes strict aesthetic scrutiny before publication.
            </p>
          </div>

          {/* Bento Mosaic Grid */}
          <div className="bento-mosaic">
            {/* Category 1: Bridal */}
            <Link to="/search?cat=bridal" className="bento-card bento-card--large">
              <div 
                className="bento-bg" 
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDnT6YyV3HUNYkcUyvMzDafcIYIvkB0Y9ZYeersuuzp7PWBk2x311ruGHltxxDLSjKRNRtIyxnRhKHpxYjh93ya_4Cgbfo_Xwus_VBj5ImOIinA10oQF4ygZA4p0wy5zVcs6gz443c-mwjnLLLh7qQfCBoVdD5uQGJYniesFQJMJ5PaC2yZ0c2QnyK6ZIg7tRElINDAQJ3xe2E0ubpnl8E3WlHc_WmhVnaeqiIjbFvzHFnFIPrlcgDtgw')` }}
              ></div>
              <div className="bento-overlay"></div>
              <div className="bento-content">
                <span className="bento-tag">Couture Bridal</span>
                <h3 className="bento-title">Bridal &amp; Gala Glam</h3>
                <p className="bento-sub">Tailored lookbooks, heirloom trials, and full bridal party styling suites.</p>
                <div className="bento-link">
                  <span>Explore 140+ Artists</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Category 2: Hair */}
            <Link to="/search?cat=hair" className="bento-card bento-card--large">
              <div 
                className="bento-bg" 
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBq-XLsx1linSfhcfeDUuVoHFkDTRmPIte2ugEGwps3W2NRcCgvxOI-fknrTu5OwsYxM_Vv-EngrHb_0ZI1X5YgRuJnyN8aeKkbyqbqx4plEb2qRbgAkgbuwDEZVujC5FU4fsoBsb56On8RFsD_9r5RNG4Zeiz5DJpBNl5Clqkwb0Kjh0YylJ1Tr22je3t2yXpOfq-xuKY-78zlya1e1ot7Bo69T9GI269B8BoXuQ8MePxRugPunK-Irg')` }}
              ></div>
              <div className="bento-overlay"></div>
              <div className="bento-content">
                <span className="bento-tag">Sculpt &amp; Texture</span>
                <h3 className="bento-title">Editorial Hair Styling</h3>
                <p className="bento-sub">Runway-trained sculptors, botanical balayage, and dimensional cuts.</p>
                <div className="bento-link">
                  <span>Explore 96 Artists</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Category 3: Nails */}
            <Link to="/search?cat=nails" className="bento-card bento-card--large">
              <div 
                className="bento-bg" 
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4tU98_9h9066LvE2XSmx1_HG3wZl2fu1u5ARwQmO5flthUR3f2uIB4_tnlqloRd4yeu0QSp93_MWfK148ZeFdeIu1I5il5YavHuEjYix-UH2GdGmpTPcDtLKd_-G_JtcP4xEKfrPwD6WrPVJ-QtoLs2nE4Xb-XE0j0mAtjXyK963hX4Hz-pdnLmrsnTYOIdgC9jkjHQhnZdvHIbHyUTh6BzpLv11Zm9atVQjzAq_1kkSC-Csr54D-Wg')` }}
              ></div>
              <div className="bento-overlay"></div>
              <div className="bento-content">
                <span className="bento-tag">Atelier Detail</span>
                <h3 className="bento-title">Nail Architecture &amp; Art</h3>
                <p className="bento-sub">Apres gel-x, non-toxic Russian manicures, and bespoke hand-painted motifs.</p>
                <div className="bento-link">
                  <span>Explore 78 Ateliers</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Category 4: Skincare */}
            <Link to="/search?cat=skincare" className="bento-card bento-card--wide">
              <div 
                className="bento-bg" 
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAt5o-9gevPvkpcUSGif3oi_mH5wJ9DEyjq_Enazh1lK9Q_5AyWxu7TdR3Qzr8Gy-X3Q1gbUXYLbiAcuFctX7Km_J9hQ4Kvgjlcekia5_yMdIyN9DQprw5skqTyeJpQ5KOSJoTOf7-sIvAIyvwZlBxOrLwPA6WXKefDUq2aar-YEMILhj7ln7cJWmBQ0NS5dNWscwj-7KKOJJxoQ8tBwfhKwCdaBdzfB9pCjTmTlqHrWju4voxNCgyrWw')` }}
              ></div>
              <div className="bento-overlay"></div>
              <div className="bento-content bento-content--row">
                <div>
                  <span className="bento-tag">Dermal Holism</span>
                  <h3 className="bento-title">Skincare Prep &amp; Glow Facials</h3>
                  <p className="bento-sub">Lymphatic drainage, buccal sculpting, and restorative chemical peels.</p>
                </div>
                <span className="material-symbols-outlined bento-icon-badge">spa</span>
              </div>
            </Link>

            {/* Category 5: Lash & Brow */}
            <Link to="/search?cat=lashes" className="bento-card bento-card--wide">
              <div 
                className="bento-bg" 
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA05WeTn5hBCQmA9ikom_GiW-_ZoAHT7OLpIIG5O_I1l_OdJW-a81pqySj-gG-9yVIlLS6kWIvKNeUWaVcIjiBvSJlBURsEG_kZFcHyMrjVkkUBDepo4_kNZje5AfD_jDPNljkE1WhdJyOTqNbssMXmhm6HMGHY7ImZtvq4bxNNW3iocp4cOkHzfWWLm2VNCqDggf4GVp2Ke1MhoAGYu1PJswSQ3SWfMhsgy9bk-msKxRT03E2H_PZEog')` }}
              ></div>
              <div className="bento-overlay"></div>
              <div className="bento-content bento-content--row">
                <div>
                  <span className="bento-tag">Facial Geometry</span>
                  <h3 className="bento-title">Editorial Lash &amp; Brow</h3>
                  <p className="bento-sub">Keratin lash infills, hyper-realistic micro-stroking, and tailored lamination.</p>
                </div>
                <span className="material-symbols-outlined bento-icon-badge">visibility</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED ARTISTS OF THE MONTH */}
      <section className="featured-artists-section">
        <div className="container">
          {/* Header & Filter Pills */}
          <div className="featured-header">
            <div>
              <div className="section-kicker">
                <span className="kicker-tag">02 / Verified Masters</span>
                <div className="kicker-line"></div>
              </div>
              <h2 className="section-title">Featured Artists of the Month</h2>
            </div>
            <div className="filter-pills">
              {['All Curations', 'Manhattan In-Studio', 'Travel to Client', 'Bridal Specialist'].map(pill => (
                <button
                  key={pill}
                  onClick={() => setActiveFilter(pill)}
                  className={`filter-pill ${activeFilter === pill ? 'filter-pill--active' : ''}`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* 4-Card Artist Grid */}
          <div className="artists-grid">
            {filteredArtists.map(artist => (
              <div key={artist.id} className="artist-card glass">
                {/* Lookbook collage */}
                <div className="artist-collage">
                  <div className="artist-main-img-wrap">
                    <img src={artist.mainImg} alt={artist.name} className="artist-main-img" />
                  </div>
                  <div className="artist-sub-imgs-col">
                    <div className="artist-sub-img-wrap">
                      <img src={artist.subImg1} alt="" className="artist-sub-img" />
                    </div>
                    <div className="artist-sub-img-wrap">
                      <img src={artist.subImg2} alt="" className="artist-sub-img" />
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="artist-body">
                  <div className="artist-meta-top">
                    <div className="artist-id-row">
                      <img src={artist.avatar} alt={artist.name} className="artist-avatar" />
                      <div className="artist-names">
                        <h4 className="artist-name">{artist.name}</h4>
                        <p className="artist-craft">{artist.title}</p>
                      </div>
                    </div>
                    <div className="artist-rating-pill">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="artist-score">{artist.rating}</span>
                      <span className="artist-count">({artist.reviews})</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="artist-badges">
                    <span className="artist-badge artist-badge--verified">
                      <span className="material-symbols-outlined">verified</span>
                      {artist.badge1}
                    </span>
                    <span className="artist-badge artist-badge--accent">
                      {artist.badge2}
                    </span>
                  </div>

                  {/* Location & Travel */}
                  <div className="artist-logistics">
                    <span>
                      <span className="material-symbols-outlined icon-primary">storefront</span>
                      {artist.location}
                    </span>
                    <span>•</span>
                    <span>
                      <span className="material-symbols-outlined icon-secondary">flight</span>
                      {artist.travel}
                    </span>
                  </div>

                  {/* Price & Action */}
                  <div className="artist-footer">
                    <div>
                      <span className="artist-price-label">Starting at</span>
                      <p className="artist-price">{artist.price}</p>
                    </div>
                    <Link to={`/artist/${artist.id}`} className="btn-lookbook">
                      Lookbook
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All CTA */}
          <div className="view-all-cta">
            <Link to="/search" className="btn-explore-all">
              <span>Explore All 380+ Verified Artists</span>
              <span className="material-symbols-outlined">east</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HOW BEAUTYCONNECT WORKS */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="container">
          <div className="text-center section-intro">
            <span className="kicker-tag">03 / The Experience</span>
            <h2 className="section-title">How BeautyConnect Works</h2>
            <p className="section-desc-center">
              A seamless bridge between discerning clients and premier independent talent. No booking surprises.
            </p>
          </div>

          <div className="steps-matrix">
            {/* Step 1 */}
            <div className="step-card">
              <div>
                <div className="step-top">
                  <span className="step-num">01</span>
                  <div className="step-icon-wrap icon-primary">
                    <span className="material-symbols-outlined">auto_stories</span>
                  </div>
                </div>
                <h3 className="step-title">Explore Curated Lookbooks</h3>
                <p className="step-desc">
                  Browse authentic portfolios, unfiltered client results, and transparent fixed menus without having to direct message back and forth for rates.
                </p>
              </div>
              <span className="step-footer-kicker">Verified Portfolios Only</span>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div>
                <div className="step-top">
                  <span className="step-num">02</span>
                  <div className="step-icon-wrap icon-secondary">
                    <span className="material-symbols-outlined">calendar_clock</span>
                  </div>
                </div>
                <h3 className="step-title">Select Time &amp; Location</h3>
                <p className="step-desc">
                  Check real-time synced calendars. Choose between visiting the professional's bespoke studio loft or requesting luxury on-site door travel.
                </p>
              </div>
              <span className="step-footer-kicker">Direct Live Scheduling</span>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div>
                <div className="step-top">
                  <span className="step-num">03</span>
                  <div className="step-icon-wrap icon-tertiary">
                    <span className="material-symbols-outlined">shield_lock</span>
                  </div>
                </div>
                <h3 className="step-title">Transparent Checkout</h3>
                <p className="step-desc">
                  Complete bookings with clear price breakdowns. Stripe-powered escrow reserves funds securely until your appointment is concluded.
                </p>
              </div>
              <span className="step-footer-kicker">Escrow Payment Hold</span>
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <div>
                <div className="step-top">
                  <span className="step-num">04</span>
                  <div className="step-icon-wrap icon-primary">
                    <span className="material-symbols-outlined">magic_button</span>
                  </div>
                </div>
                <h3 className="step-title">Glow &amp; Review</h3>
                <p className="step-desc">
                  Enjoy your personalized, high-touch luxury session. Leave authentic verified feedback that elevates your artist's community standing.
                </p>
              </div>
              <span className="step-footer-kicker">Honest Verification Loop</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRUST & PLATFORM GUARANTEES BANNER (DARK STATEMENT CARD) */}
      <section className="charter-section">
        <div className="container">
          <div className="charter-card">
            {/* Ambient Vector Glow */}
            <div className="charter-glow charter-glow--1"></div>
            <div className="charter-glow charter-glow--2"></div>

            <div className="charter-inner">
              {/* Left Column Narrative */}
              <div className="charter-narrative">
                <span className="charter-kicker">The Collective Charter</span>
                <h2 className="charter-title">Elevating Creative Independence, Safeguarding Quality.</h2>
                <p className="charter-desc">
                  Traditional salons claim excessive cuts; generic aggregators lack editorial nuance. BeautyConnect honors the craftsmanship of freelance masters while providing clients with ironclad guarantees.
                </p>
                <div className="charter-actions">
                  <a href="#guarantee-terms" className="btn-charter">Read Guarantee Terms</a>
                  <div className="charter-proof">
                    <span className="material-symbols-outlined">verified_user</span>
                    <span>Licensed &amp; Insured Network</span>
                  </div>
                </div>
              </div>

              {/* Right Column 3 Highlights */}
              <div className="charter-highlights">
                <div className="charter-highlight-card">
                  <div>
                    <div className="charter-icon-box icon-box--primary">
                      <span className="material-symbols-outlined">workspace_premium</span>
                    </div>
                    <h4 className="charter-highlight-title">Vetted Standards</h4>
                    <p className="charter-highlight-desc">
                      Only 14% of applicants receive active listings after comprehensive sanitation and technical review.
                    </p>
                  </div>
                  <div className="charter-highlight-footer footer--primary">
                    <span>100% Verified</span>
                    <span className="material-symbols-outlined">done</span>
                  </div>
                </div>

                <div className="charter-highlight-card">
                  <div>
                    <div className="charter-icon-box icon-box--secondary">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <h4 className="charter-highlight-title">Fair Pro Model</h4>
                    <p className="charter-highlight-desc">
                      Independent artists keep 92% of gross earnings. You directly empower solo entrepreneurship.
                    </p>
                  </div>
                  <div className="charter-highlight-footer footer--secondary">
                    <span>Fair Pay Policy</span>
                    <span className="material-symbols-outlined">done</span>
                  </div>
                </div>

                <div className="charter-highlight-card">
                  <div>
                    <div className="charter-icon-box icon-box--tertiary">
                      <span className="material-symbols-outlined">sentiment_very_satisfied</span>
                    </div>
                    <h4 className="charter-highlight-title">Delight Guarantee</h4>
                    <p className="charter-highlight-desc">
                      If an artist must cancel due to emergency, our VIP concierge rebooks an equivalent master artist instantly.
                    </p>
                  </div>
                  <div className="charter-highlight-footer footer--tertiary">
                    <span>24/7 Concierge</span>
                    <span className="material-symbols-outlined">done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS & PRESS MENTIONS */}
      <section className="testimonials-section">
        <div className="container">
          <div className="testimonials-header">
            <div>
              <span className="kicker-tag">04 / Authentic Stories</span>
              <h2 className="section-title">Loved by Discerning Clients</h2>
            </div>
            <div className="rating-summary-pill">
              <div className="star-row">
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <span className="rating-score">4.96 / 5.0</span>
              <span className="rating-bookings">(Over 3,400 Verified Bookings)</span>
            </div>
          </div>

          <div className="testimonials-grid">
            {/* Review 1 */}
            <div className="testimonial-card">
              <div>
                <div className="testimonial-stars">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="testimonial-quote">
                  "Booking Aria for my Plaza Hotel wedding morning was the single easiest part of planning. Her lookbook was 100% reflective of her magic. She arrived 15 minutes early and brought total calm."
                </p>
              </div>
              <div className="testimonial-footer">
                <div className="testimonial-author">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5dcd_9I_hRTBuBYpnl_Fg-ZdNWvAQCOZaW7D0lSo1XwFlQw0J3Ze3qJBMLCsPlQvH8cR-vQnUtdJ1P3ZQNid-9vOapX5oomdptI-xCYKshCi6aJSntpP4x3kvG3sSaujED6zkAJCPqw203qqYz0lSCvcvtU9ioSbspV7TGoDFhsLc5nu7NWkLkaoEz-7jdlk4KYGhgI3dcRIUU6cumj30BKnUdhdk_GQR1tVstMALR07fun783r9wPg"
                    alt="Claire Davenport"
                    className="testimonial-avatar"
                  />
                  <div>
                    <h5 className="testimonial-name">Claire Davenport</h5>
                    <span className="testimonial-role">Bridal Makeup Client</span>
                  </div>
                </div>
                <span className="testimonial-badge">Verified Stay</span>
              </div>
            </div>

            {/* Review 2 */}
            <div className="testimonial-card">
              <div>
                <div className="testimonial-stars">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="testimonial-quote">
                  "Marcus sculpted my hair for the Tribeca Film premiere. No awkward salon chatter or inflated upsells. Just pristine runway-level execution and transparent pricing right up front."
                </p>
              </div>
              <div className="testimonial-footer">
                <div className="testimonial-author">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBInYrQhwnuMpOZZoZVcxr4q_dKm8035a2DaqNdlwyu-RIGR4J4GQTkvQv_CbuFKX_hCXcfm3t_4RUqsqiHSjfQYVPZg6p3IgUH1f8B0r8y3eh-ewZca1Zckh-JJJiUzmm6qUd2W7gj6o1RAQvFG7DYcCcGv8K37MNNA_25Tqeq6bk543aIM_FH91hAyXuoaFew1rb5W7_K99wlBr88XXfsG4qAESJcUl4WQP4xzJ9hapJUBT-Og6_ifQ"
                    alt="Vivienne Laurent"
                    className="testimonial-avatar"
                  />
                  <div>
                    <h5 className="testimonial-name">Vivienne Laurent</h5>
                    <span className="testimonial-role">Editorial Hair Client</span>
                  </div>
                </div>
                <span className="testimonial-badge">Verified Stay</span>
              </div>
            </div>

            {/* Review 3 */}
            <div className="testimonial-card">
              <div>
                <div className="testimonial-stars">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="testimonial-quote">
                  "Finding Sora Kim on BeautyConnect saved my nail beds. Her Japanese gel technique lasted 4 weeks with zero lifting. The booking and payment system feels like modern bespoke luxury."
                </p>
              </div>
              <div className="testimonial-footer">
                <div className="testimonial-author">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZph9pNAsqr9lH7bYjE5net3GuBjlWXIvIxkksRj_pv2ezn878C66exjCFY844yQ9vVYGtrJ4v8wSrVTRyPLd9-BuT17O-bJSeXLcBotr330mlzN2pGsxCGZWYz07RLzFUXGegdbHNULz0m_WfKmau9mbEzB2812jAIsRklhpwWtk-gkpc-b9Vk6g7RdMaFD8CTLKodIPN5krCp5hVUcBqi_1BRSHsxqm0FJCKeRRbdhe7jVz93xOUJw"
                    alt="Naomi Tanaka"
                    className="testimonial-avatar"
                  />
                  <div>
                    <h5 className="testimonial-name">Naomi Tanaka</h5>
                    <span className="testimonial-role">Atelier Gel Client</span>
                  </div>
                </div>
                <span className="testimonial-badge">Verified Stay</span>
              </div>
            </div>
          </div>

          {/* Press Mentions */}
          <div className="press-ticker-section">
            <span className="press-kicker">Featured In Curated Publications</span>
            <div className="press-logos">
              <span className="press-logo-vogue">VOGUE EDITORIAL</span>
              <span className="press-logo-elle">ELLE BEAUTÉ</span>
              <span className="press-logo-bazaar">HARPER'S BAZAAR</span>
              <span className="press-logo-allure">ALLURE CURATION</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONCIERGE CALLOUT BANNER */}
      <section className="concierge-section">
        <div className="container concierge-inner">
          <div className="concierge-badge">
            <span className="material-symbols-outlined">diamond</span>
          </div>
          <h2 className="section-title">
            Planning an Editorial Campaign or Destination Wedding?
          </h2>
          <p className="concierge-desc">
            Our BeautyConnect Private Concierge coordinates multi-artist teams, travel riders, and bespoke lookbook direction for large private events.
          </p>
          <div className="concierge-actions">
            <Link to="/#concierge" className="btn-primary-large">
              Request Concierge Curation
            </Link>
            <Link to="/search" className="btn-secondary-large">
              Explore Artist Portfolios
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
