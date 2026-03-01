'use client';
import { Shield, Info, Cookie, UserCheck, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="container" style={{ paddingBottom: '6rem', maxWidth: '1000px' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem' }}>Privacy <span className="gradient-text">Policy</span></h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
                    This privacy policy sets out how K Keerthi uses and protects any information that you give when you visit our website.
                </p>
            </header>

            <div style={{ display: 'grid', gap: '2rem' }}>
                <section className="glass-card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <Shield className="text-primary" />
                        <h2 style={{ fontSize: '1.5rem' }}>Our Commitment</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                        K Keerthi is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, you can be assured that it will only be used in accordance with this privacy statement. K Keerthi may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you adhere to these changes.
                    </p>
                </section>

                <section className="glass-card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <Info className="text-secondary" />
                        <h2 style={{ fontSize: '1.5rem' }}>Information We Collect</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>We may collect the following information:</p>
                    <ul style={{ color: 'var(--text-muted)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Name and Job Title</li>
                        <li>Contact information including email address</li>
                        <li>Demographic information such as postcode, preferences and interests, if required</li>
                        <li>Other information relevant to customer surveys and/or offers</li>
                    </ul>
                </section>

                <section className="glass-card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <UserCheck style={{ color: '#00ff88' }} />
                        <h2 style={{ fontSize: '1.5rem' }}>What we do with the information</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>We require this information to understand your needs and provide you with a better service, particularly for the following reasons:</p>
                    <ul style={{ color: 'var(--text-muted)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li>Internal record keeping.</li>
                        <li>We may use the information to improve our products and services.</li>
                        <li>We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.</li>
                        <li>From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail.</li>
                        <li>We may use the information to customise the website according to your interests.</li>
                    </ul>
                </section>

                <section className="glass-card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <Lock className="text-accent" />
                        <h2 style={{ fontSize: '1.5rem' }}>Security</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                        We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure we have put in suitable physical, electronic and managerial procedures to safeguard and secure the information we collect online.
                    </p>
                </section>

                <section className="glass-card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <Cookie style={{ color: '#6366f1' }} />
                        <h2 style={{ fontSize: '1.5rem' }}>How we use cookies</h2>
                    </div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8' }}>
                        <p>A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual.</p>
                        <p>We use traffic log cookies to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.</p>
                        <p>Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.</p>
                        <p>You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.</p>
                    </div>
                </section>

                <section className="glass-card">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <UserCheck className="text-primary" />
                        <h2 style={{ fontSize: '1.5rem' }}>Controlling your personal information</h2>
                    </div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8' }}>
                        <p>You may choose to restrict the collection or use of your personal information in the following ways:</p>
                        <ul style={{ paddingLeft: '2rem' }}>
                            <li>Whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for direct marketing purposes.</li>
                            <li>If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at <strong>uday@kantrilawyer.com</strong></li>
                        </ul>
                        <p>We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.</p>
                        <p>If you believe that any information we are holding on you is incorrect or incomplete, please write to <strong>uday@kantrilawyer.com</strong> or contact us at <strong>9392907777</strong> as soon as possible. We will promptly correct any information found to be incorrect.</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
