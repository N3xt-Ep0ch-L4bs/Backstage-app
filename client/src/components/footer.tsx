import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p className="footer-copy">© 2025 Backstage. All rights reserved.</p>

      <div className="footer-links">
        <a>Terms of Service</a>
        <a>Privacy Policy</a>
        <a>Support</a>
      </div>

      <div className="footer-icons">
        <a>Twitter</a>
        <a>Discord</a>
        <a>Github</a>
        <a>Youtube</a>
      </div>
    </footer>
  );
};

export default Footer;
