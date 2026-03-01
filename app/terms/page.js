'use client';
import { motion } from 'framer-motion';
import { FileText, MapPin, Shield, AlertTriangle, Globe, Gavel } from 'lucide-react';

export default function TermsPage() {
    const sections = [
        {
            title: 'Definitions & Identity',
            icon: <MapPin size={24} className="text-primary" />,
            content: "For the purpose of these Terms and Conditions, The term \"we\", \"us\", \"our\" used anywhere on this page shall mean K Keerthi, whose registered/operational office is Kukatpally, HYDERABAD TELANGANA 500072. \"you\", \"your\", \"user\", \"visitor\" shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us."
        },
        {
            title: 'Usage Terms',
            icon: <FileText size={24} className="text-secondary" />,
            content: "Your use of the website and/or purchase from us are governed by following Terms and Conditions: The content of the pages of this website is subject to change without notice."
        },
        {
            title: 'Warranties & Liability',
            icon: <AlertTriangle size={24} className="text-accent" />,
            content: "Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law. Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable."
        },
        {
            title: 'User Responsibility',
            icon: <Shield size={24} style={{ color: '#00ff88' }} />,
            content: "It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements."
        },
        {
            title: 'Intellectual Property',
            icon: <Globe size={24} style={{ color: '#6366f1' }} />,
            content: "Our website contains material which is owned by or licensed to us. This material includes, but are not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions. All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website. Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense."
        },
        {
            title: 'External Links & Conflicts',
            icon: <Gavel size={24} style={{ color: '#f43f5e' }} />,
            content: "From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information. You may not create a link to our website from another website or document without K Keerthi’s prior written consent. Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India."
        },
        {
            title: 'Transaction Liability',
            icon: <Shield size={24} className="text-primary" />,
            content: "We, shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time."
        }
    ];

    return (
        <div className="container" style={{ paddingBottom: '6rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3.5rem' }}>Terms and <span className="gradient-text">Conditions</span></h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '1rem auto' }}>
                    Please read these terms and conditions carefully before using our platform. Your agreement to these terms is essential for us to provide our services.
                </p>
            </header>

            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {sections.map((section, index) => (
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
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {section.icon}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text)' }}>
                                {index + 1}. {section.title}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1rem' }}>
                                {section.content}
                            </p>
                        </div>
                    </motion.section>
                ))}
            </div>

            <section className="glass-card" style={{
                maxWidth: '900px',
                margin: '4rem auto 0',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05), transparent)'
            }}>
                <p style={{ color: 'var(--text-muted)' }}>
                    By continuing to use this website, you agree to these Terms and Conditions in their entirety.
                </p>
            </section>
        </div>
    );
}
