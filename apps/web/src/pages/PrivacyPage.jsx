import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';

const sections = [
  {
    title: 'Information We Collect',
    body:
      'When you submit a booking or order, we may collect your name, email address, phone number, service selections, preferred dates and times, guest counts, special requests, allergy notes, payment status, payment reference, and other reservation details relevant to the page you used.',
  },
  {
    title: 'How We Use Your Information',
    body:
      'Your information is used to receive and manage reservations, process online payments, contact you about your booking or order, confirm payment method, coordinate service delivery, and keep internal booking records.',
  },
  {
    title: 'Payments',
    body:
      'Online payments are initiated through Paystack. Peace Royal Resort does not store your full card details on this website. Payment references and status updates may be stored so the hotel can verify successful transactions.',
  },
  {
    title: 'Storage and Internal Notifications',
    body:
      'Booking and order records may be stored in Google Sheets, local backup storage used by the booking system, and email notifications sent to the hotel team. Different services may be stored in separate Google Sheets tabs so each booking type keeps the right data columns.',
  },
  {
    title: 'Communication',
    body:
      'We may use your submitted email address or phone number to confirm reservations, discuss payment method, respond to questions, and share updates related to your request.',
  },
  {
    title: 'Cookies and Browser Storage',
    body:
      'The website may use session storage or local storage in your browser to preserve booking state, payment progress, and temporary form-related information during your visit.',
  },
  {
    title: 'Sharing',
    body:
      'Your information is shared only with service providers required to operate the booking flow, such as Paystack for online payments and Google services for booking record storage, or where disclosure is required by law.',
  },
  {
    title: 'Your Rights',
    body:
      'If you need a submitted booking corrected or want to request deletion of a booking record where permitted, contact Peace Royal Resort directly using the website contact details.',
  },
];

const PrivacyPage = () => (
  <>
    <Helmet>
      <title>Privacy Policy - Peace Royal Resort</title>
      <meta
        name="description"
        content="Privacy policy for bookings, payments, storage, and communications at Peace Royal Resort."
      />
    </Helmet>

    <div className="min-h-screen bg-[#EEF2E6] organic-pattern">
      <Header />
      <SidebarNavigation />

      <main className="lg:ml-24 pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 rounded-[2rem] border border-[#58705B]/10 bg-white/80 p-8 shadow-[0_18px_60px_rgba(40,61,44,0.10)] backdrop-blur-md md:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#58705B]">
              Legal
            </p>
            <h1 className="heading-font mt-4 text-4xl font-bold text-[#2F3A2F] md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#566156]">
              This policy explains how Peace Royal Resort handles reservation,
              payment, and contact data submitted through the website.
            </p>
          </div>

          <div className="grid gap-5">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[1.75rem] border border-[#58705B]/10 bg-white/75 p-6 shadow-[0_12px_40px_rgba(40,61,44,0.08)] backdrop-blur-sm md:p-8"
              >
                <h2 className="heading-font text-2xl font-bold text-[#2F3A2F]">
                  {section.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-[#546053]">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  </>
);

export default PrivacyPage;
