'use client';
import Link from 'next/link';

export default function TermsOfService() {
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
            CreatioX
          </Link>
          <span className="text-[0.6rem] text-zinc-600 tracking-[0.3em] uppercase">Terms of Service</span>
        </div>
      </nav>

      <main className="max-w-[900px] mx-auto px-6 md:px-10 pt-[120px] pb-32">
        {/* Header */}
        <div className="mb-16 border-b border-white/5 pb-12">
          <span className="text-[0.6rem] text-zinc-500 tracking-[0.3em] uppercase mb-4 block">Legal · VYNDRIQ</span>
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] tracking-[-0.04em] leading-[0.95] mb-6">Terms of Service</h1>
          <p className="text-zinc-500 text-[0.85rem]">
            Effective Date: <span className="text-zinc-400">May 3, 2026</span>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            Last Updated: <span className="text-zinc-400">May 3, 2026</span>
          </p>
          <p className="text-zinc-400 text-[0.9rem] mt-6 leading-relaxed max-w-[640px]">
            These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you") and
            <strong className="text-white font-normal"> VYNDRIQ</strong> ("we", "us", "our"), the company that owns and operates
            <strong className="text-white font-normal"> CreatioX</strong>. By accessing or using CreatioX, you agree to be bound by these Terms.
            Your agreement is with <strong className="text-white font-normal">VYNDRIQ</strong>, not with the CreatioX product name.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-16 text-[0.88rem] leading-relaxed text-zinc-400">

          <Section number="01" title="Acceptance of Terms">
            <p>By creating an account, subscribing to a paid plan, or otherwise using CreatioX, you confirm that you are at least 13 years of age (or the age of digital consent in your jurisdiction), that you have the authority to enter into this agreement, and that you accept these Terms in full. If you do not agree, you must not use CreatioX.</p>
          </Section>

          <Section number="02" title="Description of Service">
            <p>CreatioX is an AI-powered content intelligence platform operated by VYNDRIQ that provides the following core capabilities:</p>
            <ul className="mt-4 space-y-3">
              <Li>AI-assisted niche analysis, gap analysis, and trend monitoring.</Li>
              <Li>Automated content generation for social media (threads, posts, scripts).</Li>
              <Li>AI image generation for social media posts.</Li>
              <Li>Direct sync and scheduling to the X (Twitter) platform.</Li>
              <Li>Neural memory and idea management.</Li>
            </ul>
            <p className="mt-4">The platform is provided "as is" and VYNDRIQ reserves the right to modify, suspend, or discontinue any feature at any time with reasonable notice.</p>
          </Section>

          <Section number="03" title="User Accounts">
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must:</p>
            <ul className="mt-4 space-y-3">
              <Li>Provide accurate and complete information during registration.</Li>
              <Li>Not share your account credentials with any third party.</Li>
              <Li>Notify VYNDRIQ immediately of any unauthorized use of your account.</Li>
              <Li>Not create multiple accounts to circumvent usage limits or subscription requirements.</Li>
            </ul>
            <p className="mt-4">VYNDRIQ reserves the right to suspend or terminate accounts that violate these Terms without refund.</p>
          </Section>

          <Section number="04" title="Subscription Plans & Payments">
            <p>CreatioX offers the following subscription tiers, all processed securely via <strong className="text-zinc-300 font-normal">Dodo Payments</strong>:</p>
            <ul className="mt-4 space-y-4">
              <Li>
                <strong className="text-zinc-300 font-normal">PRO — $49/month:</strong> Monthly recurring subscription granting access to all PRO-tier features within the stated monthly usage limits. You may cancel at any time; access continues until the end of the current billing period. No refunds are issued for partial months.
              </Li>
              <Li>
                <strong className="text-zinc-300 font-normal">LTD (Lifetime) — $129 one-time:</strong> A single, non-recurring payment granting permanent access to CreatioX at the current feature set and usage limits. This payment is final and <strong className="text-zinc-300 font-normal">non-refundable</strong> except where required by applicable law. VYNDRIQ will maintain LTD access for a minimum of 3 years from the date of purchase.
              </Li>
            </ul>
            <p className="mt-4">VYNDRIQ reserves the right to adjust pricing for new subscribers at any time. Existing subscribers will not have their rates changed mid-billing-period without at least 30 days' notice.</p>
          </Section>

          <Section number="05" title="Refund Policy">
            <p><strong className="text-zinc-300 font-normal">PRO Monthly:</strong> Refunds are available within <strong className="text-zinc-300 font-normal">7 days</strong> of initial purchase if you have used fewer than 10% of any monthly limit. Contact VYNDRIQ via <a href="mailto:support@vyndriq.com" className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors">support@vyndriq.com</a> within this window.</p>
            <p className="mt-4"><strong className="text-zinc-300 font-normal">LTD Lifetime:</strong> All lifetime purchases are final. No refunds will be issued except where mandated by the consumer protection laws of your jurisdiction.</p>
          </Section>

          <Section number="06" title="Acceptable Use">
            <p>You agree not to use CreatioX to:</p>
            <ul className="mt-4 space-y-3">
              <Li>Generate, distribute, or promote content that is illegal, defamatory, harassing, hateful, or violates third-party intellectual property rights.</Li>
              <Li>Produce spam, coordinated inauthentic behavior, or content designed to manipulate elections or public opinion through deceptive means.</Li>
              <Li>Reverse-engineer, decompile, or attempt to extract source code from the platform.</Li>
              <Li>Circumvent, disable, or interfere with any security or authentication features.</Li>
              <Li>Resell or sublicense access to CreatioX to third parties without written authorization from VYNDRIQ.</Li>
              <Li>Conduct automated scraping or excessive API calls beyond normal usage patterns.</Li>
            </ul>
            <p className="mt-4">VYNDRIQ reserves the right to determine what constitutes a violation of this section in its sole discretion, and may suspend or terminate access immediately without notice for violations.</p>
          </Section>

          <Section number="07" title="AI-Generated Content">
            <p>Content generated by CreatioX's AI systems is provided for informational and creative assistance purposes only. VYNDRIQ makes no representations about the accuracy, completeness, or fitness of AI-generated content for any particular purpose.</p>
            <ul className="mt-4 space-y-3">
              <Li>You are solely responsible for reviewing and validating any AI-generated content before publishing or acting on it.</Li>
              <Li>You own the content you create using the platform, subject to the underlying model providers' usage policies (Google Gemini API).</Li>
              <Li>VYNDRIQ does not claim ownership over your generated content but retains the right to use anonymized, aggregated usage data to improve the service.</Li>
            </ul>
          </Section>

          <Section number="08" title="Usage Limits & Fair Use">
            <p>Each subscription tier carries defined monthly usage limits (e.g. niche analyses, chat messages, content generations). These limits reset on the first day of each calendar month. VYNDRIQ reserves the right to throttle or suspend accounts that systematically abuse the platform or operate in ways inconsistent with normal individual use.</p>
          </Section>

          <Section number="09" title="Intellectual Property">
            <p>The CreatioX platform, including its design, interface, code, trademarks, and brand identity, is the exclusive property of <strong className="text-zinc-300 font-normal">VYNDRIQ</strong>. Nothing in these Terms grants you any right, title, or interest in VYNDRIQ's intellectual property. The "CreatioX" name and all associated marks are owned by VYNDRIQ.</p>
          </Section>

          <Section number="10" title="Disclaimer of Warranties">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CreatioX IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. VYNDRIQ DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.</p>
          </Section>

          <Section number="11" title="Limitation of Liability">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, VYNDRIQ SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING LOSS OF PROFITS, DATA, BUSINESS, OR GOODWILL — ARISING FROM YOUR USE OF OR INABILITY TO USE CreatioX, EVEN IF VYNDRIQ HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
            <p className="mt-4">IN NO EVENT SHALL VYNDRIQ'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID VYNDRIQ IN THE 12 MONTHS PRIOR TO THE CLAIM OR (B) USD $50.</p>
          </Section>

          <Section number="12" title="Governing Law & Disputes">
            <p>These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising from or relating to these Terms or your use of CreatioX shall first be attempted to be resolved informally by contacting VYNDRIQ. If informal resolution fails, disputes shall be subject to binding arbitration on an individual basis. You waive any right to participate in class-action proceedings.</p>
          </Section>

          <Section number="13" title="Modifications to Terms">
            <p>VYNDRIQ reserves the right to modify these Terms at any time. We will provide at least 14 days' notice of material changes via the platform or email. Continued use of CreatioX after the effective date of modified Terms constitutes acceptance. If you disagree with updated Terms, your remedy is to discontinue use and cancel your subscription.</p>
          </Section>

          <Section number="14" title="Termination">
            <p>Either party may terminate this agreement at any time. You may cancel your subscription through your account settings. VYNDRIQ may suspend or terminate your access immediately for cause (e.g. violation of Section 06) or with 30 days' notice without cause. Upon termination, your right to use CreatioX ceases immediately.</p>
          </Section>

          <Section number="15" title="Contact">
            <p>For any questions regarding these Terms, contact <strong className="text-zinc-300 font-normal">VYNDRIQ</strong>:</p>
            <ul className="mt-4 space-y-2">
              <Li>Email: <a href="mailto:legal@vyndriq.com" className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors">legal@vyndriq.com</a></Li>
              <Li>Twitter / X: <a href="https://x.com/JhaVansh03" target="_blank" rel="noopener" className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors">@JhaVansh03</a></Li>
            </ul>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[0.7rem] text-zinc-700">
          <p>© 2026 VYNDRIQ. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-zinc-400 transition-colors">← Back to CreatioX</Link>
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
