import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Flower2,
  Gamepad2,
  Crown,
  Loader2,
  Sparkles,
  CheckCircle2,
  Coffee,
  Trees,
  Waves,
  BriefcaseBusiness,
  Wifi,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import TurnstileField, { isTurnstileEnabled } from '@/components/TurnstileField.jsx';
import { HOTEL_IMAGES, HOTEL_CONTACT } from '@/config/siteContent.js';
import { submitBookingRequest } from '@/lib/bookingSubmission.js';
import { startCheckoutOrShowPending } from '@/lib/paymentCheckout.js';

const packages = [
  {
    id: 'Luxury Package',
    name: 'Kings Luxury Package',
    shortLabel: 'A kingly stay',
    price: 100000,
    icon: Crown,
    accent: 'from-[#7C5B3B] to-[#3E2414]',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-200',
    description:
      'For the guest who wants comfort to arrive before they do, this package wraps every hour in quiet indulgence. Expect graceful mornings, rich meals, a restful room, evening pampering, and small touches of celebration that make the stay feel generous and memorable.',
    access: [
      'Executive room stay with elevated in-room comfort',
      'Cafe access for focused work or gentle afternoon breaks',
      'Evening massage session for deep release',
      'Full access to the Wellness Package experience',
      'Full access to the Fun and Games Package experience',
      'Curated premium room touches including chilled wine',
      'A fuller hospitality experience from breakfast to dinner',
    ],
    menu: [
      'Complimentary breakfast on arrival morning',
      'Kings breakfast spread',
      'Buffet breakfast and dinner',
      'Bottle of wine in the fridge',
    ],
    cta: 'Choose luxury',
  },
  {
    id: 'Wellness Package',
    name: 'Wellness Package',
    shortLabel: 'Mind, body, and soul',
    price: 70000,
    icon: Flower2,
    accent: 'from-[#8FAF7A] to-[#58705B]',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    description:
      'Slip into a slower rhythm where dawn feels gentle, the air feels kinder, and your body is finally allowed to exhale. This retreat is designed for restoration, with guided stretching, soft music, nourishing bites, and quiet corners that help you feel cared for from sunrise to sleep.',
    access: [
      'Morning balcony access for green tea and sunrise views',
      'Private stretching session with a dedicated wellness coach',
      'Massage session for deep release and calm',
      'Garden and cafe access throughout your stay',
      'Serene relaxation spaces with soothing music and tea service',
    ],
    menu: [
      'Refreshing green tea at sunrise',
      'Cold-pressed fruit juice',
      'Healthy breakfast platter',
      'Famous Night Paradise Tea to ease insomnia and welcome deep sleep',
    ],
    cta: 'Choose restoration',
  },
  {
    id: 'Working Class Package',
    name: 'Working Class Package',
    shortLabel: 'Meet, work, present',
    price: 10000,
    icon: BriefcaseBusiness,
    accent: 'from-[#3F6C88] to-[#1F3C4D]',
    tagColor: 'bg-sky-100 text-sky-900 border-sky-200',
    description:
      'Built for founders, teams, and professionals who want a calm venue for meetings, seminars, strategy sessions, or client presentations. The package opens the cafe to focused work, steady internet, projector use, and light hospitality across the day.',
    access: [
      'All-day cafe access for focused work and team sessions',
      'Reliable high-speed internet for presentations and calls',
      'Business meetings and seminars with projector support',
      'Breakfast or lunch service depending on schedule',
      'Maximum seating capacity of 20 guests',
    ],
    menu: [
      'Fresh fruit platter',
      'Bottled water service',
      'Continuous tea service',
      'Warm artisanal pastries',
    ],
    cta: 'Book the session',
    priceNote: 'Priced per guest. Final total depends on headcount (up to 20 people).',
    maxGuests: 20,
  },
  {
    id: 'Fun and Games Package',
    name: 'Fun and Games Package',
    shortLabel: 'Vibes from day to night',
    price: 30000,
    icon: Gamepad2,
    accent: 'from-[#F2A83B] to-[#8B3F18]',
    tagColor: 'bg-orange-100 text-orange-900 border-orange-200',
    description:
      'This one is for laughter, friendly rivalry, and memories that stay long after checkout. Move from board games to balcony banter to smoky garden grills, with easy drinks, playful energy, and a social rhythm that keeps the whole experience bright and alive.',
    access: [
      'Cafe access for board games, chess, and Friday game-night energy',
      'Balcony access for card games and relaxed drinks',
      'Garden access for pepper soup evenings and grill moments',
      'Social spaces designed for easy fun and shared memories',
    ],
    menu: [
      'Smoothies or chilled soda on the balcony',
      'Pepper soup in the garden',
      'Palm wine and evening grills',
    ],
    cta: 'Choose the vibes',
  },
];

const WellnessPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitMode, setSubmitMode] = useState('reserve');
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0].id);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetCount, setCaptchaResetCount] = useState(0);
  const [formData, setFormData] = useState({
    participant_name: '',
    email: '',
    phone: '',
    class_type: packages[0].id,
    booking_date: '',
    booking_time: '09:00',
    participants_count: 1,
    special_requests: '',
  });

  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === selectedPackageId) ?? packages[0],
    [selectedPackageId]
  );

  const guestLimit = selectedPackage.maxGuests || 50;
  const totalPrice = selectedPackage.price * Math.max(1, Number(formData.participants_count || 1));

  const handlePackageSelect = (packageId) => {
    const nextPackage = packages.find((item) => item.id === packageId) ?? packages[0];
    setSelectedPackageId(packageId);
    setFormData((current) => ({
      ...current,
      class_type: packageId,
      participants_count: Math.min(Number(current.participants_count || 1), nextPackage.maxGuests || 50),
    }));

    // Smooth scroll to reservation form
    const formElement = document.getElementById('booking-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = e.nativeEvent?.submitter?.value || submitMode;

    if (isTurnstileEnabled() && !captchaToken) {
      toast.error('Please complete the captcha challenge.');
      return;
    }

    setLoading(true);
    try {
      const paymentMethod = action === 'pay' ? 'pay_online' : 'pay_on_ground';
      const chosenPackage = packages.find((item) => item.id === formData.class_type) ?? packages[0];
      const participantCount = Number(formData.participants_count || 1);
      const maxGuests = chosenPackage.maxGuests || 50;

      if (participantCount > maxGuests) {
        toast.error(`The ${chosenPackage.name} allows a maximum of ${maxGuests} guests.`);
        setLoading(false);
        return;
      }

      const total = chosenPackage.price * participantCount;

      const bookingData = {
        ...formData,
        payment_method: paymentMethod,
        booking_status: 'pending',
        total_price: total,
      };

      const submission = await submitBookingRequest({
        endpoint: '/bookings/intake',
        payload: {
          bookingType: 'wellness',
          captchaToken,
          data: bookingData,
        },
      });

      if (action === 'reserve') {
        navigate('/payment-success', { state: { booking: submission.record, submissionMode: submission.mode } });
        return;
      }

      const checkout = await startCheckoutOrShowPending({
        navigate,
        requirePayment: true,
        amount: total,
        bookingId: submission.record.id,
        productName: `${chosenPackage.name} booking`,
        customerEmail: formData.email,
        state: { booking: submission.record, submissionMode: submission.mode },
      });

      if (!checkout.started) {
        toast.warning(
          'Your request was saved, but payment could not be started automatically. Please contact the hotel to complete payment.'
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Booking failed. Try again.');
    } finally {
      setLoading(false);
      if (isTurnstileEnabled()) {
        setCaptchaResetCount((count) => count + 1);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Packages & Wellness Retreats — Peace Royal Resort</title>
        <meta
          name="description"
          content="Curated stay packages, wellness retreats, working class sessions, and fun gatherings at Peace Royal Resort in Gwarimpa, Abuja."
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <SidebarNavigation />

        <main className="flex-1 w-full pb-24">
          {/* Hero Header — Open, airy, unboxed */}
          <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Curated Stay Packages & Retreats</span>
                </div>
                <h1 className="heading-font mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] text-foreground tracking-tight text-balance">
                  Tailored moments for calm, comfort, and restoration.
                </h1>
                <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground text-balance">
                  Choose the feeling you want to carry home with you. Whether you seek slow restoration, executive comfort, playful connection, or a productive team work day, every package is designed with care.
                </p>
              </div>

              {/* Package Tier Cards Grid */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {packages.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedPackageId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePackageSelect(item.id)}
                      className={`relative flex flex-col text-left p-6 rounded-3xl transition-all duration-300 ${
                        isSelected
                          ? 'bg-card border-2 border-primary shadow-xl ring-2 ring-primary/10'
                          : 'bg-card/70 border border-border/70 hover:border-border hover:bg-card hover:shadow-md'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                        <Icon className="h-6 w-6 stroke-[2]" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.shortLabel}
                      </span>
                      <h2 className="heading-font mt-1.5 text-xl font-bold text-foreground">
                        {item.name}
                      </h2>
                      <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                        {item.description}
                      </p>
                      <div className="mt-6 pt-4 border-t border-border/50 flex items-baseline justify-between gap-2">
                        <div>
                          <span className="text-xl font-bold text-foreground tabular-nums">
                            ₦{item.price.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-muted-foreground mt-0.5">
                            {item.maxGuests ? 'per guest' : 'per package'}
                          </span>
                        </div>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                          {isSelected ? 'Selected' : 'Select'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Selected Package Details & Interactive Reservation Form */}
          <section id="booking-form" className="py-12 bg-card/40 border-t border-border/50 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                {/* Left Column: Selected Package Experience & Inclusions */}
                <div className="lg:col-span-5 space-y-8">
                  {/* Package Essence Card */}
                  <div className="rounded-3xl border border-border/80 bg-card p-7 shadow-sm">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <Sparkles className="w-3.5 h-3.5" />
                        Selected Package
                      </span>
                      <span className="text-2xl font-bold text-primary tabular-nums">
                        ₦{selectedPackage.price.toLocaleString()}
                      </span>
                    </div>

                    <h2 className="heading-font text-3xl font-bold text-foreground">
                      {selectedPackage.name}
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {selectedPackage.description}
                    </p>

                    {selectedPackage.priceNote && (
                      <p className="mt-3 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200/60 rounded-xl p-3">
                        {selectedPackage.priceNote}
                      </p>
                    )}
                  </div>

                  {/* Access Perks */}
                  <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm">
                    <h3 className="flex items-center gap-2.5 text-base font-semibold text-foreground mb-4">
                      <Trees className="w-4 h-4 text-primary" />
                      <span>Inclusive Access & Privileges</span>
                    </h3>
                    <ul className="space-y-3">
                      {selectedPackage.access.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Curated Dining & Refreshments */}
                  <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-sm">
                    <h3 className="flex items-center gap-2.5 text-base font-semibold text-foreground mb-4">
                      <Coffee className="w-4 h-4 text-[#A56A2D]" />
                      <span>Curated Refreshments & Menu</span>
                    </h3>
                    <ul className="space-y-3">
                      {selectedPackage.menu.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A56A2D] shrink-0 mt-2" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column: The Reservation Form Card — Clean, spacious, NO overlapping */}
                <div className="lg:col-span-7">
                  <div className="rounded-3xl border border-border/80 bg-card p-7 sm:p-9 md:p-10 shadow-lg shadow-black/[0.03]">
                    <div className="mb-8">
                      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                        Direct Reservation
                      </span>
                      <h3 className="heading-font text-2xl sm:text-3xl font-bold text-foreground mt-1">
                        Book Your Experience
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                        Complete your details below. Our team at Peace Royal Resort will prepare everything prior to your arrival.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <Label htmlFor="participant_name" className="text-xs font-medium text-foreground">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="participant_name"
                          required
                          value={formData.participant_name}
                          onChange={(e) => setFormData({ ...formData, participant_name: e.target.value })}
                          placeholder="e.g. David Okpo"
                          className="h-11 bg-background text-foreground"
                        />
                      </div>

                      {/* Contact row: Email & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <Label htmlFor="email" className="text-xs font-medium text-foreground">
                            Email Address <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="guest@example.com"
                            className="h-11 bg-background text-foreground"
                          />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                            Phone Number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+234 800 000 0000"
                            className="h-11 bg-background text-foreground"
                          />
                        </div>
                      </div>

                      {/* Package Selection & Booking Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <Label htmlFor="class_type" className="text-xs font-medium text-foreground">
                            Chosen Package
                          </Label>
                          <Select
                            value={formData.class_type}
                            onValueChange={(val) => handlePackageSelect(val)}
                          >
                            <SelectTrigger id="class_type" className="h-11 bg-background text-foreground">
                              <SelectValue placeholder="Select package" />
                            </SelectTrigger>
                            <SelectContent>
                              {packages.map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id}>
                                  {pkg.name} (₦{pkg.price.toLocaleString()})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <Label htmlFor="booking_date" className="text-xs font-medium text-foreground">
                            Preferred Date <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="booking_date"
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.booking_date}
                            onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                            className="h-11 bg-background text-foreground cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Preferred Time & Guest Count */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <Label htmlFor="booking_time" className="text-xs font-medium text-foreground">
                            Arrival Time
                          </Label>
                          <Input
                            id="booking_time"
                            type="time"
                            value={formData.booking_time}
                            onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                            className="h-11 bg-background text-foreground cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <Label htmlFor="participants_count" className="text-xs font-medium text-foreground">
                            Number of Guests {selectedPackage.maxGuests ? `(max ${selectedPackage.maxGuests})` : ''}
                          </Label>
                          <Input
                            id="participants_count"
                            type="number"
                            min="1"
                            max={guestLimit}
                            value={formData.participants_count}
                            onChange={(e) => setFormData({ ...formData, participants_count: e.target.value })}
                            className="h-11 bg-background text-foreground"
                          />
                        </div>
                      </div>

                      {/* Special Requests */}
                      <div className="space-y-1.5">
                        <Label htmlFor="special_requests" className="text-xs font-medium text-foreground">
                          Special Requests & Notes (Optional)
                        </Label>
                        <Textarea
                          id="special_requests"
                          value={formData.special_requests}
                          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                          rows={3}
                          placeholder="Dietary requirements, preferred stretching hours, celebration notes, etc."
                          className="bg-background text-foreground resize-none"
                        />
                      </div>

                      {/* Price Calculation Pill */}
                      <div className="p-4 rounded-2xl bg-muted/60 border border-border/70 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground block">Estimated Total</span>
                          <span className="text-xs font-medium text-foreground">
                            {selectedPackage.name} &times; {formData.participants_count || 1} {Number(formData.participants_count) === 1 ? 'guest' : 'guests'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-primary tabular-nums">
                            ₦{totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <TurnstileField
                        onVerify={setCaptchaToken}
                        onError={(message) => toast.error(message)}
                        resetSignal={captchaResetCount}
                        className="pt-1"
                      />

                      {/* Submission Buttons */}
                      <div className="pt-2">
                        <Button
                          type="submit"
                          name="submission_action"
                          value="reserve"
                          disabled={loading}
                          onClick={() => setSubmitMode('reserve')}
                          className="h-12 w-full rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-md transition-all active:scale-[0.99]"
                        >
                          {loading ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Processing Reservation...</span>
                            </span>
                          ) : (
                            <span>Reserve {selectedPackage.name} &rarr;</span>
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span>Instant notification &middot; No booking fee required upfront</span>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WellnessPage;
