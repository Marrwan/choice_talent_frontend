import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Myjobhunting.com",
  description: "Privacy Policy describing how Myjobhunting.com collects and processes personal data.",
  robots: "index, follow",
  openGraph: {
    title: "Privacy Policy | Myjobhunting.com",
    description: "Privacy Policy describing how Myjobhunting.com collects and processes personal data.",
    type: "article",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <Link href="/register" className="text-[#0044CC] hover:underline">← Back to Sign Up</Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">1. Who we are</h2>
        <p>
          Myjobhunting.com is a career networking platform with a vision of making job hunting easy and seamless
          for career professionals.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">2. To whom does this privacy policy apply?</h2>
        <p>
          This privacy policy applies to you if you are a user of our platform as a job seeker or HR/recruiter/employer,
          and sets out how we collect, store, process, transfer, share and use data that identifies or is associated with
          you ('personal data') when you use myjobhunting.com (the 'Site') to access, recruit or apply for job opportunities
          with us or companies in our network. We at myjobhunting.com (hereinafter collectively referred to as 'we', 'us',
          'our' or 'Company') respect your privacy and are committed to protecting it. Please read this policy carefully. By using this
          Site, you agree you have been informed of how we use the personal data we collect.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">3. What information do we collect</h2>
        <p>
          We collect information such as Name, Email, Address, Education details, CV/Resume, Reference information, Phone Number,
          Date of Birth, the URLs of any personal websites you have, your resume in PDF or other file formats, a cover letter, or any
          additional information you wish to include in the application, etc. from you when you register on our site. You may however
          visit the site anonymously.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">4. Generally, we may collect your personal data as follows</h2>
        <p>
          (a) Registration, subscription or application to a job – we will collect personal data that you voluntarily submit to us, such
          as your name and contact details when you register with us as a job seeker, subscribe to job alerts, apply to a job directly on
          this Site, use our Site and our services, or otherwise interact with us;
        </p>
        <p>
          (b) Information request or chat – When you request information or interact with us through any communication channels (chat,
          email, etc) we may collect your contact details (email address, name, your role, name of your company, company sector and
          number of companies) and you may provide additional information.
        </p>
        <p>
          (c) Statistical processing – We may process your data for statistical purposes that allow us to prepare reports, determine how many
          people visit our website and to improve our services. The reports that we generate will only contain aggregated data in a way that does
          not allow the identification of individuals.
        </p>
        <p>
          (d) Automatized processing – When you visit our Site, we may also automatically collect standard logging information and device
          fingerprint data such as the IP address of your device based on our legitimate interest to keep our website secure and prevent
          fraudulent attacks and to infer the uniqueness of users. Some providers may also collect IP addresses in order to provide their services
          and for security reasons.
        </p>
        <p>
          (f) Cookies – Also, through the use of cookies or similar technologies, we collect details of your online behaviour. We will use this data
          to evidence the value of our services, to analyze and improve the browsing experience of users and in order to customize content. By using
          the Site, you consent to our use of cookies as set out in our cookies policy.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">5. What do we use your information for?</h2>
        <p>(a) To personalize your experience</p>
        <p>(b) To enable employers search for and contact you for positions that match your profile.</p>
        <p>(c) To enable you search for and apply for jobs or search jobseekers faster and better.</p>
        <p>(d) To send you periodic updates on our services.</p>
        <p>(e) To administer a survey or contest on our site.</p>
        <p>(f) To improve our customer service (respond to your request easily and faster).</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">6. Third Party Partners</h2>
        <p>
          (a) We use third-party advertising companies to serve ads when you visit our Web site. These companies may use information (not including
          your name, address email address or telephone number) about your visits to this and other Web sites in order to provide advertisements about
          goods and services of interest to you.
        </p>
        <p>
          (b) This site uses a tool which collects your requests for pages and passes elements of them to search engines to assist them in indexing this site.
          We control the configuration of the tool and are responsible for any information sent to the search engines.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">7. For what purposes are we going to process Job Seekers' data?</h2>
        <p>
          (a) We process your personal data to help you to find a job that matches your preferences and to connect you with companies within our network
          for this purpose, using an automated board system that permits us to work efficiently.
        </p>
        <p>
          (b) If you choose to subscribe, we will send you by email, details of jobs that we think you might be interested in with us or companies in our network.
          Your subscription data will only be shared with administrators of the network you’ve subscribed to. We cannot subscribe you to job alerts without the
          minimum mandatory information indicated on the subscription form.
        </p>
        <p>
          (c) We might contact you in order to offer new professional opportunities in the future.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">8. How long will we keep your data for?</h2>
        <p>
          (a) We will continue to process your data until (a) you deactivate your account or (b) until this job network is no longer active.
        </p>
        <p>
          (b) To determine the appropriate retention period for personal data, we consider the amount, nature and sensitivity of the personal data, the potential
          risk of harm from unauthorized use or disclosure of your personal data, the purposes for which we process your personal data and whether we can achieve
          those purposes through other means, as well as the applicable legal, regulatory, tax, accounting or other requirements.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">9. With whom will we share your data?</h2>
        <p>
          (a) We will share your personal data with organizations within our network who may be able to offer employment opportunities that are of interest to you.
          Additionally, we may share your personal data with the following categories of recipients to fulfil the purposes for which we collected the personal data.
        </p>
        <p>
          (b) Service Providers: We provide personal data to our suppliers and other trusted businesses or persons to process it for us, based on our instructions and in
          compliance with our Privacy Policy and any other appropriate confidentiality and security measures. For example, we use service providers to help store your
          data and for maintenance of the job board.
        </p>
        <p>
          (c) Professional advisors: we may share your personal data with our lawyers, accountants, insurers and other professional advisors to the extent we need to
          (for example, to defend ourselves against legal claims).
        </p>
        <p>
          (d) Purchasers and third parties in connection with a business transaction: your personal data may be disclosed to third parties in connection with a transaction,
          such as a merger, sale of assets or shares, re-organization, financing, change of control or acquisition of all or a portion of our business.
        </p>
        <p>
          (e) Law enforcement, regulators and other parties for legal reasons: we may share your personal data with third parties as required by law or if we reasonably believe
          that such action is necessary to (i) comply with the law and the reasonable requests of law enforcement; (ii) detect and investigate illegal activities and breaches of
          agreements; and/or (iii) exercise or protect the rights, property, or personal safety of the brand, myjobhunting.com, their respective users or others.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">10. Marketing</h2>
        <p>
          (a) From time to time we may contact you with information about our services, including for the purposes of sending you marketing messages and asking for your feedback.
        </p>
        <p>
          (b) If you are based in the UK or EEA, we will only send you marketing messages if you have given us your consent to do so, unless consent is not required under applicable
          data protection laws (for example, where we have a pre-existing customer relationship with you). You have the right to opt out of receiving marketing communications at any
          time by contacting us using the contact email or by following the Unsubscribe link where one is included in a communication. We may ask you to confirm or update your
          marketing preferences if you ask us to provide further services in the future, or if there are changes in the law, regulation, or the structure of our business.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">11. Storing and transferring your personal data</h2>
        <p>
          (a) Security: We implement appropriate technical and organizational measures to protect your personal data against accidental or unlawful destruction, loss, change or damage.
          All personal data we collect will be stored on our secure servers. We will never send you unsolicited emails or contact you by phone requesting your account ID, password, bank
          account details or national identification numbers.
        </p>
        <p>
          (b) International Transfers of your Personal data: If you are based in the UK or the EEA, the personal data we collect may be transferred to and stored in countries outside of the UK
          or EEA. These international transfers of your personal data will be made pursuant to appropriate safeguards as provided in the applicable data protection law, such as standard data
          protection clauses adopted by the UK government/European Commission. If you wish to enquire further about the safeguards used, please contact us using the details set out in this privacy policy.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">12. Quality of the data</h2>
        <p>
          (a) As a subscriber on myjobhunting.com, you can update your job preferences by logging into your account to effect the change.
        </p>
        <p>
          (b) We will diligently try to verify the authenticity of said data, reserving, if necessary and without prejudice to taking the corresponding actions, the right not to register/subscribe/process an
          application, or eliminate those users who have provided false or incomplete information. This verification does not imply in any case that we assume responsibility for any loss or damage that may arise
          from the misinterpretation or inaccuracy of the data provided. The user who provides the information is solely responsible for its accuracy.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">13. Children under 14 years old</h2>
        <p>
          (a) We do not process the personal data of children under 14 years of age nor do we direct our contents or information to them. If you are under 14 years of age, please do not give us personal data.
        </p>
        <p>
          (b) Therefore, prior to providing us with your personal data, you guarantee that you are over 14 years of age and that you are entirely responsible for this declaration and for the access and correct use of the
          website subject to the conditions of use and current legislation, both national and international, as well as the principles of good faith, morals and public order, and with the commitment to diligently observe any
          additional instruction that, in relation to such use and access, could be given by us.
        </p>
        <p>
          (c) You may be required by us at any time, so that we can verify your age, to provide a photocopy of your identity document that legally and unambiguously confirms your age. Failure to supply us with this information
          in the term indicated will entitle us to suspend or cancel your profile or any processing of your data. Any abuse or violation of these conditions and, in particular, those that affect minors, must be reported immediately to us.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">14. What rights do you have?</h2>
        <p>In order to control your data, at all times, you have the right to:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>(a) know if your personal data is being processed and, where appropriate, access it</li>
          <li>(b) rectify your personal data if it was inaccurate or incomplete</li>
          <li>(c) require us to delete your data if it is not necessary for the indicated purposes</li>
          <li>(d) require us to limit the processing of your personal data</li>
          <li>(e) oppose the processing of your personal data or withdraw your consent at any time</li>
          <li>
            (f) To do this, you only have to contact us by written communication via email at
            <a className="text-primary underline ml-1" href="mailto:support@myjobhunting.com">support@myjobhunting.com</a>
          </li>
        </ul>
        <p>
          Please note that the above rights are not absolute, and we may be entitled to refuse requests, wholly or partly, where exceptions under the applicable law apply.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">15. Links to Third Party Websites</h2>
        <p>
          We do not assume any responsibility derived from other privacy policies or practices performed by websites that have been accessed through hyperlinks located on this website and that are not managed directly by.
          Therefore, we assume no responsibility in relation to the information contained in the websites of third parties or the consequences that may arise derived from such information. If any user observes that such links are
          contrary to law, morality and public order, you must inform us by sending an email on our contact page.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">16. Modifications</h2>
        <p>
          We may modify this policy at any time to reflect changes in our practices or law. And you should review the policy regularly before using the Site. If a user is not satisfied with the changes, they must desist in the use
          of this website. The use of this website after the changes implies the acceptance of the same by the user.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">17. Terms and Conditions</h2>
        <p>
          Please refer to our terms and conditions section at <a className="text-primary underline" href="https://myjobhunting.com/terms">https://myjobhunting.com/terms</a>
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">18. Your Consent</h2>
        <p>By using our site, you consent to our privacy policy</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">19. Changes to our Privacy Policy</h2>
        <p>
          If we decide to change our privacy policy, we will post those changes on this page. This policy was last modified on the 11th August 2025.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">20. Unsubscription</h2>
        <p>
          If you want to cancel your subscription, you can do so in a simple way by logging into your account to deactivate your account.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">21. Contacting us</h2>
        <p>
          If there are any questions regarding this privacy policy you may contact us via
          <a className="text-primary underline ml-1" href="mailto:support@myjobhunting.com">support@myjobhunting.com</a>
        </p>
      </section>
      <div className="mt-10">
        <Link href="/register" className="text-[#0044CC] hover:underline">Back to Sign Up</Link>
      </div>
    </main>
  );
}


