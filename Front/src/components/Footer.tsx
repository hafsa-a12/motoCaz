import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="mc-shell site-footer__inner">
        <Logo />
        <span>La marketplace moto &amp; scooter — neuves et d'occasion.</span>
        <span>© {new Date().getFullYear()} Motocaz</span>
      </div>
    </footer>
  );
}
