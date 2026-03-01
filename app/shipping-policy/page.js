'use client';
import { Truck, MapPin, Clock, Mail, AlertTriangle } from 'lucide-react';

export default function ShippingPolicyPage() {
    return (
        <div className="container" style={{ paddingBottom: '6rem', maxWidth: '900px' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem' }}>Shipping <span className="gradient-text">Policy</span></h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    Information about our domestic delivery processes and timelines for physical bookstore items.
                </p>
            </header>

            <div style={{ display: 'grid', gap: '2rem' }}>
                <section className="glass-card">
                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(0, 255, 136, 0.1)', padding: '0.8rem', borderRadius: '10px' }}>
                            <Truck className="text-primary" size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem' }}>Domestic Shipping (India)</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                        For Domestic (within India) buyers, orders are shipped and delivered through registered international courier companies and/or speed post only.
                        Delivery of all orders will be to the address provided by the buyer at the time of purchase.
                    </p>
                </section>

                <section className="glass-card">
                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.8rem', borderRadius: '10px' }}>
                            <AlertTriangle className="text-accent" size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem' }}>International Buyers</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                        Currently we are not delivering the physical items (books) for International buyers.
                        However, international customers are welcome to purchase our <strong>eBooks or Courses</strong> which are delivered digitally via our website.
                    </p>
                </section>

                <section className="glass-card">
                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.8rem', borderRadius: '10px' }}>
                            <Clock className="text-secondary" size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem' }}>Shipping Timeline & Liability</h2>
                    </div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8' }}>
                        <p>
                            Orders are shipped within <strong>3-5 days</strong> or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms.
                        </p>
                        <p>
                            <strong>K Keerthi</strong> is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within 3-5 days from the date of the order and payment or as per the delivery date agreed at the time of order confirmation.
                        </p>
                    </div>
                </section>

                <section className="glass-card">
                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(0, 255, 136, 0.1)', padding: '0.8rem', borderRadius: '10px' }}>
                            <Mail className="text-primary" size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem' }}>Confirmation & Support</h2>
                    </div>
                    <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                        <p style={{ marginBottom: '1rem' }}>
                            Delivery of our services will be confirmed on your mail ID as specified during registration or production confirmation.
                        </p>
                        <p>
                            For any issues in utilizing our services you may contact our helpdesk at:
                            <br />
                            <strong>Phone:</strong> 9392907777
                            <br />
                            <strong>Email:</strong> uday@kantrilawyer.com
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
