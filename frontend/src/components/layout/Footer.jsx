import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">© {new Date().getFullYear()} Nightfall Project</div>
    </footer>
  );
}
