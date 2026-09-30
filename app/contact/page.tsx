"use client";

import { useState } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  Check
} from "lucide-react";

const faqData = [
  {
    question: "Is there a service charge for university students and tenants?",
    answer: "No, BoardLanka is completely free for tenants and students. You connect directly with verified property hosts with zero agency commission."
  },
  {
    question: "How does the Sri Lanka NIC property verification work?",
    answer: "Hosts upload their national identity documents, deed references, or utility verification bills. Listings verified by our team display the verified host credential."
  },
  {
    question: "How do I list annexes and suites on BoardLanka?",
    answer: "Create an account, choose Host / Landlord account type, and access your listing manager to configure property records, images, and publish verified rental listings."
  },
  {
    question: "Can I manage listings and agreements after publishing?",
    answer: "Yes, you can edit pricing, update images, adjust availability status, or generate digital lease agreements anytime via your console."
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
        setErrorMsg(data?.message || `Failed with status ${res.status}.`);
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        
        {/* Header */}
        <div className="border-b border-[var(--border-hairline)] pb-12 space-y-3 max-w-3xl text-left">
          <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
            Concierge & Support
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[var(--text-primary)] font-normal tracking-tight leading-[1.08]">
            Get in touch with our team.
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light leading-relaxed">
            Have questions regarding tenant verification, enterprise property setups, or campus partnerships? Send us a message.
          </p>
        </div>

        {/* Form and Contact Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          
          {/* Left Column (5 cols): Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="border border-[var(--border-hairline)] bg-[var(--surface)] p-8 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--accent-earth)]">
                Colombo Headquarters
              </span>

              <div className="space-y-4 text-xs text-[var(--text-secondary)]">
                <div className="flex items-start gap-3">
                  <MapPin size={14} className="text-[var(--accent-earth)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">BoardLanka Operations</p>
                    <p className="text-[var(--text-muted)] font-light">No. 42, High Level Road, Homagama & Colombo 07, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={14} className="text-[var(--accent-earth)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Email Concierge</p>
                    <p className="text-[var(--text-muted)] font-light">concierge@boardlanka.lk</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={14} className="text-[var(--accent-earth)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Telephone / Hotline</p>
                    <p className="text-[var(--text-muted)] font-light">+94 11 450 8900 (Mon–Sat, 8am–6pm)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border border-[var(--border-hairline)] bg-[var(--surface-subtle)] space-y-2">
              <h4 className="font-serif text-lg text-[var(--text-primary)]">Enterprise Landlords & Agencies</h4>
              <p className="text-xs text-[var(--text-muted)] font-light leading-relaxed">
                Managing more than 20 units? We offer dedicated on-boarding assistance and customized invoice branding setups.
              </p>
            </div>
          </div>

          {/* Right Column (7 cols): Underline Form */}
          <div className="lg:col-span-7 border border-[var(--border-hairline)] bg-[var(--surface)] p-8 sm:p-10 space-y-6">
            <h3 className="font-serif text-2xl text-[var(--text-primary)]">Send a Message</h3>

            {submitted ? (
              <div className="p-8 border border-[var(--border-hairline)] bg-[var(--surface-subtle)] text-center space-y-3">
                <div className="w-10 h-10 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <Check size={20} />
                </div>
                <h4 className="font-serif text-xl text-[var(--text-primary)]">Message Received</h4>
                <p className="text-xs text-[var(--text-muted)]">
                  Thank you for reaching out. Our concierge team will respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="label-floating">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Jayawardena"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-underline text-xs"
                  />
                </div>

                <div>
                  <label className="label-floating">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-underline text-xs"
                  />
                </div>

                <div>
                  <label className="label-floating">Message & Inquiries</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can our team help you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-underline text-xs"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-editorial btn-editorial-primary py-3.5 px-7 text-xs font-semibold"
                >
                  {isSubmitting ? "Transmitting..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* FAQ Section with Hairline Accordion */}
        <div className="border-t border-[var(--border-hairline)] pt-16 space-y-8 text-left max-w-3xl">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
              Frequently Asked Questions
            </span>
            <h2 className="font-serif text-3xl text-[var(--text-primary)]">Common Inquiries</h2>
          </div>

          <div className="border border-[var(--border-hairline)] bg-[var(--surface)] divide-y divide-[var(--border-hairline)]">
            {faqData.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="p-6 space-y-2">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left font-serif text-lg text-[var(--text-primary)] hover:text-[var(--accent-earth)] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="text-xs text-[var(--text-muted)] font-sans">{isOpen ? "—" : "+"}</span>
                  </button>
                  {isOpen && (
                    <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed pt-2">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
