import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-about">
          <Link href="/" className="site-footer-brand"><span aria-hidden="true">✳</span> AI Learning Assistant</Link>
          <p>Make room for better questions, deeper understanding, and steady progress.</p>
        </div>
        <div className="site-footer-links">
          <div>
            <span className="footer-label">EXPLORE</span>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/#curiosity">Curiosity cards</Link>
          </div>
          <div>
            <span className="footer-label">YOUR PRACTICE</span>
            <Link href="/chat">AI tutor</Link>
            <Link href="/login">Your learning space</Link>
          </div>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>&copy; {new Date().getFullYear()} AI Learning Assistant</span>
        <span>Keep asking good questions.</span>
      </div>
    </footer>
  );
}