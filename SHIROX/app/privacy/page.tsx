'use client';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="bg-black text-white min-h-screen antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400&display=swap');
        body { font-family: 'Outfit', sans-serif; }
        h1, h2, h3 { font-family: 'Outfit', sans-serif; letter-spacing: -0.03em; }
      `}</style>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 h-[72px] bg-black/80 backdrop-blur-3xl border-b border-white/10 z-[1000] flex items-center">
        <div className="max-w-[900px] mx-auto w-full px-6 md:px-10 flex justify-between items-center">
          <Link href="/" className="text-[1.1rem] tracking-tight text-white flex items-center gap-3 hover:opacity-70 transition-opacity">
            <div className="w-4 h-4 border border-white rounded-full" />
            Creatio
          </Link>
          <span className="text-[0.6rem] text-zinc-600 tracking-[0.3em] uppercase">Privacy Policy</span>
        </div>
      </nav>

      <main className="max-w-[900px] mx-auto px-6 md:px-10 pt-[120px] pb-32">
        {/* Header */}
        <div className="mb-16 border-b border-white/5 pb-12">
          <span className="text-[0.6rem] text-zinc-500 tracking-[0.3em] uppercase mb-4 block">Legal · VYNDRIQ</span>
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] tracking-[-0.04em] leading-[0.95] mb-6">Privacy Policy</h1>
          <p className="text-zinc-500 text-[0.85rem]">
            Effective Date: <span className="text-zinc-400">May 3, 2026</span>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            Last Updated: <span className="text-zinc-400">May 3, 2026</span>
          </p>
          <p className="text-zinc-400 text-[0.9rem] mt-6 leading-relaxed max-w-[640px]">
            This Privacy Policy describes how <strong className="text-white font-normal">VYNDRIQ</strong> ("we", "us", "our") collects, uses, and
            protects your information when you use <strong className="text-white font-normal">Creatio</strong> — an AI-powered content intelligence
            platform operated by VYNDRIQ. Your agreement is with VYNDRIQ, not with the Creatio product name.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-16 text-[0.88rem] leading-relaxed text-zinc-400">

          <Section number="01" title="Information We Collect">
            <p>We collect information you provide directly to us, information generated through your use of the platform, and information from third-party services you connect.</p>
            <ul className="mt-4 space-y-3 list-none">
              <Li><strong className="text-zinc-300 font-normal">Account Data:</strong> Email address, name, and display handle provided at registration via Supabase Auth (Google OAuth or email/password).</Li>
              <Li><strong className="text-zinc-300 font-normal">Usage Data:</strong> Feature usage counts (niche analysis, gap analysis, chat messages, content generations, image generations, trend analysis), timestamps, and session metadata.</Li>
              <Li><strong className="text-zinc-300 font-normal">Content Data:</strong> AI prompts you submit, chat histories, ideas, interests, and marketing content you create within the platform.</Li>
              <Li><strong className="text-zinc-300 font-normal">Payment Data:</strong> Transaction identifiers and subscription tier. We do <em className="text-zinc-300 not-italic">not</em> store raw card numbers — payments are processed by <strong className="text-zinc-300 font-normal">Dodo Payments</strong>.</Li>
              <Li><strong className="text-zinc-300 font-normal">Technical Data:</strong> IP address, browser type, device information, and Next.js application logs for debugging and security purposes.</Li>
            </ul>
          </Section>

          <Section number="02" title="How We Use Your Information">
            <ul className="space-y-3">
              <Li>To provide, maintain, and improve the Creatio platform.</Li>
              <Li>To authenticate your identity and manage your subscription tier (Free, PRO, or LTD).</Li>
              <Li>To enforce usage limits and prevent abuse of the platform.</Li>
              <Li>To send transactional emails (e.g. payment confirmations, account alerts). We do not send marketing emails without explicit consent.</Li>
              <Li>To respond to support requests and improve the product based on aggregate usage patterns.</Li>
              <Li>To comply with applicable legal obligations.</Li>
            </ul>
          </Section>

          <Section number="03" title="Data Storage & Security">
            <p>Your data is stored in <strong className="text-zinc-300 font-normal">Supabase</strong> (PostgreSQL), hosted on infrastructure secured with industry-standard encryption in transit (TLS 1.2+) and at rest (AES-256). Row-Level Security (RLS) policies ensure each user can only access their own data.</p>
            <p className="mt-4">VYNDRIQ limits server-side access to the <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.8rem]">SUPABASE_SERVICE_ROLE_KEY</code> exclusively to backend API routes that require administrative operations (e.g. webhook-triggered tier upgrades). This key is never exposed to the client.</p>
            <p className="mt-4">Despite our efforts, no method of internet transmission or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
          </Section>

          <Section number="04" title="Third-Party Services">
            <p>We use the following third-party services that may process your data under their own privacy policies:</p>
            <ul className="mt-4 space-y-3">
              <Li><strong className="text-zinc-300 font-normal">Supabase</strong> — Authentication and database hosting (<a href="https://supabase.com/privacy" target="_blank" rel="noopener" className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors">supabase.com/privacy</a>).</Li>
              <Li><strong className="text-zinc-300 font-normal">Google Gemini API</strong> — AI content generation. Prompts and responses may be processed by Google's API infrastructure.</Li>
              <Li><strong className="text-zinc-300 font-normal">Dodo Payments</strong> — Payment processing. We share your email and subscription tier selection to initiate a checkout session.</Li>
              <Li><strong className="text-zinc-300 font-normal">Vercel</strong> — Hosting and edge network. Deployment logs may contain IP addresses and request metadata.</Li>
            </ul>
          </Section>

          <Section number="05" title="Cookies & Tracking">
            <p>Creatio uses essential cookies only — specifically, Supabase session tokens stored in <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.8rem]">localStorage</code> and secure HTTP cookies to maintain your authenticated session. We do not use third-party advertising cookies or cross-site tracking.</p>
          </Section>

          <Section number="06" title="Data Retention">
            <p>We retain your account data for as long as your account is active. If you request deletion, we will remove your data from the <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-[0.8rem]">influencers</code> table within 30 days, subject to any legal retention obligations.</p>
            <p className="mt-4">Usage counter resets occur monthly automatically. Chat archives and memory data are retained until you explicitly delete them within the platform or request account deletion.</p>
          </Section>

          <Section number="07" title="Your Rights">
            <p>Depending on your jurisdiction, you may have the following rights:</p>
            <ul className="mt-4 space-y-3">
              <Li><strong className="text-zinc-300 font-normal">Access:</strong> Request a copy of the personal data we hold about you.</Li>
              <Li><strong className="text-zinc-300 font-normal">Rectification:</strong> Correct inaccurate data in your account settings.</Li>
              <Li><strong className="text-zinc-300 font-normal">Erasure:</strong> Request deletion of your account and associated data.</Li>
              <Li><strong className="text-zinc-300 font-normal">Portability:</strong> Request your data in a machine-readable format.</Li>
              <Li><strong className="text-zinc-300 font-normal">Objection:</strong> Object to certain processing activities.</Li>
            </ul>
            <p className="mt-4">To exercise any of these rights, contact us at <a href="mailto:privacy@vyndriq.com" className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors">privacy@vyndriq.com</a> or via our X account <a href="https://x.com/JhaVansh03" target="_blank" rel="noopener" className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors">@JhaVansh03</a>.</p>
          </Section>

          <Section number="08" title="Children's Privacy">
            <p>Creatio is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately and we will delete it.</p>
          </Section>

          <Section number="09" title="Changes to This Policy">
            <p>VYNDRIQ reserves the right to update this Privacy Policy at any time. Material changes will be communicated via the platform or email. Continued use of Creatio after the effective date constitutes acceptance of the updated policy.</p>
          </Section>

          <Section number="10" title="Contact">
            <p>For any privacy-related questions, contact <strong className="text-zinc-300 font-normal">VYNDRIQ</strong>:</p>
            <ul className="mt-4 space-y-2">
              <Li>Email: <a href="mailto:privacy@vyndriq.com" className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors">privacy@vyndriq.com</a></Li>
              <Li>Twitter / X: <a href="https://x.com/JhaVansh03" target="_blank" rel="noopener" className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors">@JhaVansh03</a></Li>
            </ul>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[0.7rem] text-zinc-700">
          <p>© 2026 VYNDRIQ. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-zinc-400 transition-colors">← Back to Creatio</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-4 mb-6">
        <span className="text-[0.6rem] text-zinc-700 tracking-[0.2em] font-mono">{number}</span>
        <h2 className="text-[1.1rem] text-white tracking-tight">{title}</h2>
      </div>
      <div className="pl-8 space-y-3">{children}</div>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="text-zinc-700 mt-[3px] flex-shrink-0">—</span>
      <span>{children}</span>
    </li>
  );
}
