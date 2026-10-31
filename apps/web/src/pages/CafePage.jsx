import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Moon, Gamepad2, Loader2, Minus, Plus, Laptop, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import MediaSlideshow from '@/components/MediaSlideshow.jsx';
import MenuItemCard from '@/components/MenuItemCard.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import TurnstileField, { isTurnstileEnabled } from '@/components/TurnstileField.jsx';
import { HOTEL_IMAGES } from '@/config/siteContent.js';
import { submitBookingRequest } from '@/lib/bookingSubmission.js';
import { startCheckoutOrShowPending } from '@/lib/paymentCheckout.js';

const CafePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({});
  const [submitMode, setSubmitMode] = useState('ground');
  const [isFriday, setIsFriday] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetCount, setCaptchaResetCount] = useState(0);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    allergies: '',
    special_requests: '',
    delivery_type: 'pickup',
    board_game_selection: '',
    player_count: 2,
    game_time_slot: '',
    smoothie_fruit_choice: '',
    club_sandwich_cheese: ''
  });

  const SMOOTHIE_ITEM_ID = 7;
  const CLUB_SANDWICH_ITEM_ID = 15;

  const cafeItems = [
    { id: 1, category: 'Signature Tea', name: 'Bubble Tea', price: 3000, img: '/assets/images/cafe-bubble-tea.jpg', desc: 'Creamy chilled tea with a playful textured finish.' },
    { id: 2, category: 'Signature Tea', name: 'Green Tea', price: 1200, img: '/assets/images/cafe-green-tea.jpg', desc: 'Clean and calming tea for a light midday reset.' },
    { id: 3, category: 'Signature Tea', name: 'Evening Paradise Tea / Peace Royal Resort Special', price: 2500, img: '/assets/images/cafe-herbal-tea.jpg', desc: 'Our house evening tea blend crafted for deep calm and slow nights.', night: true },
    { id: 4, category: 'Signature Tea', name: 'Flavored Tea', price: 1800, img: '/assets/images/cafe-flavored-tea.jpg', desc: 'Infused with lemon, honey, or fruit flavors.' },
    { id: 5, category: 'Coffee', name: 'Artisan Espresso', price: 1000, img: '/assets/images/cafe-espresso.jpg', desc: 'Bold short coffee for focused work blocks.' },
    { id: 6, category: 'Tea Latte', name: 'Matcha Latte', price: 1800, img: '/assets/images/cafe-matcha-latte.jpg', desc: 'Earthy green tea latte with a smooth finish.' },
    { id: SMOOTHIE_ITEM_ID, category: 'Fresh Blend', name: 'Fresh Fruit Smoothie', price: 2500, img: '/assets/images/cafe-smoothie.jpg', desc: 'Choose banana, pineapple, watermelon, or a fresh mix of all three.' },
    { id: 8, category: 'Pastry', name: 'Meat Pie', price: 1500, img: '/assets/images/cafe-pie.jpg', desc: 'Flaky pastry with a rich savory meat filling.' },
    { id: 9, category: 'Pastry', name: 'Chicken Pie', price: 1700, img: '/assets/images/cafe-pie.jpg', desc: 'Buttery pastry filled with seasoned chicken.' },
    { id: 10, category: 'Pastry', name: 'Fish Pie', price: 1500, img: '/assets/images/cafe-pie.jpg', desc: 'Golden pastry stuffed with a savory fish filling.' },
    { id: 11, category: 'Snack', name: 'Small Chops', price: 3500, img: '/assets/images/cafe-small-chops.jpg', desc: 'A mixed tray of crisp samosa, spring rolls, and puff-puff for easy sharing.' },
    { id: 14, category: 'Pastry', name: 'Doughnut', price: 800, img: '/assets/images/cafe-doughnut.jpg', desc: 'Classic soft doughnut for a quick sweet break.' },
    { id: CLUB_SANDWICH_ITEM_ID, category: 'Snack', name: 'Club Sandwich', price: 2000, img: '/assets/images/cafe-club-sandwich.jpg', desc: 'Layered sandwich for a fuller cafe meal, with or without cheese.' },
    { id: 16, category: 'Breakfast', name: 'Pancake', price: 500, img: '/assets/images/cafe-pancake.jpg', desc: 'Soft fresh pancake served warm.' },
    { id: 17, category: 'Breakfast', name: 'Pancake with Topping', price: 700, img: '/assets/images/cafe-pancake.jpg', desc: 'Warm pancake finished with your topping.' },
    { id: 18, category: 'Breakfast', name: '6 Pancakes with Topping', price: 4000, img: '/assets/images/cafe-pancake.jpg', desc: 'A full pack of six pancakes with topping for sharing.' },
  ];

  const workspaceMedia = [
    { src: '/assets/images/cafe-workspace.svg', alt: 'Cafe workspace preview' },
    { src: HOTEL_IMAGES.cafeWorkspace, alt: 'Cafe workspace video', startAt: 10, endAt: 20, poster: '/assets/images/cafe-workspace.svg' },
        { src: HOTEL_IMAGES.cafeGames, alt: 'Cafe games video', startAt: 10, endAt: 20, poster: '/assets/images/cafe-games.svg' },
  ];

  const featuredCafeItems = cafeItems.slice(0, 8);
  const secondaryCafeItems = cafeItems.slice(8);
  const hasSmoothieInCart = Boolean(cart[SMOOTHIE_ITEM_ID]);
  const hasClubSandwichInCart = Boolean(cart[CLUB_SANDWICH_ITEM_ID]);

  const gameNightMedia = [
    { src: '/assets/images/cafe-games.svg', alt: 'Cafe game night preview' },
    { src: HOTEL_IMAGES.cafeGames, alt: 'Cafe game night video', startAt: 10, endAt: 20, poster: '/assets/images/cafe-games.svg' },
        { src: HOTEL_IMAGES.cafeWorkspace, alt: 'Cafe social workspace event video', startAt: 10, endAt: 20, poster: '/assets/images/cafe-workspace.svg' },
  ];

  const updateCart = (item, delta) => {
    setCart(prev => {
      const current = prev[item.id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return { ...prev, [item.id]: next };
    });
  };

  const setCartQuantity = (item, qty) => {
    setCart(prev => {
      const copy = { ...prev };
      if (qty <= 0) {
        delete copy[item.id];
      } else {
        copy[item.id] = qty;
      }
      return copy;
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const item = cafeItems.find(i => String(i.id) === String(id));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = e.nativeEvent?.submitter?.value || submitMode;
    if (Object.keys(cart).length === 0) {
      toast.error('Add items to order.');
      return;
    }
    const total = calculateTotal();
    if (isFriday && total < 3000) {
      toast.error('Friday Game Night requires a minimum order of N3,000 to reserve a table.');
      return;
    }
    if (hasSmoothieInCart && !formData.smoothie_fruit_choice) {
      toast.error('Please choose the fruits for your smoothie.');
      return;
    }
    if (hasClubSandwichInCart && !formData.club_sandwich_cheese) {
      toast.error('Please choose club sandwich with cheese or without cheese.');
      return;
    }
    if (isTurnstileEnabled() && !captchaToken) {
      toast.error('Please complete the captcha challenge.');
      return;
    }

    setLoading(true);
    try {
      const paymentMethod = action === 'online' ? 'pay_online' : 'pay_on_ground';
      const orderItems = Object.entries(cart).map(([id, qty]) => {
        const item = cafeItems.find(i => String(i.id) === String(id));
        const options = {};

        if (item.id === SMOOTHIE_ITEM_ID) {
          options.smoothie_fruits = formData.smoothie_fruit_choice;
        }

        if (item.id === CLUB_SANDWICH_ITEM_ID) {
          options.cheese_preference = formData.club_sandwich_cheese;
        }

        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: qty,
          ...(Object.keys(options).length ? { options } : {})
        };
      });

      const orderData = {
        customer_name: formData.customer_name,
        email: formData.email,
        phone: formData.phone,
        beverage_items: orderItems,
        allergies: formData.allergies || 'None',
        special_requests: formData.special_requests || 'None',
        delivery_type: isFriday ? 'pickup' : formData.delivery_type,
        order_status: 'pending',
        payment_method: paymentMethod,
        total_price: total,
        friday_game_night: isFriday,
        board_game_selection: isFriday ? formData.board_game_selection : '',
        player_count: isFriday ? formData.player_count : null,
        game_time_slot: isFriday ? formData.game_time_slot : '',
        reserved_table_number: isFriday ? `T-${Math.floor(Math.random() * 20) + 1}` : ''
      };

      const submission = await submitBookingRequest({
        endpoint: '/bookings/intake',
        payload: {
          bookingType: 'cafe',
          captchaToken,
          data: orderData,
        },
      });

      if (paymentMethod === 'pay_on_ground') {
        navigate('/payment-success', { state: { order: submission.record, submissionMode: submission.mode } });
        return;
      }

      const checkout = await startCheckoutOrShowPending({
        navigate,
        requirePayment: true,
        amount: total,
        bookingId: submission.record.id,
        productName: isFriday ? 'Cafe order and game night' : 'Cafe order',
        customerEmail: formData.email,
        state: { order: submission.record, submissionMode: submission.mode },
      });

      if (!checkout.started) {
        toast.error(checkout.error?.message || 'Payment could not be started. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Order failed. Please try again.');
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
        <title>Cafe & Workspace — Peace Royal Resort</title>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <SidebarNavigation />

        <main>
          {/* Top Section - Workspace */}
          <section className="bg-background text-foreground pt-32 pb-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                  <Laptop className="w-12 h-12 text-primary mb-6" />
                  <h1 className="heading-font text-5xl md:text-6xl font-bold mb-4">Your Workspace.<br/>Your Vibe.</h1>
                  <p className="text-lg text-muted-foreground max-w-lg leading-relaxed mb-8">
                    Remote work, creative sessions, or just a quiet corner. Fuel your flow with signature teas, pastries, and light bites in a serene, distraction-free environment.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {featuredCafeItems.map(item => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        quantity={cart[item.id] || 0}
                        onConfirm={setCartQuantity}
                        imageHeightClass="h-40"
                      />
                    ))}
                  </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="space-y-5">
                  <div className="h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-border/60">
                    <MediaSlideshow items={workspaceMedia} className="h-full w-full" activateWhenInView />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {secondaryCafeItems.map(item => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        quantity={cart[item.id] || 0}
                        onConfirm={setCartQuantity}
                        imageHeightClass="h-32"
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Leaf Transition Divider */}
          <div className="w-full h-10 bg-background">
          </div>

          {/* Bottom Section - Friday Game Night */}
          <section className="bg-muted/30 text-foreground py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-primary mb-6 font-semibold uppercase tracking-wider text-sm">
                  <Users className="w-4 h-4" /> Community Weekend
                </div>
                <h2 className="heading-font text-5xl md:text-6xl font-bold mb-4 text-balance">Friday Night Lights</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Every Friday. Community. Games. Good vibes. Join us for a minimalist cafe takeover where strangers become friends over board games.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
                <div className="h-[400px] rounded-3xl overflow-hidden shadow-2xl relative">
                  <MediaSlideshow items={gameNightMedia} className="h-full w-full" overlayClassName="bg-black/20" activateWhenInView />
                </div>

                <div className="bg-card/90 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-sm">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Gamepad2 className="w-6 h-6 text-primary" /> Reserve Your Table</h3>
                  <p className="text-white/70 mb-6 text-sm">Secure a table for game night by placing a minimum food/drink order of ₦3,000 per table. Select your game and time slot below.</p>
                  
                  <div className="flex items-center gap-3 bg-muted p-4 rounded-xl mb-8">
                    <Checkbox id="friday_toggle" checked={isFriday} onCheckedChange={(val) => {
                      setIsFriday(val);
                      if (val) setFormData(f => ({ ...f, delivery_type: 'pickup' }));
                    }} className="border-border data-[state=checked]:bg-primary" />
                    <Label htmlFor="friday_toggle" className="text-foreground cursor-pointer font-medium text-lg">Yes, I'm booking for Friday Game Night</Label>
                  </div>

                  {isFriday && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                      <div>
                        <Label className="text-muted-foreground mb-2 block">Select Game</Label>
                        <RadioGroup value={formData.board_game_selection} onValueChange={(val) => setFormData({...formData, board_game_selection: val})} className="grid grid-cols-3 gap-3">
                          {['Chess', 'Monopoly', 'Scrabble'].map(game => (
                            <div key={game}>
                              <RadioGroupItem value={game} id={game} className="peer sr-only" />
                              <Label htmlFor={game} className="flex flex-col items-center justify-center rounded-xl border-2 border-border bg-background p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted cursor-pointer transition-all">
                                {game}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Players (1-6)</Label>
                          <Input type="number" min="1" max="6" value={formData.player_count} onChange={(e) => setFormData({...formData, player_count: e.target.value})} className="bg-background border-border text-foreground mt-1" />
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Time Slot</Label>
                          <Select value={formData.game_time_slot} onValueChange={(val) => setFormData({...formData, game_time_slot: val})}>
                            <SelectTrigger className="bg-background border-border text-foreground mt-1">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="18:00">6:00 PM</SelectItem>
                              <SelectItem value="19:00">7:00 PM</SelectItem>
                              <SelectItem value="20:00">8:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Checkout Form - Shows for both regular cafe order and game night */}
              <div className="max-w-3xl mx-auto bg-card text-card-foreground rounded-3xl p-8 shadow-2xl">
                <h3 className="heading-font text-2xl font-bold mb-6 text-center">Complete Your Order Request</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="c_name">Name</Label>
                      <Input id="c_name" required value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c_phone">Phone</Label>
                      <Input id="c_phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="c_email">Email</Label>
                      <Input id="c_email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>

                  {(hasSmoothieInCart || hasClubSandwichInCart) && (
                    <div className="space-y-5 rounded-2xl border border-border bg-muted/40 p-5">
                      <h4 className="font-semibold text-foreground">Customize selected items</h4>

                      {hasSmoothieInCart && (
                        <div className="space-y-3">
                          <Label>Smoothie fruits</Label>
                          <RadioGroup value={formData.smoothie_fruit_choice} onValueChange={(val) => setFormData({...formData, smoothie_fruit_choice: val})} className="grid gap-3 sm:grid-cols-2">
                            {['Banana', 'Pineapple', 'Watermelon', 'Mix of all'].map(option => (
                              <div key={option} className="flex items-center space-x-2 rounded-xl border border-border bg-card p-3">
                                <RadioGroupItem value={option} id={`smoothie_${option.toLowerCase().replaceAll(' ', '_')}`} />
                                <Label htmlFor={`smoothie_${option.toLowerCase().replaceAll(' ', '_')}`} className="cursor-pointer">{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}

                      {hasClubSandwichInCart && (
                        <div className="space-y-3">
                          <Label>Club sandwich option</Label>
                          <RadioGroup value={formData.club_sandwich_cheese} onValueChange={(val) => setFormData({...formData, club_sandwich_cheese: val})} className="grid gap-3 sm:grid-cols-2">
                            {['With cheese', 'Without cheese'].map(option => (
                              <div key={option} className="flex items-center space-x-2 rounded-xl border border-border bg-card p-3">
                                <RadioGroupItem value={option} id={`club_${option.toLowerCase().replaceAll(' ', '_')}`} />
                                <Label htmlFor={`club_${option.toLowerCase().replaceAll(' ', '_')}`} className="cursor-pointer">{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="c_allergies">Allergies (Required)</Label>
                    <Input id="c_allergies" required value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} placeholder="Type 'None' if applicable" />
                  </div>

                  {!isFriday && (
                    <div className="space-y-3">
                      <Label>Order Option</Label>
                      <RadioGroup value={formData.delivery_type} onValueChange={(val) => setFormData({...formData, delivery_type: val})} className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pickup" id="p_pick" />
                          <Label htmlFor="p_pick">Pickup</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delivery" id="p_del" />
                          <Label htmlFor="p_del">Room Delivery</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  <TurnstileField
                    onVerify={setCaptchaToken}
                    onError={(message) => toast.error(message)}
                    resetSignal={captchaResetCount}
                  />

                  <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-lg">Total: <strong className="text-2xl text-primary font-bold">₦{calculateTotal().toLocaleString()}</strong></div>
                    <div className="grid w-full gap-3 sm:w-auto">
                      <Button
                        type="submit"
                        name="submission_action"
                        value="ground"
                        disabled={loading}
                        onClick={() => setSubmitMode('ground')}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-6 px-6 rounded-xl text-lg transition-all active:scale-95"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Place Order'}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default CafePage;
