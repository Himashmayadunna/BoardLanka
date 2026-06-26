"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, Github, Twitter, Facebook, Instagram, Phone, Globe } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 bg-black mt-20 overflow-hidden z-10">
      
      {/* Absolute Glow Layer */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-glow rounded-full blur-3xl pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo/logo.png"
                  alt="BoardLanka logo"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Board<span className="text-primary">Lanka</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Redefining property discovery in Sri Lanka. Connecting university students, working professionals, and families with trusted boarding spaces, annexes, and premium homes.
            </p>
            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-primary" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-primary" />
                <span>support@boardlanka.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-primary" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>
          </div>

          {/* Quick Links Col */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary transition-colors">Host Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Categories Col */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase">Categories</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/anexxes-rooms?type=room" className="hover:text-primary transition-colors">Student Rooms</Link>
              </li>
              <li>
                <Link href="/anexxes-rooms?type=annex" className="hover:text-primary transition-colors">Modern Annexes</Link>
              </li>
              <li>
                <Link href="/property-land?type=house" className="hover:text-primary transition-colors">Luxury Houses</Link>
              </li>
              <li>
                <Link href="/property-land?type=land" className="hover:text-primary transition-colors">Lands & Plots</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase">Newsletter</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Subscribe to receive weekly alerts for new rental listings and premium deals.
            </p>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all pr-10"
              />
              <button 
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-hover transition-colors"
              >
                <ArrowRight size={14} />
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-primary font-medium animate-fade-in">
                Thank you! You have subscribed successfully.
              </p>
            )}
          </div>

        </div>

        {/* Bottom copyright & Socials */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 text-center">
            &copy; {currentYear} BoardLanka. All rights reserved. Designed for the futuristic 2026 rental ecosystem.
          </p>
          <div className="flex items-center space-x-4">
            <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-primary/20 transition-all">
              <Twitter size={16} />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-primary/20 transition-all">
              <Instagram size={16} />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-primary/20 transition-all">
              <Facebook size={16} />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-primary/20 transition-all">
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}