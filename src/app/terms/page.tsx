import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | Myjobhunting.com",
  description: "Terms of Service for using Myjobhunting.com.",
  robots: "index, follow",
  openGraph: {
    title: "Terms of Use | Myjobhunting.com",
    description: "Terms of Service for using Myjobhunting.com.",
    type: "article",
  },
};

export default function TermsOfUsePage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <Link href="/register" className="text-[#0044CC] hover:underline">← Back to Sign Up</Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">Terms of Use / Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Revised: 11th August, 2025.</p>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">1. About Myjobhunting.com</h2>
        <p>
          Myjobhunting.com is a career networking platform with a vision of making job hunting easy and
          seamless for career professionals. Please read our terms of service below if you intend to use our service.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">2. Definitions</h2>
        <p>
          (a) "Service" means user subscription/notification/alert/information/every other services provided by
          Myjobhunting.com
        </p>
        <p>
          (b) "Client" means the person, firm or company using our service.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">3. Basics</h2>
        <p>
          (a) The content of the pages of this website is for your general information and use only. It is subject to
          change without notice.
        </p>
        <p>
          (b) Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness,
          performance, completeness or suitability of the information and materials found or offered on this website
          for any particular purpose.
        </p>
        <p>
          (c) You acknowledge that such information and materials may contain inaccuracies or errors and we
          expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
        </p>
        <p>
          (d) Your use of any information or materials on this website is entirely at your own risk, for which we shall
          not be liable. It shall be your own responsibility to ensure that any products, services or information
          available through this website meet your specific requirements.
        </p>
        <p>
          (e) This website contains material which is owned by or licensed to us. This material includes, but is not
          limited to compiled materials, articles, the logo, design, layout, look, appearance and graphics.
          Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these
          terms and conditions.
        </p>
        <p>
          (f) All trademarks reproduced in this website which are not the property of, or licensed to, the operator is
          acknowledged on the website.
        </p>
        <p>
          (g) Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">4. Application</h2>
        <p>(a) These terms and conditions apply to the provision of service by Myjobhunting.com to the client.</p>
        <p>(b) We do not in any way guarantee you get the jobs sent to you. The company recruiting has the final say.</p>
        <p>
          (c) Our Site contains information from third parties (Advertisers/Employers/Job Seekers), we do not
          guarantee you the authenticity of the information published on our site.
        </p>
        <p>
          (d) We do not bear responsibility any of the jobs/information published on our site or through any third
          party via any means.
        </p>
        <p>(e) We do not guarantee you a specific number of notification/alerts/information per month.</p>
        <p>(f) Notification/alerts/information are published/sent based on availability of Job openings.</p>
        <p>
          (g) We are not responsible for any message undelivered due to unavailability of network service by your
          provider or whatsoever reason.
        </p>
        <p>
          (h) This is an informational service and we don't guarantee you 100% authenticity of vacancies or user
          information.
        </p>
        <p>(i) You have the right to redistribute the service (alerts) we send to you.</p>
        <p>(j) We reserve the right to terminate this service at any time with or without notification to the Client.</p>
        <p>
          (k) We do not in any way certify that users of this service are authentic and we shall not responsible for any
          fraud that may arise from information gotten from this service.
        </p>
        <p>
          (l) Our service may include external links, we do not in any way endorse or bear any responsibility to any
          of the links or information from these links.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">5. Liability</h2>
        <p>
          (a) We shall not be liable for any claim arising out of the performance, non-performance, delay in delivery
          of or defect in the service nor for any special, direct, indirect, economic or consequential loss or damage
          howsoever arising or howsoever caused (including loss of profit or loss of revenue) whether from
          negligence or otherwise in connection with the supply, functioning or use of the Service.
        </p>
        <p>
          (b) We shall not be liable for any claim arising from vacancies by any employer/recruiter/HR personnel,
          information on our site, loss or damage howsoever arising or howsoever caused (including loss of profit or
          loss of revenue) whether from negligence or otherwise in connection with the supply, functioning or use of
          the Service through us or through any of our partners. Any liability of the Company shall in any event be
          limited to the fees paid by the Client directly to us in the year/month in which the event of default arises.
        </p>
        <p>
          (c) Nothing herein shall limit either party's liability for death or personal injury arising from the proven
          negligence by itself or its employees or agents.
        </p>
        <p>
          (d) The Client shall fully indemnify us against any liability to third parties arising out of the Client's use of
          the service.
        </p>
        <p>
          (e) We are not responsible or liable to the Client for any loss or damage suffered by the client as a result of
          usage direct or indirect of the services provided by us.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">6. Site Updates</h2>
        <p>
          From time to time this website may also include links to other websites. These links are provided for your
          convenience to provide further information. They do not signify that we endorse the website(s). We have
          no responsibility for the content of the linked website(s).
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">7. Disclaimer</h2>
        <p>
          (a) Myjobhunting.com is not to be considered to be a HR Personnel/Recruiter/Employer with respect to
          the use of the website and shall not be responsible for any user entering into any agreements or making
          decisions of whatever nature resulting from the jobs, resumes and/or any other information obtained on
          the website.
        </p>
        <p>
          (b) Myjobhunting.com does not warrant that the website will operate error-free or that the website and its
          server are free of computer viruses or other harmful mechanisms. If your use of the website or the material
          results in the need for servicing or replacing equipment or data, Myjobhunting.com will not be responsible
          for those costs or any consequential losses incurred as a result thereof.
        </p>
        <p>
          (c) The website and material are provided on an 'as is' basis without any warranties of whatsoever nature.
          Myjobhunting.com hereby makes no warranties, whether express or implied, including the warranty of
          merchantability, quality, fitness for particular purpose and non-infringement.
        </p>
        <p>
          (d) Myjobhunting.com makes no warranties about the accuracy, reliability, completeness or timeliness of
          the material, services, software, text, graphics and links set out on the website.
        </p>
        <p>
          (e) In no event shall Myjobhunting.com, its suppliers, or any third parties referred to on this website be
          liable for any damages of whatsoever nature, whether for bodily, moral or material injury (including,
          without limitation, indirect, punitive, incidental and consequential damages, lost profits, or damages
          resulting from lost data or business interruption) resulting from the use or inability to use the website and
          the material, whether based on warranty, contractual or extra-contractual liability, or any other legal
          matters, and whether or not Myjobhunting.com is advised of the possibility of such damages.
        </p>
      </section>
      <div className="mt-10">
        <Link href="/register" className="text-[#0044CC] hover:underline">Back to Sign Up</Link>
      </div>
    </main>
  );
}


