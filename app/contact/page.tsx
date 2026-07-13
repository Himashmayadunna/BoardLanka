"use client";

import { useState } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  MessageSquare
} from "lucide-react";
import MeshBackground from "@/app/components/MeshBackground";

const faqData = [
  {
    question: "Is there a service charge for university students?",
    answer: "No, BoardLanka is 100% free for students and tenants. We establish direct connection between you and the property host with zero brokerage commission."
  },
  {
    question: "How does property verification work?",
    answer: "Hosts are required to upload business registrations, electricity bills or national identification documents. Listings verified by our team feature the green verification badge."
  },
  {
    question: "How can I upgrade to a Host seller account?",
    answer: "Navigate to your profile settings, click 'Edit Profile', switch your account type from Seeker to Host, and save changes. You will instantly unlock property listing forms."
  },
  {
    question: "Can I manage listings after publishing?",
    answer: "Yes, you can edit pricing, update images, flag availability toggles, or delete properties at any time via the 'My Listings' dashboard."
  }
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      let data = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) {
        setSubmitted(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setErrorMsg(data?.message || `Failed with status ${res.status}. Please restart your backend server.`);
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setErrorMsg("An error occurred. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <MeshBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-glow border border-primary/20 text-xs font-semibold text-primary">
            <Mail size={12} />
            <span>Support Help Centre</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">Get in Touch with Us</h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Have questions about student rooms, hosting forms, or listings verification? We are here to help.
          </p>
        </div>

        {/* Form and Address row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          
          {/* Left Column: Office & FAQs */}
          <div className="lg:col-span-6 space-y-8 text-left">
            
            {/* Info Cards */}
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-5 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-2">Central Headquarters</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-glow text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Office Address</h4>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Level 4, Colombo Innovation Centre, Colombo 03, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-glow text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Direct Phone Support</h4>
                    <p className="text-xs text-gray-400 mt-0.5">+94 11 234 5678 (Mon - Fri, 9am - 5pm)</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-glow text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Email Inquiry</h4>
                    <p className="text-xs text-gray-400 mt-0.5">support@boardlanka.com</p>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="border-t border-white/5 pt-4">
                <p className="text-[10px] text-gray-500 font-semibold uppercase mb-3">Connect on Social Channels</p>
                <div className="flex gap-2.5">
                  {[
                    { icon: <Facebook size={14} /> },
                    { icon: <Twitter size={14} /> },
                    { icon: <Instagram size={14} /> },
                    { icon: <Linkedin size={14} /> }
                  ].map((soc, i) => (
                    <a 
                      key={i} 
                      href="#" 
                      className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-primary/20 border border-white/5 transition-all"
                    >
                      {soc.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Accordion Accordion */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5 pl-2">
                <MessageSquare size={16} className="text-primary" />
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-2.5">
                {faqData.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div 
                      key={idx} 
                      className="glass rounded-2xl border border-white/10 overflow-hidden shadow-md"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-bold text-white hover:bg-white/5 transition-colors"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} />}
                      </button>
                      
                      {isOpen && (
                        <div className="px-5 pb-4 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-3 animate-slide-up">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 text-left">Send a Direct Message</h3>
              
              {submitted ? (
                <div className="text-center py-10 space-y-4 animate-fade-in">
                  <div className="w-14 h-14 bg-primary-glow rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20">
                    <Send size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-white">Message Sent!</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                    Thank you for reaching out. A BoardLanka support agent will review your inquiry and get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-gray-400">Your Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-gray-400">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-gray-400">Message Description</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      placeholder="How can we assist you? Describe your listing query or error state..."
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-xs text-left font-medium">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                    <Send size={12} />
                  </button>
                </form>
              )}
            </div>

            {/* Embedded Iframe Map */}
            <div className="h-64 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-white/5">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9782262174246!2d79.84931837494191!3d-6.8931908931060935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25a50f14d84f9%3A0xe54d3f3f2d2fd39f!2sColombo%2003%2C%20Colombo!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="filter invert hue-rotate-180 opacity-75"
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
