import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { User, Brush, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Link as LinkIcon, BadgePercent } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [role, setRole] = useState('Customer'); // Customer or Professional
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (isLoginMode) {
        const data = await login(email, password);
        redirectBasedOnRole(data.role);
      } else {
        if (!agreeTerms) {
          setErrorMessage('Please accept the Terms of Service.');
          setLoading(false);
          return;
        }

        const payload = {
          email,
          password,
          role: role === 'Customer' ? 0 : 1, // UserRole enum
          fullName: fullName.trim() || undefined,
          businessName: role === 'Professional' ? (businessName.trim() || `${fullName} Studio`) : undefined,
          speciality: role === 'Professional' ? speciality : undefined,
          city: city.trim() || undefined,
        };

        const data = await register(payload);
        redirectBasedOnRole(data.role);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (userRole) => {
    if (userRole === 'Admin') {
      navigate('/admin');
    } else if (userRole === 'Professional') {
      navigate('/pro-dashboard');
    } else {
      navigate('/customer-dashboard');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#fff8f8] text-[#1f1a1b] font-body selection:bg-[#ffdad6] selection:text-[#3d0506]">
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#fff8f8]/90 backdrop-blur-md border-b border-[#dac1be]/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="font-headline text-2xl font-bold tracking-tight text-[#1f1a1b] group-hover:text-[#954741] transition-colors">
              BeautyConnect
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-[#544341] hover:text-[#954741] transition-colors"
          >
            Return to Explore
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="w-full flex-1 pt-16 flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Left Editorial Brand Panel */}
        <section className="lg:w-1/2 relative flex flex-col justify-between p-8 lg:p-14 overflow-hidden min-h-[500px]">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#2a1c1d]/90 via-[#352f30]/60 to-[#352f30]/30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#954741]/40 to-[#865225]/30 mix-blend-multiply"></div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold text-xs tracking-widest uppercase">
                Atelier Edition № 04
              </span>
              <span className="w-2 h-2 rounded-full bg-[#d87d75] animate-pulse"></span>
            </div>
            <span className="text-white/60 tracking-wider text-xs select-none uppercase font-medium">
              Paris • New York • London
            </span>
          </div>

          <div className="relative z-10 my-auto py-12 max-w-lg">
            <div className="w-10 h-0.5 bg-[#d87d75] mb-6"></div>
            <blockquote className="font-headline text-white leading-tight text-3xl lg:text-4xl mb-4 italic font-normal">
              “The premier atelier network for visionary freelance artists and discerning clients.”
            </blockquote>
            <p className="text-white/80 text-sm font-light leading-relaxed">
              Where tactile intimacy meets seamless appointments. Curated master portfolios, protected escrow payouts, and bespoke styling experiences crafted without compromise.
            </p>

            <div className="mt-8 flex items-center gap-4 p-3 rounded-2xl bg-white/10 backdrop-blur-md max-w-xs shadow-lg border border-white/20">
              <img
                className="w-12 h-12 rounded-xl object-cover shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw8QaVaPRhTLGE9y6cdsf5QQlNMen7fVAuJLIckDB0YVy2Iez5W0KY87vAwY9n6JVP1d-FIkxqXSqj9aBwbfe0_ZFuaNOMGOTu7wpR447PcQuOKbBitXpUupAWnVG5Wlx3A4DDFVSoYfs7-U-9j02ct1BfU2-iFsAfEiC6VgsEDqhLOfyLDrNMG7UOK9biUBfEdiBWeRrL4jd45oWTGgYuB7JLGkCxuRAMpeZEetWCnKRA9NuwBCYXsA"
                alt="Elena Rostova"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-white text-sm">Elena Rostova</span>
                <span className="text-[#ffdcc3] text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#fdb882]" />
                  Master Bridal Stylist • NYC
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6">
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#352f30]/60 backdrop-blur-md text-white border border-white/10">
              <div className="flex flex-col">
                <span className="font-bold text-[#d87d75] text-xl">380+</span>
                <span className="text-white/70 text-[11px]">Vetted Master Artists</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#d87d75] text-xl">5%</span>
                <span className="text-white/70 text-[11px]">Fair Commission</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#d87d75] text-xl">100%</span>
                <span className="text-white/70 text-[11px]">Stripe Escrow Safe</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Authentication Panel */}
        <section className="lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-14 overflow-y-auto">
          <div className="w-full max-w-md flex flex-col">
            {/* Role Switcher */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-[#544341] font-semibold mb-2">
                Select Your Platform Persona
              </label>
              <div className="p-1.5 rounded-full bg-[#f6ebec] flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => setRole('Customer')}
                  className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    role === 'Customer'
                      ? 'bg-[#d87d75] text-white shadow-sm'
                      : 'text-[#544341] hover:text-[#1f1a1b]'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Client / Guest</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Professional')}
                  className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    role === 'Professional'
                      ? 'bg-[#d87d75] text-white shadow-sm'
                      : 'text-[#544341] hover:text-[#1f1a1b]'
                  }`}
                >
                  <Brush className="w-4 h-4" />
                  <span>Beauty Professional</span>
                </button>
              </div>
            </div>

            {/* Auth Glass Card */}
            <div
              className="p-8 rounded-3xl flex flex-col relative"
              style={{
                background: 'rgba(255, 248, 248, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 20px 40px -15px rgba(53, 47, 48, 0.1)',
              }}
            >
              {/* Tabs */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#dac1be]/40">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(false)}
                    className={`font-headline text-lg pb-1 relative transition-colors ${
                      !isLoginMode ? 'text-[#954741] font-bold' : 'text-[#544341] hover:text-[#1f1a1b]'
                    }`}
                  >
                    Create Account
                    {!isLoginMode && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#954741] rounded-full"></span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(true)}
                    className={`font-headline text-lg pb-1 relative transition-colors ${
                      isLoginMode ? 'text-[#954741] font-bold' : 'text-[#544341] hover:text-[#1f1a1b]'
                    }`}
                  >
                    Welcome Back
                    {isLoginMode && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#954741] rounded-full"></span>
                    )}
                  </button>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#f6ebec] text-[#544341] font-medium">
                  Secured SSL
                </span>
              </div>

              {/* Pro Badge Callout */}
              {role === 'Professional' && (
                <div className="mb-5 p-3.5 rounded-2xl bg-[#ffdcc3]/40 border border-[#fdb882]/50 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#865225] shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#2f1500]">Pro Certification Guarantee</span>
                    <p className="text-xs text-[#6a3b10] mt-0.5">
                      All beauty professionals undergo profile and license review by Admin before appearing in public search.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {!isLoginMode && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#1f1a1b]">Full Legal Name</label>
                      <div className="relative flex items-center">
                        <User className="absolute left-3.5 text-[#877270] w-4 h-4 pointer-events-none z-10" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Vivienne St. Claire"
                          className="w-full h-11 input-with-icon pr-4 rounded-xl bg-white/80 text-[#1f1a1b] text-sm border border-[#dac1be]/60 focus:outline-none focus:border-[#d87d75] transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    {role === 'Professional' && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-[#1f1a1b]">Business / Studio Name</label>
                          <div className="relative flex items-center">
                            <Sparkles className="absolute left-3.5 text-[#877270] w-4 h-4 pointer-events-none z-10" />
                            <input
                              type="text"
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              placeholder="e.g. Atelier Claire Artistry"
                              className="w-full h-11 input-with-icon pr-4 rounded-xl bg-white/80 text-[#1f1a1b] text-sm border border-[#dac1be]/60 focus:outline-none focus:border-[#d87d75] transition-all shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-[#1f1a1b] flex items-center justify-between">
                            <span>Artistic Specialty</span>
                            <span className="text-[11px] text-[#954741]">Required</span>
                          </label>
                          <select
                            value={speciality}
                            onChange={(e) => setSpeciality(e.target.value)}
                            required
                            className="w-full h-11 px-4 rounded-xl bg-white/80 text-[#1f1a1b] text-sm border border-[#dac1be]/60 focus:outline-none focus:border-[#d87d75] transition-all shadow-sm cursor-pointer"
                          >
                            <option value="">Select specialty discipline...</option>
                            <option value="Bridal Makeup & Sculpting">Bridal Makeup & Sculpting</option>
                            <option value="Editorial & Couture Hair Styling">Editorial & Couture Hair Styling</option>
                            <option value="Master Esthetician & Skin Care">Master Esthetician & Skin Care</option>
                            <option value="High-Fashion Nail Artistry">High-Fashion Nail Artistry</option>
                            <option value="Balayage & Precision Colorist">Balayage & Precision Colorist</option>
                            <option value="Lash & Micro-Pigment Specialist">Lash & Micro-Pigment Specialist</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-[#1f1a1b]">City / Location</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. New York, NY"
                            className="w-full h-11 px-4 rounded-xl bg-white/80 text-[#1f1a1b] text-sm border border-[#dac1be]/60 focus:outline-none focus:border-[#d87d75] transition-all shadow-sm"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1f1a1b]">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 text-[#877270] w-4 h-4 pointer-events-none z-10" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@beautyatelier.com"
                      className="w-full h-11 input-with-icon pr-4 rounded-xl bg-white/80 text-[#1f1a1b] text-sm border border-[#dac1be]/60 focus:outline-none focus:border-[#d87d75] transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1f1a1b]">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 text-[#877270] w-4 h-4 pointer-events-none z-10" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full h-11 input-with-icon pr-11 rounded-xl bg-white/80 text-[#1f1a1b] text-sm border border-[#dac1be]/60 focus:outline-none focus:border-[#d87d75] transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#877270] hover:text-[#1f1a1b] p-1 z-10"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {!isLoginMode && (
                    <div className="mt-1 flex flex-col gap-1">
                      <div className="flex gap-1.5 h-1 w-full">
                        <div className={`h-full flex-1 rounded-full ${strength >= 1 ? 'bg-[#954741]' : 'bg-[#e2d8d9]'}`} />
                        <div className={`h-full flex-1 rounded-full ${strength >= 2 ? 'bg-[#d87d75]' : 'bg-[#e2d8d9]'}`} />
                        <div className={`h-full flex-1 rounded-full ${strength >= 3 ? 'bg-[#865225]' : 'bg-[#e2d8d9]'}`} />
                        <div className={`h-full flex-1 rounded-full ${strength >= 4 ? 'bg-emerald-600' : 'bg-[#e2d8d9]'}`} />
                      </div>
                      <span className="text-[11px] text-[#544341] text-right">
                        {strength < 2 ? 'Weak' : strength < 3 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>

                {!isLoginMode && (
                  <div className="flex items-start gap-2.5 mt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-[#954741] accent-[#954741] cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs text-[#544341] leading-relaxed cursor-pointer select-none">
                      I agree to the <span className="text-[#954741] underline">Terms of Service</span>, Atelier Escrow Code, and <span className="text-[#954741] underline">Privacy Policy</span>.
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full h-12 rounded-full bg-[#d87d75] hover:bg-[#c46860] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70"
                >
                  <span>{loading ? 'Processing...' : isLoginMode ? 'Sign In to Atelier' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <p className="mt-5 text-center text-xs text-[#544341]">
              Protected by 256-bit AES encryption. Trusted by independent stylists nationwide.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
