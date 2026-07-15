"use client";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (response: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: response.credential,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        console.log("Logged in:", data);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <span style={styles.icon}>💪</span>
          </div>
          <h1 style={styles.title}>Workout Tracker</h1>
          <p style={styles.subtitle}>Sign in to access your workouts</p>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
        </div>

        {/* Login Section */}
        <div style={styles.loginSection}>
          {error && (
            <div style={styles.errorContainer} className="slide-down">
              <span style={styles.errorIcon}>⚠️</span>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <div style={styles.googleButtonWrapper}>
            <GoogleLogin
              onSuccess={handleLogin}
              onError={() => {
                setError("Google login failed. Please try again.");
              }}
              theme="outline"
              size="large"
              text="signin_with"
              shape="pill"
              logo_alignment="center"
            />
          </div>

          <p style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div style={styles.loadingOverlay} className="fade-in">
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Signing in...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .slide-down {
          animation: slideDown 0.4s ease-out;
        }

        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .card {
          animation: fadeInUp 0.6s ease-out;
        }

        .google-button-wrapper {
          transition: all 0.3s ease;
        }

        .google-button-wrapper:hover {
          transform: scale(1.02);
        }

        .google-button-wrapper:active {
          transform: scale(0.98);
        }

        .loading-dot {
          animation: pulse 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f8f8f8",
    padding: "20px",
    margin: 0,
    position: "relative" as const,
  },
  card: {
    background: "#ffffff",
    border: "2px solid #000000",
    borderRadius: "20px",
    padding: "50px 40px",
    maxWidth: "450px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
    position: "relative" as const,
    overflow: "hidden",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "30px",
  },
  iconContainer: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#000",
    marginBottom: "20px",
    transition: "transform 0.3s ease",
  },
  icon: {
    fontSize: "2.8rem",
    color: "#fff",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#000",
    margin: "0 0 8px 0",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
    fontWeight: 400,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    marginBottom: "30px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e0e0e0",
  },
  loginSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "#fff5f5",
    border: "1px solid #ff0000",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  errorIcon: {
    fontSize: "1.2rem",
  },
  errorText: {
    fontSize: "0.9rem",
    color: "#cc0000",
    margin: 0,
    flex: 1,
  },
  googleButtonWrapper: {
    display: "flex",
    justifyContent: "center",
    transition: "all 0.3s ease",
    minHeight: "60px",
  },
  termsText: {
    fontSize: "0.8rem",
    color: "#999",
    textAlign: "center" as const,
    margin: "10px 0 0 0",
    lineHeight: 1.6,
    maxWidth: "300px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  loadingOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255,255,255,0.9)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    borderRadius: "20px",
    backdropFilter: "blur(4px)",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e0e0e0",
    borderTop: "3px solid #000",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "0.95rem",
    color: "#333",
    margin: 0,
    fontWeight: 500,
  },
} as const;