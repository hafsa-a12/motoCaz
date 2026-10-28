import { Bike } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero">
      <svg className="hero__curves" viewBox="0 0 1200 260" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path d="M-20 200C200 120 330 250 560 170S900 60 1220 140" stroke="#fff" strokeWidth="1.5" />
        <path d="M-20 240C240 170 380 280 620 200S940 110 1220 190" stroke="#fff" strokeWidth="1" />
        <path d="M900-10C960 60 1060 70 1220 30" stroke="#fff" strokeWidth="1.5" />
      </svg>
      <div className="hero__icon"><Bike size={26} /></div>
      <h1>Trouvez la moto qui vous ressemble</h1>
      <p>Motos et scooters neufs ou d'occasion, publiés par des vendeurs de toutes les villes du Maroc.</p>
    </section>
  );
}
