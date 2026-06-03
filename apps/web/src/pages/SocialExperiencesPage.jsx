import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  Club,
  Gamepad2,
  Flower2,
  Heart,
  PartyPopper,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import GardenExperienceToggle from '@/components/GardenExperienceToggle.jsx';
import { HOTEL_IMAGES } from '@/config/siteContent.js';

const SocialExperiencesPage = () => {
  const [experienceMode, setExperienceMode] = useState('day');

  const dayExperiences = [
    {
      id: 'deck-dawn',
      title: 'Deck & Dawn',
      subtitle: 'Social Balcony',
      description: 'Card games and therapeutic breakfasts on the balcony with Gwarimpa skyline view.',
      icon: Club,
      glowClass: 'neon-glow-green',
      iconColor: 'text-primary',
      cta: 'Reserve Balcony Spot',
      link: '/balcony-booking',
    },
    {
      id: 'breakfast-flow',
      title: 'Morning Reset',
      subtitle: 'Balcony Breakfast',
      description: 'Slow tea, pastries, skyline air, and an easier start to the day for couples or solo guests.',
      icon: Sparkles,
      glowClass: 'neon-glow-amber',
      iconColor: 'text-secondary',
      cta: 'Plan Balcony Morning',
      link: '/balcony-booking',
    },
    {
      id: 'game-night',
      title: 'Friday Game Night',
      subtitle: 'Cafe Board Games',
      description: 'Monopoly, Chess, and Scrabble. Community vibes in our minimalist cafe. Every Friday.',
      icon: Gamepad2,
      glowClass: 'neon-glow-amber',
      iconColor: 'text-secondary',
      cta: 'Order & Reserve Table',
      link: '/cafe',
    },
    {
      id: 'digital-detox',
      title: 'Digital Detox',
      subtitle: 'Wellness',
      description: 'Yoga and meditation with a slower, quieter energy when you want a softer social plan.',
      icon: Flower2,
      glowClass: 'neon-glow-green',
      iconColor: 'text-primary',
      cta: 'Book Wellness Session',
      link: '/wellness',
    },
  ];

  const nightExperiences = [
    {
      id: 'proposal-night',
      title: 'Proposal Moments',
      subtitle: 'Private Garden Event',
      description: 'Intimate proposal styling with candlelit tables, decor accents, and a more private evening setup.',
      icon: Heart,
      glowClass: 'neon-glow-amber',
      iconColor: 'text-secondary',
      cta: 'Book Proposal Setup',
      link: '/garden-booking',
    },
    {
      id: 'birthday-garden',
      title: 'Birthday Garden',
      subtitle: 'Private Celebration',
      description: 'Use the garden for birthdays, surprise dinners, and styled small-group celebrations.',
      icon: PartyPopper,
      glowClass: 'neon-glow-green',
      iconColor: 'text-primary',
      cta: 'Plan Birthday Event',
      link: '/garden-booking',
    },
    {
      id: 'spice-cinema',
      title: 'Spice & Cinema',
      subtitle: 'Garden After Dark',
      description: 'Fresh pepper soup, warm lighting, and an outdoor movie atmosphere under the stars.',
      icon: Flame,
      glowClass: 'neon-glow-amber',
      iconColor: 'text-secondary',
      cta: 'Book Garden Experience',
      link: '/garden-booking',
    },
    {
      id: 'private-linkup',
      title: 'Private Link-Up',
      subtitle: 'Events & Linkups',
      description: 'A clean option for curated hangouts, mini celebrations, and private evening link-ups.',
      icon: Sparkles,
      glowClass: 'neon-glow-green',
      iconColor: 'text-primary',
      cta: 'Reserve Event Space',
      link: '/garden-booking',
    },
  ];

  const sectionContent = useMemo(() => {
    if (experienceMode === 'night') {
      return {
        eyebrow: 'Private Events',
        title: 'Curated for celebrations',
        description:
          'When the slider moves into the event side, the write-up and menu switch with it: proposals, birthdays, private link-ups, and other styled garden moments.',
        experiences: nightExperiences,
      };
    }

    return {
      eyebrow: 'Social Plans',
      title: 'Curated for connection',
      description:
        'Use the daytime side for lighter social plans: balcony breakfasts, cafe game nights, and softer reset experiences.',
      experiences: dayExperiences,
    };
  }, [experienceMode]);

  return (
    <>
      <Helmet>
        <title>Social Experiences - Peace Royal Resort</title>
        <meta
          name="description"
          content="Discover unique social experiences at Peace Royal Resort. From Garden After Dark to Friday Game Nights and Social Balcony breakfasts."
        />
      </Helmet>

      <div className="min-h-screen bg-background dot-pattern">
        <Header />
        <SidebarNavigation />

        <main className="pb-20 lg:pb-0 pt-20">
          <section className="relative h-[60vh] overflow-hidden">
            <img
              src={HOTEL_IMAGES.socialHero}
              alt="Vibrant garden party with warm lighting"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center px-4"
              >
                <h1
                  className="heading-font mb-6 text-5xl font-bold text-white text-balance md:text-6xl lg:text-7xl"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  Social Experiences
                </h1>
                <p className="mx-auto max-w-2xl text-xl leading-relaxed text-white/90 md:text-2xl">
                  Connect, unwind, and create memories in our curated spaces.
                </p>
              </motion.div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <GardenExperienceToggle onModeChange={setExperienceMode} />

            <div className="mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-16 text-center"
              >
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-primary/75">
                  {sectionContent.eyebrow}
                </p>
                <h2 className="heading-font mb-4 text-4xl font-bold text-foreground text-balance md:text-5xl">
                  {sectionContent.title}
                </h2>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  {sectionContent.description}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {sectionContent.experiences.map((exp, index) => {
                  const Icon = exp.icon;

                  return (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="glassmorphic-card group flex h-full flex-col rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div
                        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-sm transition-all duration-300 group-hover:shadow-xl"
                      >
                        <Icon className={`h-8 w-8 ${exp.iconColor}`} />
                      </div>

                      <div className="mb-2">
                        <span className="text-sm font-semibold uppercase tracking-wider text-primary/80">
                          {exp.subtitle}
                        </span>
                      </div>

                      <h3 className="heading-font mb-4 text-3xl font-bold text-foreground">
                        {exp.title}
                      </h3>

                      <p className="mb-8 flex-grow text-lg leading-relaxed text-muted-foreground">
                        {exp.description}
                      </p>

                      <div className="mt-auto">
                        <Button
                          asChild
                          className="w-full py-6 text-lg transition-all duration-200 active:scale-[0.98] bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Link to={exp.link}>{exp.cta}</Link>
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SocialExperiencesPage;
