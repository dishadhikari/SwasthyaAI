"use client";

import { useEffect, useState } from "react";

interface Article {
  title: string;
  content: string;
  summary: string;
  url: string;
  image_url?: string;
  category: string;
  points: string[];
}

export default function News() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getNews() {
      try {
        const res = await fetch("http://localhost:5000/news");
        if (!res.ok) {
          throw new Error("Failed to fetch news");
        }
        const data = await res.json();
        console.log("API Response:", data);
        console.log("Is Array:", Array.isArray(data));
        setArticles(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Failed to load news");
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }

    getNews();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading fitness news...</p>
        <div style={styles.loadingDots}>
          <span style={styles.dot}></span>
          <span style={styles.dot}></span>
          <span style={styles.dot}></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <span style={styles.errorIcon}>⚠️</span>
        <h2 style={styles.errorTitle}>Something went wrong</h2>
        <p style={styles.errorText}>{error}</p>
        <button 
          style={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.iconContainer}>
            <span style={styles.headerIcon}>💪</span>
          </div>
          <div>
            <h1 style={styles.title}>Fitness News</h1>
            <p style={styles.subtitle}>
              {articles.length > 0 
                ? `${articles.length} article${articles.length > 1 ? 's' : ''} to keep you informed` 
                : "No articles available"}
            </p>
          </div>
        </div>
        <div style={styles.categoryFilter}>
          <span style={styles.filterLabel}>📰 Latest</span>
        </div>
      </div>

      {/* Articles Grid */}
      <div style={styles.grid}>
        {articles.map((article, index) => (
          <div
            key={index}
            style={{
              ...styles.card,
              animationDelay: `${index * 0.1}s`,
            }}
            className="card"
          >
            {/* Image Placeholder */}
            <div style={styles.imageContainer}>
              {article.image_url ? (
                <img 
                  src={article.image_url} 
                  alt={article.title}
                  style={styles.image}
                />
              ) : (
                <div style={styles.imagePlaceholder}>
                  <span style={styles.imagePlaceholderIcon}>🏋️</span>
                </div>
              )}
              <div style={styles.categoryBadge}>
                {article.category || "Fitness"}
              </div>
            </div>

            {/* Content */}
            <div style={styles.cardContent}>
              <h2 style={styles.articleTitle}>{article.title}</h2>
              
              <div style={styles.summaryContainer}>
                <p style={styles.summary}>{article.summary}</p>
              </div>

              {/* AI Summary Points */}
              {article.points && article.points.length > 0 && (
                <div style={styles.pointsContainer}>
                  <div style={styles.pointsHeader}>
                    <span style={styles.aiIcon}>🤖</span>
                    <span style={styles.pointsLabel}>5-min AI Summary</span>
                  </div>
                  <ul style={styles.pointsList}>
                    {article.points.map((point, pointIndex) => (
                      <li 
                        key={pointIndex} 
                        style={{
                          ...styles.pointItem,
                          animationDelay: `${(index * 0.1) + (pointIndex * 0.05)}s`,
                        }}
                        className="point-item"
                      >
                        <span style={styles.pointBullet}>▸</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Link */}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.readMore}
                className="read-more"
              >
                <span>Read Full Article</span>
                <span style={styles.arrow}>→</span>
              </a>
            </div>
          </div>
        ))}
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .card {
          animation: fadeInUp 0.6s ease-out both;
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .point-item {
          animation: fadeInUp 0.4s ease-out both;
          transition: all 0.2s ease;
        }

        .point-item:hover {
          transform: translateX(6px);
          color: #000;
        }

        .read-more {
          transition: all 0.3s ease;
        }

        .read-more:hover {
          transform: translateX(8px);
          gap: 12px;
        }

        .read-more:active {
          transform: scale(0.97);
        }

        .dot {
          animation: pulse 1.4s ease-in-out infinite;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 24px",
    minHeight: "100vh",
    background: "#fafafa",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    paddingBottom: 20,
    borderBottom: "3px solid #000",
    flexWrap: "wrap" as const,
    gap: 16,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#000",
  },
  headerIcon: {
    fontSize: "1.8rem",
    color: "#fff",
  },
  title: {
    fontSize: "2.4rem",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#666",
    margin: "4px 0 0 0",
  },
  categoryFilter: {
    padding: "8px 20px",
    border: "2px solid #000",
    borderRadius: 20,
    background: "#fff",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  filterLabel: {
    color: "#000",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 30,
  },
  card: {
    background: "#fff",
    border: "2px solid #000",
    borderRadius: 16,
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  imageContainer: {
    position: "relative" as const,
    width: "100%",
    height: 200,
    background: "#f0f0f0",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  imagePlaceholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
  },
  imagePlaceholderIcon: {
    fontSize: "3rem",
    opacity: 0.5,
  },
  categoryBadge: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    padding: "6px 14px",
    background: "#000",
    color: "#fff",
    borderRadius: 20,
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  cardContent: {
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },
  articleTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    lineHeight: 1.3,
  },
  summaryContainer: {
    padding: "12px 16px",
    background: "#f8f8f8",
    borderRadius: 8,
    borderLeft: "4px solid #000",
  },
  summary: {
    fontSize: "0.95rem",
    color: "#444",
    margin: 0,
    lineHeight: 1.6,
  },
  pointsContainer: {
    marginTop: 4,
  },
  pointsHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aiIcon: {
    fontSize: "1rem",
  },
  pointsLabel: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#000",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  pointsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  pointItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: "0.9rem",
    color: "#555",
    lineHeight: 1.5,
    padding: "6px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  pointBullet: {
    color: "#000",
    fontWeight: 700,
  },
  readMore: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 0",
    color: "#000",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
    borderTop: "2px solid #e0e0e0",
    marginTop: 8,
    paddingTop: 16,
    transition: "all 0.3s ease",
  },
  arrow: {
    fontSize: "1.2rem",
    transition: "transform 0.3s ease",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: 20,
    background: "#fafafa",
  },
  spinner: {
    width: 50,
    height: 50,
    border: "3px solid #e0e0e0",
    borderTop: "3px solid #000",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "1.1rem",
    color: "#666",
    fontWeight: 500,
    margin: 0,
  },
  loadingDots: {
    display: "flex",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#000",
    display: "inline-block",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#fafafa",
    padding: 20,
    gap: 16,
  },
  errorIcon: {
    fontSize: "3rem",
  },
  errorTitle: {
    fontSize: "1.5rem",
    color: "#000",
    margin: 0,
  },
  errorText: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
  },
  retryButton: {
    padding: "12px 32px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
} as const;