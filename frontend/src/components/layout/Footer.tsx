'use client';

import React from 'react';
import Link from 'next/link';
import { Music2, Instagram, Youtube, Twitter, Mail } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'AI Music Coach', href: '#features' },
    { label: 'Community', href: '#features' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '#contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refunds' },
  ],
  Download: [
    { label: 'Android App', href: '#download' },
    { label: 'iOS App', href: '#download' },
    { label: 'Web App', href: '/signup' },
  ],
};

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://instagram.com/svaraverse', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/@svaraverse', label: 'YouTube' },
  { icon: Twitter, href: 'https://twitter.com/svaraverse', label: 'Twitter' },
  { icon: Mail, href: 'mailto:hello@svaraverse.com', label: 'Email' },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-walnut-gradient text-cream-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient">
                <Music2 className="h-5 w-5 text-walnut-600" />
              </div>
              <span className="font-display text-lg font-semibold text-cream-50">
                SvaraVerse<span className="text-gold-400"> AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-cream-100/70">
              The premium operating system for Indian singers, playback aspirants, and music creators.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-50/10 text-cream-100 transition-colors hover:bg-gold-400 hover:text-walnut-600"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display text-sm font-semibold text-cream-50">{category}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream-100/70 transition-colors hover:text-gold-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream-50/10 pt-8 sm:flex-row">
          <p className="text-xs text-cream-100/60">
            © {new Date().getFullYear()} SvaraVerse AI. All rights reserved.
          </p>
          <p className="text-xs text-cream-100/60">
            Crafted with raga, rhythm, and a little bit of code — in India.
          </p>
        </div>
      </div>
    </footer>
  );
}
