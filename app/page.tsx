"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}></div>
          <h1 style={styles.logoText}>SwasthyaAI</h1>
        </div>
        
        <p style={styles.tagline}>
          AI-powered personalized workout plans with real-time computer vision
          <br />
          <span style={styles.taglineSub}>
            Track your exercise execution and progress like never before
          </span>
        </p>

        {/* CTA Button */}
        <Link href="/login" style={styles.ctaButton} className="cta-button">
          <span>Get Started</span>
          <span style={styles.ctaArrow}>→</span>
        </Link>
      </div>

      {/* Navigation Cards */}
      <div style={styles.navGrid}>
        <Link href="/plan" style={styles.navCard} className="nav-card">
          <div style={styles.cardIcon}></div>
          <h3 style={styles.cardTitle}>AI Plan</h3>
          <p style={styles.cardDesc}>Generate personalized workout plans</p>
          <span style={styles.cardArrow}>→</span>
        </Link>

        <Link href="/news" style={styles.navCard} className="nav-card">
          <div style={styles.cardIcon}></div>
          <h3 style={styles.cardTitle}>News</h3>
          <p style={styles.cardDesc}>Stay updated with fitness news</p>
          <span style={styles.cardArrow}>→</span>
        </Link>

        <Link href="/nearby" style={styles.navCard} className="nav-card">
          <div style={styles.cardIcon}></div>
          <h3 style={styles.cardTitle}>Nearby Gyms</h3>
          <p style={styles.cardDesc}>Find gyms near your location</p>
          <span style={styles.cardArrow}>→</span>
        </Link>

        <Link href="/dashboard" style={styles.navCard} className="nav-card">
          <div style={styles.cardIcon}></div>
          <h3 style={styles.cardTitle}>My Workouts</h3>
          <p style={styles.cardDesc}>View and manage your workout plans</p>
          <span style={styles.cardArrow}>→</span>
        </Link>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <span style={styles.footerLogo}> SwasthyaAI</span>
          <nav style={styles.footerNav}>
            <Link href="/login" style={styles.footerLink} className="footer-link">
              Log In / Sign Up
            </Link>
            <span style={styles.footerDivider}>|</span>
            <Link href="/about" style={styles.footerLink} className="footer-link">
              About
            </Link>
            <span style={styles.footerDivider}>|</span>
            <Link href="/privacy" style={styles.footerLink} className="footer-link">
              Privacy
            </Link>
          </nav>
        </div>
        <p style={styles.footerCopy}>
          © 2024 SwasthyaAI. All rights reserved.
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .hero {
          animation: fadeInUp 0.8s ease-out;
        }

        .nav-card {
          animation: fadeInUp 0.6s ease-out both;
          transition: all 0.3s ease;
        }

        .nav-card:nth-child(1) { animation-delay: 0.1s; }
        .nav-card:nth-child(2) { animation-delay: 0.2s; }
        .nav-card:nth-child(3) { animation-delay: 0.3s; }
        .nav-card:nth-child(4) { animation-delay: 0.4s; }

        .nav-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          border-color: #000;
        }

        .nav-card:active {
          transform: scale(0.97);
        }

        .cta-button {
          transition: all 0.3s ease;
          animation: pulse 2s ease-in-out infinite;
        }

        .cta-button:hover {
          transform: translateY(-3px) scale(1.05);
          background: #222;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .cta-button:active {
          transform: scale(0.95);
        }

        .footer-link {
          transition: all 0.3s ease;
        }

        .footer-link:hover {
          color: #000;
          text-decoration: underline;
        }

        .logo-container {
          animation: slideInLeft 0.8s ease-out;
        }

        .tagline {
          animation: fadeIn 1s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#fafafa",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "space-between",
    padding: "40px 24px",
  },
  hero: {
    maxWidth: 800,
    width: "100%",
    textAlign: "center" as const,
    marginBottom: 60,
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: "3.5rem",
    display: "inline-block",
    animation: "float 3s ease-in-out infinite",
  },
  logoText: {
    fontSize: "4rem",
    fontWeight: 800,
    color: "white",
    margin: 0,
    letterSpacing: "-0.03em",
    background: "#000",
    colour: "#fff",
    padding: "8px 24px",
    borderRadius: 12,
    display: "inline-block",
  },
  tagline: {
    fontSize: "1.4rem",
    color: "#333",
    lineHeight: 1.8,
    marginBottom: 32,
    maxWidth: 600,
    marginLeft: "auto",
    marginRight: "auto",
  },
  taglineSub: {
    fontSize: "1rem",
    color: "#666",
    display: "block",
    marginTop: 8,
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 40px",
    background: "#000",
    color: "#fff",
    textDecoration: "none",
    borderRadius: 50,
    fontSize: "1.1rem",
    fontWeight: 600,
    transition: "all 0.3s ease",
    border: "2px solid #000",
  },
  ctaArrow: {
    fontSize: "1.3rem",
    transition: "transform 0.3s ease",
  },
  navGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 24,
    maxWidth: 1000,
    width: "100%",
    marginBottom: 60,
  },
  navCard: {
    background: "#fff",
    border: "2px solid #e0e0e0",
    borderRadius: 16,
    padding: "32px 24px",
    textDecoration: "none",
    color: "#000",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative" as const,
  },
  cardIcon: {
    fontSize: "2.5rem",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#000",
    margin: "0 0 8px 0",
  },
  cardDesc: {
    fontSize: "0.9rem",
    color: "#666",
    margin: "0 0 16px 0",
    lineHeight: 1.5,
  },
  cardArrow: {
    fontSize: "1.2rem",
    color: "#000",
    fontWeight: 700,
    transition: "transform 0.3s ease",
  },
  footer: {
    maxWidth: 1000,
    width: "100%",
    borderTop: "2px solid #e0e0e0",
    paddingTop: 24,
    marginTop: 20,
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 16,
    marginBottom: 12,
  },
  footerLogo: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#000",
  },
  footerNav: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap" as const,
  },
  footerLink: {
    color: "#666",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "all 0.3s ease",
  },
  footerDivider: {
    color: "#ccc",
  },
  footerCopy: {
    fontSize: "0.8rem",
    color: "#999",
    margin: 0,
    textAlign: "center" as const,
  },
} as const;