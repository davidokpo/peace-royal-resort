import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tv, Zap, BedDouble, Plane, Briefcase, ArrowUpRight, Compass, Sparkles } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import { HOTEL_IMAGES, HOTEL_CONTACT } from '@/config/siteContent.js';

const HomePage = () => {
  const amenities = [
    { icon: Tv, title: 'Smart Entertainment', desc: '4K Smart TVs with Netflix & Live Football streaming' },
    { icon: Zap, title: 'Uninterrupted Solar', desc: '24/7 clean solar inverter & dedicated generator backup' },
    { icon: BedDouble, title: 'Orthopedic Sleep', desc: 'Hotel-grade pocket spring mattresses for deep restoration' },
    { icon: Plane, title: 'Chauffeured Pickup', desc: 'Punctual airport arrivals & VIP dispatch upon request' },
  ];

  const spaces = [
    {
      title: 'Sanctuary Rooms',
      desc: 'Minimalist restraint, premium linens, and quiet comfort.',
      link: '/rooms',
      badge: 'From ₦50,000/night',
      image: HOTEL_IMAGES.roomExecutive
    },
    {
      title: 'The Restaurant',
      desc: 'Authentic African culinary art and fresh regional specials.',
      link: '/restaurant',
      badge: 'All-Day Dining',
      image: HOTEL_IMAGES.foodJollof
    },
    {
      title: 'Artisan Cafe & Terrace',
      desc: 'Freshly brewed single-origin roasts, matcha, and board games.',
      link: '/cafe',
      badge: 'Open Daily',
      image: HOTEL_IMAGES.cafePhoto
    },
  ];

  return (
    <>
      <Helmet>
        <title>Peace Royal Resort | Home of Peace · Gwarimpa, Abuja</title>
        <meta
          name="description"
          content="Tranquil luxury in Gwarimpa, Abuja. Therapeutic balcony mornings, artisanal dining, and uninterrupted comfort."
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <Header />
        <SidebarNavigation />

        <main className="pb-16 md:pb-0 w-full overflow-hidden">
          {/* Hero Section */}
          <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={HOTEL_IMAGES.homeHero}
                alt="Peace Royal Resort exterior"
                className="w-full h-full object-cover object-center scale-105"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/55 to-black/35" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-24 sm:py-32 text-center flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium tracking-wider uppercase mb-6"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E6CF9E]" />
                <span>Home of Peace &middot; Gwarimpa Sanctuary</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-serif text-4xl sm:text-6xl md:text-7xl font-semibold text-white tracking-tight leading-[1.08] text-balance max-w-4xl"
              >
                Home of Peace
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 text-lg sm:text-xl md:text-2xl text-white/85 font-light leading-relaxed max-w-2xl text-balance"
              >
                Where mornings taste like peace and nights feel like home.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="mt-2 text-xs sm:text-sm text-white/70 font-mono tracking-wide"
              >
                {HOTEL_CONTACT.address}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
              >
                <Link
                  to="/rooms"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold bg-white text-[#142B1F] hover:bg-[#F3F1EC] transition-all shadow-lg active:scale-[0.98]"
                >
                  <span>Reserve a Room</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/garden"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium bg-black/30 backdrop-blur-md border border-white/25 text-white hover:bg-black/45 transition-all active:scale-[0.98]"
                >
                  <span>Explore Garden</span>
                  <Compass className="w-4 h-4 opacity-80" />
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Core Privileges / Minimalist Strip */}
          <section className="py-20 bg-background border-b border-border/50">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <div className="text-center max-w-xl mx-auto mb-14">
                <span className="text-xs uppercase tracking-widest font-semibold text-primary">Uncompromising Comfort</span>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold mt-2 text-foreground">
                  Quiet Luxury in Every Detail
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {amenities.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                      className="p-6 rounded-2xl bg-card border border-border/60 hover:border-border transition-all duration-300"
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 stroke-[2]" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1.5">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Balcony Morning Highlight */}
          <section className="py-24 bg-card/40 border-b border-border/50">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-7 relative"
                >
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-border/80 shadow-md">
                    <img
                      src={HOTEL_IMAGES.balconyPhoto}
                      alt="Peace Royal Resort balcony experience"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="lg:col-span-5 space-y-6"
                >
                  <span className="text-xs uppercase tracking-widest font-semibold text-primary">Signature Experience</span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
                    Therapeutic Mornings on the Private Balcony
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Start your day in Gwarimpa with single-origin pour-over tea, a fresh morning press, and the gentle dawn breeze. Slow down, breathe deeply, and reconnect with clarity.
                  </p>
                  <div>
                    <Link
                      to="/balcony-booking"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                    >
                      <span>Reserve Balcony Morning</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Curated Spaces Grid */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest font-semibold text-primary">Curated Spaces</span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-semibold mt-2 text-foreground">
                    Intentional Design for Rest & Delight
                  </h2>
                </div>
                <Link to="/rooms" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  <span>View all accommodations</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {spaces.map((space, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="group rounded-3xl overflow-hidden bg-card border border-border/70 flex flex-col transition-all hover:shadow-lg hover:border-border"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={space.image}
                        alt={space.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-white/95">
                        {space.badge}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{space.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-6">{space.desc}</p>
                      <Link
                        to={space.link}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline"
                      >
                        <span>Explore Space</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Commuter Breakfast Banner */}
          <section className="py-20 bg-[#122419] text-[#F3F1EC] relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto mb-6 flex items-center justify-center text-[#E6CF9E]">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4 text-[#F3F1EC]">
                Always on the move?
              </h2>
              <p className="text-sm sm:text-base text-[#D5DCD2]/85 mb-8 leading-relaxed max-w-xl mx-auto">
                Request our signature <strong className="text-white font-medium">Commuter Breakfast Bag</strong>. Freshly packed artisan warm pastries, fruit cup, and single-origin roast coffee ready whenever you head out.
              </p>
              <Link
                to="/cafe"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-white text-[#122419] hover:bg-[#F3F1EC] transition-all shadow-sm"
              >
                <span>View Cafe Menu</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
