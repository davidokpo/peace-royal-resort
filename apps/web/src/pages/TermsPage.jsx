import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';

const sections = [
  {
    title: 'Bookings and Reservations',
    body:
      'All room, balcony, garden, wellness, cafe, and restaurant requests submitted through Peace Royal Resort are treated as booking or order requests until they are reviewed and confirmed by the hotel team. Availability can change before final confirmation.',
  },
  {
    title: 'Payment Options',
    body:
      'Guests may choose to pay online through Paystack or pay on ground where that option is presented. Online payments are subject to Paystack processing and confirmation. A booking marked for pay on ground remains subject to hotel confirmation and on-site settlement.',
  },
  {
    title: 'Pricing and Changes',
    body:
      'Displayed prices, taxes, packages, menus, and service availability may be updated by the hotel without prior notice. If there is a pricing or availability issue after submission, the hotel will contact the guest before final confirmation.',
  },
  {
    title: 'Guest Information',
    body:
      'You agree that the contact and booking details you submit are accurate and belong to you or to a person you are authorized to book for. Inaccurate or incomplete details may delay or prevent confirmation.',
  },
  {
    title: 'Cancellations and Adjustments',
    body:
      'Changes, reschedules, or cancellations should be requested directly through the hotel contact channels shown on the website. Refunds for online payments, where applicable, are handled subject to hotel review and Paystack processing rules.',
  },
  {
    title: 'Use of the Website',
    body:
      'You may not use the website for fraudulent reservations, false payment attempts, abuse of the booking system, or any activity that interferes with the operation of the site or the hotel business.',
  },
  {
    title: 'Liability',
    body:
      'Peace Royal Resort will use reasonable care in operating the website and handling reservations, but does not guarantee uninterrupted availability of the site, third-party payment services, email delivery, or network connections.',
  },
  {
    title: 'Contact',
    body:
      'Questions about these terms should be directed to Peace Royal Resort through the phone number or email address listed on the website footer.',
  },
];

const TermsPage = () => (
  <>
    <Helmet>
      <title>Terms & Conditions - Peace Royal Resort</title>
      <meta
        name="description"
        content="Terms and conditions for bookings, payments, and website use at Peace Royal Resort."
      />
    </Helmet>

    <div className="min-h-screen bg-[#F6F0E6] organic-pattern">
      <Header />
      <SidebarNavigation />

      <main className="lg:ml-24 pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 rounded-[2rem] border border-[#2F3A2F]/10 bg-white/80 p-8 shadow-[0_18px_60px_rgba(55,43,25,0.10)] backdrop-blur-md md:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#7C5B3B]">
              Legal
            </p>
            <h1 className="heading-font mt-4 text-4xl font-bold text-[#2F3A2F] md:text-5xl">
              Terms & Conditions
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5A6458]">
              These terms govern the use of the Peace Royal Resort website and the
              booking, reservation, and payment requests made through it.
            </p>
          </div>

          <div className="grid gap-5">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[1.75rem] border border-[#2F3A2F]/10 bg-white/75 p-6 shadow-[0_12px_40px_rgba(55,43,25,0.08)] backdrop-blur-sm md:p-8"
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

export default TermsPage;
