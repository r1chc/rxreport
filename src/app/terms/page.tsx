import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for RxReport — the rules and limitations governing your use of our website.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14 pb-32">
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a3c34' }}>Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: January 1, 2026</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-8">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using rxreport.com (the "Site"), operated by RxReport LLC ("RxReport," "we," "us," or "our"),
            you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not
            use the Site. These Terms apply to all visitors and users of the Site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of Service</h2>
          <p>
            RxReport provides a publicly accessible interface for viewing drug adverse event data sourced from the U.S.
            Food and Drug Administration's Adverse Event Reporting System (FAERS) via the openFDA API. The Site presents
            this publicly available government data in a visualized, searchable format for educational and informational purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Not Medical Advice</h2>
          <p>
            <strong>THE INFORMATION ON THIS SITE IS NOT MEDICAL ADVICE AND IS NOT A SUBSTITUTE FOR PROFESSIONAL
            MEDICAL JUDGMENT, DIAGNOSIS, OR TREATMENT.</strong>
          </p>
          <p className="mt-3">
            All data displayed on the Site comes from the FDA Adverse Event Reporting System (FAERS). Adverse event
            reports are submitted voluntarily by healthcare professionals, patients, and manufacturers and do not
            establish that a drug caused or contributed to any adverse outcome. The presence of a drug in the FAERS
            database or the listing of an adverse event does not mean the drug is dangerous, ineffective, or
            inappropriate for any particular patient.
          </p>
          <p className="mt-3">
            You should always consult a qualified healthcare professional before making any decisions about medications,
            treatments, or medical conditions. Never disregard professional medical advice or delay seeking it because
            of information you read on this Site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Data Accuracy and Limitations</h2>
          <p>
            RxReport makes no representations or warranties about the completeness, accuracy, or reliability of the
            data displayed on the Site. The underlying FAERS data has known limitations, including but not limited to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Voluntary, self-reported nature of adverse event submissions</li>
            <li>Possible duplicate reports for the same event</li>
            <li>Incomplete or inconsistent data fields in source records</li>
            <li>Reporting biases that may over- or under-represent certain events</li>
            <li>Inability to establish causation between a drug and a reported event</li>
          </ul>
          <p className="mt-3">
            Data is refreshed periodically (approximately weekly) but may not reflect the most current information
            available from the FDA. The FDA FAERS database is the authoritative source and should be consulted
            directly for regulatory or research purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Permitted Use</h2>
          <p>You may use the Site for lawful, personal, educational, or research purposes. You agree not to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Use the Site in any way that violates applicable federal, state, local, or international laws or regulations</li>
            <li>Systematically scrape, crawl, or harvest data from the Site in a manner that places undue load on our servers</li>
            <li>Attempt to gain unauthorized access to any portion of the Site or its related systems</li>
            <li>Use the Site to transmit any unsolicited commercial communication</li>
            <li>Misrepresent the source or nature of data obtained from the Site</li>
            <li>Use automated tools to access the Site at a rate that exceeds reasonable human browsing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
          <p>
            The Site's design, layout, branding, and original content (excluding the underlying FDA data, which is
            U.S. government public domain data) are owned by RxReport LLC and protected by applicable copyright,
            trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative
            works from our proprietary Site content without our express written permission.
          </p>
          <p className="mt-3">
            The underlying FDA FAERS data displayed on the Site is U.S. government data and is in the public domain.
            RxReport's visualizations and presentation of that data are protected by copyright.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Third-Party Links and Content</h2>
          <p>
            The Site may contain links to third-party websites or services. These links are provided for convenience only.
            RxReport has no control over the content or practices of third-party sites and is not responsible for any
            damages or losses arising from your use of those sites. Linking to a third-party site does not imply
            endorsement by RxReport.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Advertising</h2>
          <p>
            The Site displays advertisements served by Google AdSense and potentially other advertising networks.
            RxReport is not responsible for the content of advertisements, the products or services they promote,
            or any transactions you enter into as a result of clicking an advertisement. The display of an advertisement
            on the Site does not constitute an endorsement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
          <p>
            THE SITE AND ALL CONTENT AND SERVICES PROVIDED THROUGH IT ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE"
            BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW,
            RXREPORT DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, AND NON-INFRINGEMENT.
          </p>
          <p className="mt-3">
            WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, RXREPORT LLC AND ITS OFFICERS, DIRECTORS, EMPLOYEES,
            AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF, OR INABILITY TO USE, THE SITE OR ITS CONTENT,
            EVEN IF RXREPORT HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p className="mt-3">
            IN NO EVENT SHALL RXREPORT'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SITE
            EXCEED ONE HUNDRED DOLLARS ($100.00). SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF
            CERTAIN DAMAGES, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless RxReport LLC and its officers, directors, employees,
            and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable
            attorney's fees) arising out of or in connection with your use of the Site, your violation of these Terms,
            or your violation of any rights of a third party.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of the United States and the State
            of Delaware, without regard to its conflict of law provisions. Any dispute arising from these Terms or
            your use of the Site shall be resolved exclusively through binding arbitration under the rules of the
            American Arbitration Association, except that either party may seek injunctive or equitable relief in
            any court of competent jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Changes to These Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be posted on this page with an
            updated "Last updated" date. Your continued use of the Site after changes are posted constitutes your
            acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Contact Us</h2>
          <p>
            If you have questions about these Terms, please contact us at:
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
