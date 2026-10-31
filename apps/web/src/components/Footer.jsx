import React from 'react';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { HOTEL_CONTACT } from '@/config/siteContent.js';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: 'Executive & Deluxe Rooms', href: '/rooms' },
    { label: 'Royal Restaurant & Dining', href: '/restaurant' },
    { label: 'Artisan Cafe & Boardgames', href: '/cafe' },
    { label: 'Wellness & Spa Oasis', href: '/wellness' },
    { label: 'Garden & Filmshow Bookings', href: '/garden' },
    { label: 'Private Balcony Reserve', href: '/balcony' }
  ];

  const services = [
    '24/7 Clean Solar Inverter Power',
    'VIP Airport Pickup & Drop-off',
    'Artisan Commuter Breakfast',
    'Ultra High-Speed Guest Wi-Fi',
    'Orthopedic Pocket-Spring Beds',
    'Private Garden & Outdoor Screen'
  ];

  return (
    <footer className="w-full bg-[#0F2016] text-[#F3F1EC] border-t border-[#1C3B2B]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand & Ethos */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <Logo size="medium" />
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#F3F1EC] leading-tight">
                  Peace Royal Resort
                </h3>
                <p className="text-xs text-[#A3B899] font-medium tracking-wide">
                  Baile na Síochána
                </p>
              </div>
            </Link>
            <p className="text-sm text-[#D5DCD2]/80 leading-relaxed pt-2">
              Where mornings taste like peace and nights feel like home. A tranquil botanical sanctuary in the heart of Gwarimpa, Abuja.
            </p>
          </div>

          {/* Experiences */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#C9A66B]">
              Resort Experiences
            </h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-[#D5DCD2]/85 hover:text-[#FFFFFF] transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guest Privileges */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#C9A66B]">
              Guest Privileges
            </h4>
            <ul className="space-y-2 text-sm text-[#D5DCD2]/85">
              {services.map((service) => (
                <li key={service} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B]/70 shrink-0" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#C9A66B]">
              Location & Contact
            </h4>
            <div className="space-y-3 text-sm text-[#D5DCD2]/85">
              <a
                href={HOTEL_CONTACT.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2.5 hover:text-white transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#C9A66B] mt-0.5 shrink-0" />
                <span className="leading-snug">{HOTEL_CONTACT.address}</span>
              </a>

              <a
                href={`tel:${HOTEL_CONTACT.phone}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span>{HOTEL_CONTACT.phone}</span>
              </a>

              <a
                href={`mailto:${HOTEL_CONTACT.email}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span>{HOTEL_CONTACT.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom hairline & copyright */}
        <div className="mt-14 pt-8 border-t border-[#1C3B2B]/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A3B899]">
          <p>
            &copy; {currentYear} Peace Royal Resort. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/rooms" className="text-[#C9A66B] hover:underline font-medium">
              Reserve Room
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
