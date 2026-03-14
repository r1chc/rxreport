import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for RxReport — how we handle your data and protect your privacy.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14 pb-32">
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a3c34' }}>Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: January 1, 2026</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-8">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Overview</h2>
          <p>
            RxReport LLC ("RxReport," "we," "us," or "our") operates the website located at rxreport.com (the "Site").
            This Privacy Policy explains what information we collect, how we use it, and your rights with respect to that information.
            By using the Site, you agree to the practices described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
          <h3 className="font-medium text-gray-800 mb-2">2.1 Information You Provide</h3>
          <p>
            RxReport does not require you to create an account or submit any personal information to use the Site.
            We do not collect your name, email address, or any health-related information.
          </p>
          <h3 className="font-medium text-gray-800 mt-4 mb-2">2.2 Automatically Collected Information</h3>
          <p>
            When you visit the Site, certain technical information is automatically collected by our hosting provider and
            analytics tools. This may include:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>IP address (anonymized where possible)</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on each page</li>
            <li>Referring URL</li>
            <li>Date and time of your visit</li>
          </ul>
          <p className="mt-3">
            This information is used solely to maintain the security and performance of the Site and to understand aggregate usage patterns.
            We do not use it to identify individual users.
          </p>
          <h3 className="font-medium text-gray-800 mt-4 mb-2">2.3 Cookies and Tracking Technologies</h3>
          <p>
            The Site uses cookies and similar tracking technologies for two purposes:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Essential cookies:</strong> Required for the Site to function correctly, such as caching and session management.
            </li>
            <li>
              <strong>Advertising cookies:</strong> We use Google AdSense to display advertisements. Google and its partners may use
              cookies to serve ads based on your prior visits to this or other websites. You can opt out of personalized advertising
              by visiting <a href="https://adssettings.google.com" className="underline" style={{ color: '#1a3c34' }} rel="noopener noreferrer" target="_blank">Google's Ad Settings</a>.
            </li>
          </ul>
          <p className="mt-3">
            You can control or disable cookies through your browser settings. Disabling cookies may affect certain functionality of the Site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
          <p>We use the information described above to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Operate, maintain, and improve the Site</li>
            <li>Monitor and analyze usage trends</li>
            <li>Detect and prevent security incidents or abuse</li>
            <li>Serve relevant advertisements through Google AdSense</li>
            <li>Comply with applicable legal obligations</li>
          </ul>
          <p className="mt-3">
            We do not sell, rent, or trade any personal information to third parties for their own marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
          <h3 className="font-medium text-gray-800 mb-2">4.1 openFDA</h3>
          <p>
            All drug adverse event data displayed on the Site is retrieved from the U.S. Food and Drug Administration's
            openFDA API (api.fda.gov). No personal information is transmitted to the FDA when you perform a drug search.
            Your search queries are processed directly by your browser or our servers to retrieve publicly available data.
          </p>
          <h3 className="font-medium text-gray-800 mt-4 mb-2">4.2 Google AdSense</h3>
          <p>
            We use Google AdSense to display advertisements on the Site. Google AdSense may use cookies and web beacons
            to collect information about your visits to this and other websites to provide relevant advertisements.
            Google's use of advertising cookies is governed by Google's Privacy Policy, which can be reviewed at
            {' '}<a href="https://policies.google.com/privacy" className="underline" style={{ color: '#1a3c34' }} rel="noopener noreferrer" target="_blank">policies.google.com/privacy</a>.
          </p>
          <h3 className="font-medium text-gray-800 mt-4 mb-2">4.3 Vercel (Hosting)</h3>
          <p>
            The Site is hosted on Vercel. Vercel may collect server logs and technical access data as part of
            providing hosting services. Vercel's privacy practices are described at vercel.com/legal/privacy-policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data Retention</h2>
          <p>
            We retain server logs for a maximum of 30 days for security and diagnostic purposes, after which they
            are deleted. Aggregate, anonymized analytics data may be retained indefinitely.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Children's Privacy</h2>
          <p>
            The Site is not directed to children under the age of 13. We do not knowingly collect personal information
            from children. If you believe a child has provided personal information to us, please contact us and we will
            promptly delete such information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have rights regarding your personal data, including the right to
            access, correct, or delete information we hold about you. Since we collect minimal personal data,
            most requests can be addressed by adjusting your browser's cookie settings. For any other privacy
            requests, please contact us at the address below.
          </p>
          <p className="mt-3">
            If you are a resident of California, the EU, or another jurisdiction with specific data protection laws,
            additional rights may apply. Please contact us for more information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Security</h2>
          <p>
            We implement industry-standard technical and organizational measures to protect the Site and any
            information we process from unauthorized access, alteration, disclosure, or destruction.
            However, no method of transmission over the internet is 100% secure, and we cannot guarantee
            absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated
            "Last updated" date. Continued use of the Site after changes are posted constitutes your acceptance
            of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <address className="not-italic mt-2 text-gray-600">
            RxReport LLC<br />
            legal@rxreport.com
          </address>
        </section>

      </div>
    </div>
  )
}
