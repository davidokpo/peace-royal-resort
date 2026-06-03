import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import MediaSlideshow from '@/components/MediaSlideshow.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import TurnstileField, { isTurnstileEnabled } from '@/components/TurnstileField.jsx';
import { HOTEL_IMAGES } from '@/config/siteContent.js';
import { submitBookingRequest } from '@/lib/bookingSubmission.js';
import { startCheckoutOrShowPending } from '@/lib/paymentCheckout.js';

const GardenBookingPage = () => {
  const navigate = useNavigate();
  const [isNightMode, setIsNightMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitMode, setSubmitMode] = useState('reserve');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetCount, setCaptchaResetCount] = useState(0);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    event_type: '',
    guest_count: 10,
    preferred_date: '',
    preferred_time: '18:00',
    special_requests: '',
    catering: { pepperSoup: false, bbq: false, drinks: false }
  });

  const PACKAGE_PRICE = 100000;

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
      const bookingPayload = {
        clientBookingRef: crypto.randomUUID(),
        customerName: formData.customer_name,
        customerEmail: formData.customer_email,
        customerPhone: formData.customer_phone,
        eventType: formData.event_type,
        guestCount: Number(formData.guest_count),
        preferredDate: formData.preferred_date,
        preferredTime: formData.preferred_time,
        specialRequests: formData.special_requests,
        catering: formData.catering,
        payment_method: paymentMethod,
        totalPrice: PACKAGE_PRICE,
      };

      const submission = await submitBookingRequest({
        endpoint: '/bookings/intake',
        payload: {
          bookingType: 'garden',
          captchaToken,
          data: bookingPayload,
        },
      });

      if (action === 'reserve') {
        navigate('/payment-success', { state: { booking: submission.record, submissionMode: submission.mode } });
        return;
      }

      const checkout = await startCheckoutOrShowPending({
        navigate,
        requirePayment: true,
        amount: PACKAGE_PRICE,
        bookingId: submission.record.id,
        productName: `${formData.event_type || 'Garden'} booking`,
        customerEmail: formData.customer_email,
        state: { booking: submission.record, submissionMode: submission.mode },
      });

      if (!checkout.started) {
        toast.warning('Your request was saved, but payment could not be started automatically. Please contact the hotel to complete payment.');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
      if (isTurnstileEnabled()) {
        setCaptchaResetCount((count) => count + 1);
      }
    }
  };

  const activeContent = isNightMode ? {
    title: 'Spice & Cinema',
    desc: 'Pepper soup, outdoor movie nights under the stars.',
    media: [
      { src: HOTEL_IMAGES.gardenBookingNight, alt: 'Nighttime garden booking view' },
      { src: '/assets/images/garden-booking-night.mp4', alt: 'Night garden cinema experience', startAt: 10, endAt: 20 },
      { src: '/assets/images/garden-filmshow.mp4', alt: 'Outdoor film show in the garden', startAt: 10, endAt: 20 },
      { src: '/assets/images/garden-events.mp4', alt: 'Evening garden event setup', startAt: 10, endAt: 20 },
    ],
    text: 'text-foreground'
  } : {
    title: 'Deck & Dawn',
    desc: 'Card games, breakfast, and skyline views.',
    media: [
      { src: HOTEL_IMAGES.gardenDay, alt: 'Garden daytime photo' },
      { src: HOTEL_IMAGES.gardenBookingDay, alt: 'Garden day booking view' },
      { src: '/assets/images/IMG_7555.MOV', alt: 'Garden daytime atmosphere video', startAt: 10, endAt: 20 },
      { src: '/assets/images/garden-games.mp4', alt: 'Garden games and hangout moment', startAt: 10, endAt: 20 },
      { src: '/assets/images/garden-events.mp4', alt: 'Garden event in daylight', startAt: 10, endAt: 20 },
    ],
    text: 'text-foreground'
  };

  const valentineEventMedia = [
    {
      src: '/assets/images/garden-event-valentine1.jpg',
      alt: 'Valentine garden event decor and guest setup',
    },
    {
      src: '/assets/images/garden-event-valentine2.mp4',
      alt: 'Valentine garden event highlight video',
      startAt: 0,
      endAt: 14,
      poster: '/assets/images/garden-event-valentine1.jpg',
    },
    {
      src: '/assets/images/garden-event-valentine-3.mp4',
      alt: 'Valentine evening garden celebration video',
      startAt: 0,
      endAt: 12,
      poster: '/assets/images/garden-event-valentine1.jpg',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Garden & Balcony Events — Peace Royal Resort</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <SidebarNavigation />

        <main className="pt-24 pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Toggle Hero */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[70vh] mb-24">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isNightMode ? 'night' : 'day'}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  <MediaSlideshow
                    items={activeContent.media}
                    className="h-full w-full"
                    overlayClassName="bg-black/40"
                    imageLoading="eager"
                    imageFetchPriority="high"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute top-6 right-6 z-20 flex bg-white/20 backdrop-blur-md p-1 rounded-full border border-white/30">
                <button onClick={() => setIsNightMode(false)} className={`p-3 rounded-full transition-all ${!isNightMode ? 'bg-white text-primary shadow-lg' : 'text-white hover:bg-white/20'}`}>
                  <Sun className="w-5 h-5" />
                </button>
                <button onClick={() => setIsNightMode(true)} className={`p-3 rounded-full transition-all ${isNightMode ? 'bg-secondary text-secondary-foreground shadow-lg' : 'text-white hover:bg-white/20'}`}>
                  <Moon className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute inset-0 flex items-center justify-center text-center z-10 p-6">
                <motion.div key={isNightMode ? 'n' : 'd'} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <h1 className="heading-font text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                    {activeContent.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 font-medium drop-shadow-md">
                    {activeContent.desc}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Garden Party Booking Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className={activeContent.text}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-6 font-semibold uppercase tracking-wider text-sm">
                  <Sparkles className="w-4 h-4" /> Private Events
                </div>
                <h2 className="heading-font text-5xl font-bold mb-6">Host Your Squad</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Birthdays, Proposals, or Saturday Link-ups. Book our lush garden space for an unforgettable private event. Package includes dedicated staff, atmospheric lighting, and complete privacy.
                </p>
                <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
                  <span className="font-medium text-lg">Base Package</span>
                  <span className="text-3xl font-bold">₦100,000</span>
                </div>
              </div>

              <div className="glassmorphic-panel rounded-[2rem] p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input required value={formData.customer_name} onChange={e=>setFormData({...formData, customer_name: e.target.value})} className="bg-white/50" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" required value={formData.customer_email} onChange={e=>setFormData({...formData, customer_email: e.target.value})} className="bg-white/50" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Phone Number</Label>
                      <Input value={formData.customer_phone} onChange={e=>setFormData({...formData, customer_phone: e.target.value})} className="bg-white/50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <Label>Event Type</Label>
                      <Select required value={formData.event_type} onValueChange={v=>setFormData({...formData, event_type: v})}>
                        <SelectTrigger className="bg-white/50"><SelectValue placeholder="Select..."/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Birthday">Birthday</SelectItem>
                          <SelectItem value="Proposal">Proposal</SelectItem>
                          <SelectItem value="Social Gathering">Social Gathering</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <Label>Guests</Label>
                      <Input type="number" min="1" required value={formData.guest_count} onChange={e=>setFormData({...formData, guest_count: e.target.value})} className="bg-white/50" />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input type="date" required min={new Date().toISOString().split('T')[0]} value={formData.preferred_date} onChange={e=>setFormData({...formData, preferred_date: e.target.value})} className="bg-white/50" />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input type="time" required value={formData.preferred_time} onChange={e=>setFormData({...formData, preferred_time: e.target.value})} className="bg-white/50" />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Catering Add-ons</Label>
                    <div className="grid grid-cols-2 gap-3 bg-white/30 p-4 rounded-xl">
                      {['pepperSoup', 'bbq', 'drinks'].map(cat => (
                        <div key={cat} className="flex items-center space-x-2">
                          <Checkbox id={cat} checked={formData.catering[cat]} onCheckedChange={(c) => setFormData({...formData, catering: {...formData.catering, [cat]: c}})} />
                          <Label htmlFor={cat} className="capitalize">{cat.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Special Requests</Label>
                    <Textarea rows={3} value={formData.special_requests} onChange={e=>setFormData({...formData, special_requests: e.target.value})} className="bg-white/50 mt-1" />
                  </div>

                  <TurnstileField
                    onVerify={setCaptchaToken}
                    onError={(message) => toast.error(message)}
                    resetSignal={captchaResetCount}
                  />

                  <div className="grid gap-4">
                    <Button
                      type="submit"
                      name="submission_action"
                      value="reserve"
                      disabled={loading}
                      onClick={() => setSubmitMode('reserve')}
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 rounded-xl text-lg font-medium"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Book Now'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl min-h-[24rem]">
                <MediaSlideshow
                  items={valentineEventMedia}
                  className="h-full min-h-[24rem] w-full"
                  overlayClassName="bg-black/20"
                  activateWhenInView
                />
              </div>

              <div className={activeContent.text}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-6 font-semibold uppercase tracking-wider text-sm">
                  <Sparkles className="w-4 h-4" /> Event Highlights
                </div>
                <h3 className="heading-font text-4xl md:text-5xl font-bold mb-6">Valentine Garden Moments</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  These new garden event visuals now sit directly on the booking page so guests can see the atmosphere before they book.
                  The section leans into styled celebrations, intimate evening setups, and the kind of private event energy the space can carry well.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">Mood</div>
                    <div className="font-semibold">Romantic styling</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">Format</div>
                    <div className="font-semibold">Photo + video story</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">Best For</div>
                    <div className="font-semibold">Private celebrations</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default GardenBookingPage;
