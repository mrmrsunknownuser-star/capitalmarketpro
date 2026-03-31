'use client'

import { useState } from 'react'
import Link from 'next/link'

const SECTIONS = [
  {
    id: '1',
    title: '1. Acceptance of Terms',
    content: `By accessing, registering for, or using any service provided by CapitalMarket Pro ("the Platform", "we", "us", "our"), you ("User", "you", "your") expressly agree to be legally bound by these Terms and Conditions in their entirety.

If you do not agree with any part of these Terms, you must immediately cease using the Platform and close your account. Continued use of the Platform constitutes irrevocable acceptance of these Terms.

These Terms constitute a legally enforceable agreement between you and CapitalMarket Pro Financial Services. We reserve the right to update these Terms at any time with 30 days written notice via email or platform notification.`,
  },
  {
    id: '2',
    title: '2. Platform Overview & Automated System',
    content: `CapitalMarket Pro is a fully integrated financial services platform offering:

• Automated Investment Management — AI-powered trading engine operating 24/7
• Cryptocurrency Trading — 100+ digital assets across major exchanges
• Stock & ETF Trading — Global equity markets including US, EU, and Asian markets
• Affiliate Earnings Program — Commission-based referral system
• Trading Signals — Professional algorithmic buy/sell recommendations
• Manual Trading — Leveraged crypto trading up to 100x
• CapitalMarket Pro Cards — Virtual and physical VISA-powered payment cards

Our proprietary AI trading algorithm has maintained an 84% win rate over 36 consecutive months, managing over $2.4 billion in total trading volume. The system executes thousands of micro-trades per second across multiple asset classes to optimize returns for all investment plan holders.

The automated system operates independently of market conditions, utilizing advanced hedging strategies, arbitrage opportunities, and machine learning models trained on 15+ years of market data.`,
  },
  {
    id: '3',
    title: '3. Account Registration & Eligibility',
    content: `To use CapitalMarket Pro, you must:

• Be at least 18 years of age (or the legal age of majority in your jurisdiction)
• Provide accurate, complete, and current information during registration
• Maintain the security of your account credentials
• Notify us immediately of any unauthorized account access
• Not create multiple accounts for the same individual
• Not be a resident of a jurisdiction where our services are prohibited

You are solely responsible for all activities that occur under your account. CapitalMarket Pro reserves the right to refuse registration, suspend, or terminate any account at its sole discretion.`,
  },
  {
    id: '4',
    title: '4. Know Your Customer (KYC) & Identity Verification',
    content: `As a regulated financial platform, CapitalMarket Pro is legally required to verify the identity of all users before enabling full account functionality.

KYC Requirements:
• Government-issued photo ID (passport, driver's license, or national ID)
• Proof of address (utility bill or bank statement — not older than 3 months)
• Selfie with ID document
• For accounts over $50,000: Enhanced Due Diligence (EDD) may be required

KYC Processing:
• Standard Verification: Free — processed within 24-48 hours
• Expedited Verification: $50 — processed within 2-4 hours

Features locked pending KYC approval:
• Withdrawals (all amounts)
• Investment plans over $1,000
• Physical card applications
• Affiliate payouts over $500

CapitalMarket Pro reserves the right to request updated documentation at any time in compliance with AML regulations.`,
  },
  {
    id: '5',
    title: '5. Deposits & Accepted Payment Methods',
    content: `Deposits are processed through our secure encrypted payment gateway. The following methods are accepted:

Cryptocurrency Deposits:
• Bitcoin (BTC) — Recommended for fastest processing
• Ethereum (ETH)
• USDT (TRC20 & ERC20)
• BNB (BEP20)
• Other major cryptocurrencies via our payment providers

Supported Providers:
• MoonPay — Visa, Mastercard, Apple Pay, Bank Transfer
• Binance — P2P, Card, Binance Account
• Paybis — Credit Card, Skrill, Neteller, Wire Transfer
• Coinbase — Bank Account, Debit Card, PayPal
• Simplex — Visa, Mastercard, SEPA
• Transak — Card, Bank Transfer, UPI, Mobile Money

Manual Trading Account Deposits:
• Cryptocurrency (BTC preferred)
• Apple Pay (for enhanced privacy compliance)

Deposit Terms:
• Minimum deposit: $100 USD equivalent
• No deposit fees — 0% charged by CapitalMarket Pro
• Processing time: Under 30 minutes after 1 blockchain confirmation
• Deposits are non-refundable once credited to your account`,
  },
  {
    id: '6',
    title: '6. Withdrawal Policy & Processing',
    content: `Withdrawal requests are subject to the following terms:

Processing Timeline:
• Standard withdrawals: 24-48 business hours review
• Verified accounts (KYC approved): Priority processing
• Large withdrawals (over $50,000): May require additional verification — 3-5 business days

Withdrawal Fees:
• Processing Fee: 5% of withdrawal amount
• Minimum withdrawal fee: $100.00
• Minimum withdrawal amount: $100 USD equivalent
• No maximum withdrawal limit for fully verified accounts

Supported Withdrawal Networks:
• Bitcoin (BTC) — Main network
• Ethereum (ETH) — ERC20
• USDT — TRC20 or ERC20
• BNB — BEP20

Important Withdrawal Conditions:
• KYC verification must be completed before any withdrawal
• Account must not have any pending compliance review
• Withdrawal address must be verified and whitelisted
• First-time withdrawals to new addresses may require 24-hour security hold

CapitalMarket Pro reserves the right to delay or suspend withdrawals pending compliance review, security verification, or investigation of suspicious activity.`,
  },
  {
    id: '7',
    title: '7. Investment Plans & Guaranteed Returns',
    content: `CapitalMarket Pro offers six automated investment tiers managed entirely by our AI trading system:

┌─────────────┬──────────┬──────────┬────────────────────┬──────────┬──────────┐
│ Plan        │ Daily ROI│ Duration │ Investment Range    │ Total ROI│ Min.     │
├─────────────┼──────────┼──────────┼────────────────────┼──────────┼──────────┤
│ Starter     │ 5%       │ 7 Days   │ $200 – $999        │ 35%      │ $200     │
│ Silver      │ 8%       │ 14 Days  │ $1,000 – $4,999    │ 112%     │ $1,000   │
│ Gold        │ 12%      │ 21 Days  │ $5,000 – $19,999   │ 252%     │ $5,000   │
│ Platinum    │ 15%      │ 30 Days  │ $20,000 – $49,999  │ 450%     │ $20,000  │
│ Elite       │ 20%      │ 30 Days  │ $50,000 – $99,999  │ 600%     │ $50,000  │
│ Black       │ 25%      │ 30 Days  │ $100,000+          │ 750%     │ $100,000 │
└─────────────┴──────────┴──────────┴────────────────────┴──────────┴──────────┘

Plan Terms:
• Principal and all profits are returned at end of each investment cycle
• Auto-compounding available on all plans — re-invest returns automatically
• Early withdrawal is not permitted during active investment cycles
• Multiple plans can be active simultaneously
• Plans are activated within 1 hour of deposit confirmation
• Returns are credited daily to your dashboard balance`,
  },
  {
    id: '8',
    title: '8. Trading Signal Plans',
    content: `Professional algorithmic trading signals are available via subscription:

Signal Plan Pricing:
• Basic — $99/month: 5 signals/day · Crypto only · Email alerts
• Pro — $199/month: 15 signals/day · Crypto + Stocks · Push + Email · Risk management
• Elite — $349/month: 30 signals/day · All markets · Priority alerts · Advanced analysis · Weekly outlook
• VIP — $599/month: Unlimited signals · All markets · 24/7 priority · 1-on-1 strategy calls · Dedicated manager

Signal Service Terms:
• Subscriptions are billed monthly and auto-renew unless cancelled
• Cancellation must be requested 48 hours before renewal date
• No refunds on partially used subscription periods
• Signals are generated by our proprietary algorithm — 84% historical accuracy
• Past signal performance does not guarantee future accuracy
• Signals are for informational purposes and should not be the sole basis for trading decisions`,
  },
  {
    id: '9',
    title: '9. CapitalMarket Pro Cards',
    content: `Virtual and physical VISA-powered cards are available to verified account holders.

Virtual Cards:
• Standard Virtual Card: $150 activation fee · $10,000/month limit
• Gold Virtual Card: $350 activation fee · $50,000/month limit · 2% cashback
• Black Virtual Card: $750 activation fee · Unlimited · 5% cashback

Physical Cards:
• Standard Physical Card: $450 + $120 shipping · $25,000/month limit · 2% cashback
• Gold Physical Card: $850 + $200 express shipping · $100,000/month limit · 3% cashback
• Titanium Black Card: $2,500 + $500 private courier · Unlimited · 7% cashback

Card Terms & Conditions:
• Activation fees are non-refundable under any circumstances
• Physical card shipping fees are non-refundable once dispatched
• International shipments may incur customs duties payable by the recipient
• Delivery times are estimates — CapitalMarket Pro is not liable for courier delays
• Cards are subject to KYC approval before issuance
• Card limits may be adjusted based on account tier and verification level
• Cashback is credited monthly to your platform account
• Card replacement fee: $75 (waived for Black card holders)
• Cards can be instantly frozen/unfrozen via the platform
• CapitalMarket Pro reserves the right to cancel cards for policy violations`,
  },
  {
    id: '10',
    title: '10. Manual Trading Terms',
    content: `The manual trading feature allows users to execute leveraged cryptocurrency trades directly on the platform.

Funding Requirements:
• Minimum account funding: $500 USD
• Accepted funding methods: Cryptocurrency and Apple Pay only
• Reason: These methods provide end-to-end encryption ensuring trading activity cannot be monitored by traditional banking institutions, protecting your financial privacy

Privacy Statement for Manual Trading:
Manual trading account funding is restricted to cryptocurrency and Apple Pay exclusively. This policy exists to protect your trading activity from surveillance by banks, credit card companies, and financial regulators who may report or restrict trading-related transactions. Your privacy in financial matters is of paramount importance to us.

Leverage Terms:
• Available leverage: 1x to 100x
• Higher leverage increases both potential gains and potential losses
• Stop-loss is automatically triggered to prevent negative balance
• Margin calls will be issued when account reaches 20% of required margin

Risk Warning:
Manual trading with leverage carries extremely high risk. A majority of retail traders lose money when trading leveraged products. Only trade with funds you can afford to lose entirely. CapitalMarket Pro is not responsible for any losses incurred through manual trading activity.`,
  },
  {
    id: '11',
    title: '11. Affiliate Program',
    content: `The CapitalMarket Pro Affiliate Program allows users to earn commissions by referring new traders.

Commission Structure:
• Level 1 (Direct referrals): 10% of referred user's first deposit
• Level 2 (Indirect referrals): 3% of second-level referrals
• Minimum payout threshold: $50
• Payouts processed weekly to your platform balance

Affiliate Terms:
• Referral links are unique to each account and non-transferable
• Commission is credited within 24 hours of referred user's first deposit
• Fraudulent referrals (self-referral, fake accounts) result in immediate termination
• CapitalMarket Pro reserves the right to modify commission rates with 14 days notice
• Affiliates must comply with all applicable advertising and marketing regulations`,
  },
  {
    id: '12',
    title: '12. Regulatory Fees Schedule',
    content: `Complete fee schedule for all CapitalMarket Pro services:

TRANSACTION FEES:
• Deposit Fee: 0% (free)
• Withdrawal Processing Fee: 5% (minimum $100)
• Trading Commission: 10% on profits only
• Wire Transfer Fee: $30 per outgoing wire

ACCOUNT FEES:
• Inactivity Fee: $39.90/month after 6 consecutive months of inactivity
• Regulatory Compliance Fee: 7% annually (charged 1.75% quarterly)
• Currency Conversion Fee: 2% on all non-USD transactions
• KYC Standard Verification: Free
• KYC Expedited Verification: $50

SUBSCRIPTION FEES:
• Signal Basic: $99/month
• Signal Pro: $199/month
• Signal Elite: $349/month
• Signal VIP: $599/month

CARD FEES:
• Virtual Standard Activation: $150
• Virtual Gold Activation: $350
• Virtual Black Activation: $750
• Physical Standard: $450 + $120 shipping
• Physical Gold: $850 + $200 shipping
• Titanium Black: $2,500 + $500 courier
• Card Replacement: $75

DOCUMENT & REPORTING FEES:
• Annual Tax Report (1099): $300
• Account Statement (per request): $25
• Transaction History Export: Free

All fees are subject to change with 30 days written notice. Fees are NOT automatically deducted — explicit authorization is required for all fee transactions.`,
  },
  {
    id: '13',
    title: '13. Anti-Money Laundering (AML) Policy',
    content: `CapitalMarket Pro maintains strict compliance with international Anti-Money Laundering regulations.

Our AML program includes:
• Customer Due Diligence (CDD) for all account holders
• Enhanced Due Diligence (EDD) for high-value accounts and politically exposed persons
• Transaction monitoring for suspicious activity
• Mandatory reporting to relevant financial intelligence units
• Regular staff training on AML compliance

Prohibited Activities:
• Structuring transactions to avoid reporting thresholds
• Using the platform to launder proceeds of criminal activity
• Providing false identity information
• Operating accounts on behalf of third parties without disclosure
• Any activity that facilitates tax evasion

Violation of AML policies will result in immediate account suspension, fund freeze, and mandatory reporting to law enforcement authorities.`,
  },
  {
    id: '14',
    title: '14. Privacy & Data Protection',
    content: `CapitalMarket Pro is committed to protecting your personal information in compliance with GDPR and applicable data protection laws.

Data We Collect:
• Personal identification information (name, email, phone, address)
• Identity verification documents (KYC)
• Financial transaction data
• Device and usage information for security purposes
• Communication records for support purposes

How We Use Your Data:
• Account creation and management
• Identity verification and compliance
• Transaction processing and record keeping
• Security monitoring and fraud prevention
• Customer support
• Service improvement and analytics

Data Sharing:
• We never sell personal data to third parties
• Data may be shared with regulatory authorities as required by law
• KYC verification may involve third-party identity verification services
• Payment processors receive only data necessary for transaction completion

Your Rights:
• Right to access your personal data
• Right to correct inaccurate information
• Right to data portability
• Right to request deletion (subject to legal retention requirements)
• Right to object to processing

Data is retained for a minimum of 5 years as required by financial regulations.`,
  },
  {
    id: '15',
    title: '15. Security Obligations',
    content: `You are responsible for maintaining the security of your account:

Your Security Obligations:
• Use a strong, unique password of at least 12 characters
• Enable Two-Factor Authentication (2FA) — strongly recommended
• Never share your login credentials with any third party
• Log out of your account after each session on shared devices
• Immediately notify support of any suspicious account activity
• Keep your registered email address secure and accessible

CapitalMarket Pro Security Measures:
• 256-bit SSL/TLS encryption on all data transmission
• Cold storage for 95% of user funds
• Regular third-party security audits
• DDoS protection and IP monitoring
• Automated fraud detection systems
• Biometric verification options

Session Security:
• Automatic session timeout after 30 minutes of inactivity
• Login activity log maintained for 90 days
• Suspicious login attempts trigger automatic account lock
• New device login requires email verification`,
  },
  {
    id: '16',
    title: '16. Intellectual Property',
    content: `All content on CapitalMarket Pro is protected by international intellectual property laws.

CapitalMarket Pro owns or licenses:
• The platform technology and software
• Trading algorithms and signal systems
• Brand names, logos, and trademarks
• All written content, charts, and data displays
• API and integration technology

You may not:
• Copy, reproduce, or redistribute platform content
• Reverse engineer any platform technology
• Use our brand name or logo without written permission
• Scrape or data-mine the platform
• Create derivative works based on our technology

Violation of intellectual property rights may result in immediate account termination and legal action.`,
  },
  {
    id: '17',
    title: '17. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law:

CapitalMarket Pro is NOT liable for:
• Losses resulting from market volatility or adverse market conditions
• System downtime due to technical maintenance or force majeure
• Unauthorized account access resulting from user negligence
• Delays in transaction processing beyond our control
• Losses incurred through manual trading activities
• Actions or omissions of third-party payment providers
• Tax liabilities arising from your use of the platform
• Indirect, incidental, special, or consequential damages

Maximum Liability Cap:
Our total cumulative liability to you shall not exceed the total fees paid by you to CapitalMarket Pro in the 12 months immediately preceding the claim.

Force Majeure:
CapitalMarket Pro is not liable for delays or failures resulting from circumstances beyond our reasonable control, including but not limited to acts of God, government actions, internet outages, exchange failures, or regulatory changes.`,
  },
  {
    id: '18',
    title: '18. Account Termination',
    content: `CapitalMarket Pro reserves the right to suspend or terminate accounts for:

Immediate Termination (no notice required):
• Providing false identity or fraudulent documentation
• Money laundering or terrorist financing activity
• Unauthorized use of other users' accounts
• Violation of AML/KYC regulations
• Chargebacks or payment disputes
• Abusive behavior toward staff

Termination with Notice (30 days):
• Repeated violation of platform policies
• Inactive account with negative balance
• Regulatory requirements

Upon Termination:
• Remaining balance (minus applicable fees) will be returned within 30 business days
• Subject to completion of compliance review and identity verification
• Funds may be held longer if under investigation
• You may request account data export within 60 days of termination`,
  },
  {
    id: '19',
    title: '19. Dispute Resolution',
    content: `In the event of a dispute between you and CapitalMarket Pro:

Step 1 — Internal Resolution:
Contact our support team at support@capitalmarket-pro.com. We aim to resolve all disputes within 5-10 business days.

Step 2 — Formal Complaint:
If unresolved, submit a formal written complaint to legal@capitalmarket-pro.com with full documentation.

Step 3 — Arbitration:
Unresolved disputes shall be settled by binding arbitration under internationally recognized arbitration rules. Arbitration shall be conducted in English.

Class Action Waiver:
By using CapitalMarket Pro, you waive any right to participate in a class action lawsuit or class-wide arbitration against CapitalMarket Pro.

Governing Law:
These Terms are governed by applicable international financial services law. Any legal proceedings must be brought within 1 year of the event giving rise to the claim.`,
  },
  {
    id: '20',
    title: '20. Miscellaneous',
    content: `Entire Agreement:
These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and CapitalMarket Pro regarding your use of the Platform.

Severability:
If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.

Waiver:
Failure to enforce any provision of these Terms does not constitute a waiver of our right to enforce that provision in the future.

Assignment:
You may not assign your rights or obligations under these Terms without our prior written consent. We may assign our rights without restriction.

Language:
These Terms are written in English. Any translation is provided for convenience only. In case of conflict, the English version prevails.

Contact Information:
CapitalMarket Pro Financial Services
Website: https://capitalmarket-pro.com
Support: support@capitalmarket-pro.com
Legal: legal@capitalmarket-pro.com
Live Support: 24/7 via platform chat`,
  },
]

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  return (
    <div style={{ fontFamily: 'monospace', background: '#060a0f', color: '#e6edf3', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid #161b22', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #C9A84C, #E8D08C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#060a0f' }}>C</div>
          <span style={{ fontSize: 15, fontWeight: 700 }}>
            <span style={{ color: '#C9A84C' }}>CapitalMarket</span>
            <span style={{ color: '#e6edf3' }}> Pro</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { icon: '✅', text: 'Legally Binding', color: '#3fb950', bg: 'rgba(63,185,80,0.1)' },
            { icon: '📋', text: 'Updated Jan 2025', color: '#C9A84C', bg: 'rgba(201,168,76,0.1)' },
            { icon: '🔒', text: '256-bit Secured', color: '#0052FF', bg: 'rgba(0,82,255,0.1)' },
            { icon: '⚖️', text: 'GDPR Compliant', color: '#7B2BF9', bg: 'rgba(123,43,249,0.1)' },
          ].map(b => (
            <div key={b.text} style={{ fontSize: 11, color: b.color, background: b.bg, border: `1px solid ${b.color}33`, padding: '5px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
              {b.icon} {b.text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32 }}>

        {/* Sidebar TOC */}
        <div style={{ position: 'sticky', top: 20, height: 'fit-content' }}>
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Table of Contents</div>
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#section-${s.id}`}
                onClick={() => setActiveSection(s.id)}
                style={{ display: 'block', fontSize: 11, color: activeSection === s.id ? '#C9A84C' : '#8b949e', textDecoration: 'none', padding: '6px 8px', borderRadius: 6, marginBottom: 2, background: activeSection === s.id ? 'rgba(201,168,76,0.08)' : 'transparent', borderLeft: activeSection === s.id ? '2px solid #C9A84C' : '2px solid transparent', lineHeight: 1.4 }}
              >
                {s.title.split('. ')[0]}. {s.title.split('. ')[1]?.slice(0, 24)}{s.title.split('. ')[1]?.length > 24 ? '...' : ''}
              </a>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Hero */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>Terms & Conditions</h1>
            <p style={{ fontSize: 13, color: '#484f58', lineHeight: 1.7 }}>
              Please read these Terms and Conditions carefully before using CapitalMarket Pro. These terms govern your use of our platform and all associated services. By creating an account, you agree to be legally bound by these terms.
            </p>
          </div>

          {/* Sections */}
          {SECTIONS.map(section => (
            <div
              key={section.id}
              id={`section-${section.id}`}
              style={{ marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid #161b22' }}
            >
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#C9A84C', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#C9A84C', flexShrink: 0 }}>
                  {section.id}
                </div>
                {section.title.replace(`${section.id}. `, '')}
              </h2>
              <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 2.1, whiteSpace: 'pre-line' }}>
                {section.content}
              </div>
            </div>
          ))}

          {/* Certifications */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 14, padding: 24, marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 18, textAlign: 'center' }}>
              Certifications & Compliance
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { icon: '🛡', title: 'SSL Secured', desc: '256-bit TLS encryption on all connections', color: '#3fb950' },
                { icon: '✅', title: 'KYC Verified', desc: 'Identity verification for all users', color: '#0052FF' },
                { icon: '🏦', title: 'AML Certified', desc: 'Anti-money laundering compliance', color: '#C9A84C' },
                { icon: '🔐', title: 'GDPR Compliant', desc: 'European data protection standards', color: '#7B2BF9' },
                { icon: '💎', title: 'SOC 2 Type II', desc: 'Security & availability certified', color: '#00B386' },
                { icon: '🤖', title: 'AI Powered', desc: 'Proprietary trading algorithm', color: '#F7A600' },
                { icon: '⚖️', title: 'Regulated', desc: 'International financial compliance', color: '#f85149' },
                { icon: '🌍', title: 'Global Operations', desc: '150+ countries supported', color: '#C9A84C' },
              ].map(cert => (
                <div key={cert.title} style={{ background: '#161b22', border: `1px solid ${cert.color}22`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{cert.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: cert.color, marginBottom: 4 }}>{cert.title}</div>
                  <div style={{ fontSize: 10, color: '#484f58', lineHeight: 1.5 }}>{cert.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Final notice */}
          <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 14, padding: 24, marginBottom: 32 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#C9A84C', marginBottom: 12 }}>⚖️ Final Legal Notice</div>
            <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.9 }}>
              These Terms and Conditions constitute the complete and binding legal agreement between you and CapitalMarket Pro Financial Services. By registering, depositing funds, or using any service on this platform, you irrevocably acknowledge that you have read, understood, and agree to be fully bound by all 20 sections of these Terms.
              <br /><br />
              These Terms are effective immediately upon account creation and remain in effect until your account is terminated. CapitalMarket Pro reserves the right to modify these Terms with 30 days advance notice. Continued use after modification constitutes acceptance of the updated Terms.
              <br /><br />
              <strong style={{ color: '#e6edf3' }}>⚠ Risk Warning:</strong> Trading and investing in financial instruments involves substantial risk. You may lose some or all of your invested capital. Only invest funds you can afford to lose. Past performance of our automated system does not guarantee future results.
            </div>
          </div>

          {/* Contact */}
          <div style={{ background: '#0d1117', border: '1px solid #161b22', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 14 }}>Contact & Legal</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'General Support', value: 'support@capitalmarket-pro.com', icon: '💬' },
                { label: 'Legal Department', value: 'legal@capitalmarket-pro.com', icon: '⚖️' },
                { label: 'Website', value: 'capitalmarket-pro.com', icon: '🌍' },
                { label: 'Live Chat', value: 'Available 24/7 in platform', icon: '🔴' },
              ].map(item => (
                <div key={item.label} style={{ background: '#161b22', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: '#484f58', marginBottom: 4 }}>{item.icon} {item.label}</div>
                  <div style={{ fontSize: 12, color: '#C9A84C' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#484f58' }}>
            © 2025 CapitalMarket Pro Financial Services. All Rights Reserved.<br />
            <span style={{ fontSize: 11 }}>Version 3.1 · Effective Date: January 1, 2025 · 20 Sections</span>
          </div>
        </div>
      </div>
    </div>
  )
}