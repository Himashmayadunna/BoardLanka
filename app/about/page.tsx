"use client";

import { motion } from "framer-motion";
import { Sparkles, Target, Compass, Award, ShieldCheck, Users, HelpCircle, ArrowRight } from "lucide-react";
import MeshBackground from "@/app/components/MeshBackground";
import Link from "next/link";

const stats = [
  { value: "1,200+", label: "Active Listings", desc: "Across 10+ districts" },
  { value: "5,000+", label: "Happy Tenants", desc: "Students & families" },
  { value: "50+", label: "Cities Covered", desc: "All central campuses" },
  { value: "100%", label: "Direct Contact", desc: "No middleman fees" },
];

const timeline = [
  { year: "2024", title: "Project Launch", desc: "Founded to solve university student housing challenges in Colombo and Galle." },
  { year: "2025", title: "1K Verified Listings", desc: "Upgraded our verification workflow and reached 1,000 active verified listing properties." },
  { year: "2026", title: "Next-Gen Redesign", desc: "Redesigned as a modern startup experience with 3D elements and smooth scrolls." },
];

const team = [
  { name: "Himash Mayadunna", role: "Founder & Lead Architect", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
  { name: "Dr. Asela Gunawardena", role: "Academic Advisor & Partner", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" },
  { name: "Shenal Perera", role: "Core UI/UX Developer", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200" },
];

export default function AboutPage() {
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <MeshBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-20 space-y-4"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-glow border border-primary/20 text-xs font-semibold text-primary"
          >
            <Compass size={14} />
            <span>Our Mission & Story</span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-extrabold text-white"
          >
            Redefining Accommodation Discovery in <span className="text-primary">Sri Lanka</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-sm md:text-base text-gray-400 leading-relaxed"
          >
            We are building a premium property marketplace for university students, professionals, and families to discover trusted rental listings with zero intermediary brokerage.
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass p-6 rounded-3xl border border-white/10 text-center space-y-2 shadow-xl">
              <h3 className="text-2xl md:text-3xl font-extrabold text-primary">{stat.value}</h3>
              <div>
                <p className="text-xs font-bold text-white">{stat.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Vision & Mission Row */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          
          {/* Mission */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 text-left space-y-4 flex flex-col justify-between min-h-[220px]">
            <div className="w-12 h-12 bg-primary-glow rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <Target size={22} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Our Mission</h3>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                To simplify the local boarding process for students and families by offering a transparent, zero-commission rental platform that bridges the gap between hosts and tenants seamlessly.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 text-left space-y-4 flex flex-col justify-between min-h-[220px]">
            <div className="w-12 h-12 bg-primary-glow rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <Sparkles size={22} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Our Vision</h3>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                To become the largest, most secure residential boarding engine in South Asia, powering verified virtual property walk-throughs and secure digital agreements.
              </p>
            </div>
          </div>

        </div>

        {/* Timeline milestones */}
        <div className="mb-24 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-12">Company Milestone Timeline</h2>
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="hidden md:block absolute top-[28px] inset-x-20 h-px bg-white/10" />
            
            <div className="grid md:grid-cols-3 gap-8">
              {timeline.map((item, idx) => (
                <div key={idx} className="space-y-3.5 text-left bg-white/5 border border-white/10 p-6 rounded-3xl relative z-10 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white font-extrabold text-sm flex items-center justify-center shadow-lg">
                    {item.year}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Cards */}
        <div className="mb-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Meet the Team</h2>
          <p className="text-xs md:text-sm text-gray-400 max-w-md mx-auto mb-12">
            The visionary engineers and designers crafting the future of boarding search systems.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, idx) => (
              <div key={idx} className="glass p-6 rounded-3xl border border-white/10 text-center space-y-4 shadow-xl">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border border-white/10 mx-auto">
                  <img src={member.avatar} alt={member.name} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{member.name}</h4>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass p-8 rounded-3xl border border-white/10 text-center max-w-3xl mx-auto space-y-6 shadow-2xl">
          <h3 className="text-xl md:text-2xl font-bold text-white">Join the BoardLanka Ecosystem</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Ready to list your student boarding rooms or explore premium annexes? Create a free account today.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              Get Started Free
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
