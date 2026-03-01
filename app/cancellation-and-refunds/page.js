'use client';
import { motion } from 'framer-motion';
import { RefreshCcw, ShieldCheck, Clock, AlertCircle } from 'lucide-react';

export default function CancellationRefundPage() {
    const policies = [
        {
            title: 'Cancellation Policy',
            icon: <RefreshCcw className="text-primary" />,
            content: [
                'Cancellations will be considered only if the request is made within 1-2 days of placing the order.',
                'Cancellation requests may not be entertained if the orders have been communicated to vendors/merchants and shipping has been initiated.',
                'K Keerthi does not accept cancellation requests for digital products like ebooks and courses.'
            ]
        },
        {
            title: 'Refund & Replacement',
            icon: <ShieldCheck className="text-secondary" />,
            content: [
                'Refund/replacement can be made if the customer establishes that the quality of product delivered is not good or damaged.',
                'Damaged or defective items must be reported to our Customer Service team within 1-2 days of receipt.',
                'Requests will be processed once the merchant has checked and determined the defect at their end.'
            ]
        },
        {
            title: 'Product Expectations',
            icon: <AlertCircle className="text-accent" />,
            content: [
                'If the product received is not as shown on the site or as per expectations, report it within 1-2 days of receipt.',
                'The Customer Service Team will review the complaint and take an appropriate decision.',
                'For products with manufacturer warranty, please refer the issue directly to them.'
            ]
        },
        {
            title: 'Refund Process',
            icon: <Clock style={{ color: '#00ff88' }} />,
            content: [
                'In case of any Refunds approved by K Keerthi, it will take 1-2 days for the refund to be processed to the end customer.'
            ]
        }
    ];

    return (
        <div className="container" style={{ paddingBottom: '6rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem' }}>Cancellations and <span className="gradient-text">Refunds</span></h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    At K Keerthi, we value your satisfaction and strive to provide a transparent and fair experience for all our customers.
                </p>
            </header>

            <div style={{ display: 'grid', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                {policies.map((policy, index) => (
                    <motion.section
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}
                    >
                        <div style={{
                            background: 'var(--glass)',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {policy.icon}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{policy.title}</h2>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {policy.content.map((item, i) => (
                                    <li key={i} style={{ color: 'var(--text-muted)', position: 'relative', paddingLeft: '1.5rem' }}>
                                        <span style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: '10px',
                                            width: '6px',
                                            height: '6px',
                                            background: 'var(--primary)',
                                            borderRadius: '50%'
                                        }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.section>
                ))}
            </div>

            <section className="glass-card" style={{
                maxWidth: '900px',
                margin: '4rem auto 0',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.05), transparent)'
            }}>
                <p style={{ color: 'var(--text-muted)' }}>
                    Have questions about an order? Please contact our support team at <strong style={{ color: 'var(--text)' }}>support@kkeerthi.com</strong>
                </p>
            </section>
        </div>
    );
}
