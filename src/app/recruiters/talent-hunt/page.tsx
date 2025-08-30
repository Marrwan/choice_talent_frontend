"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { recruiterService } from '@/services/recruiterService';
import { useToast } from '@/lib/useToast';

type Step = 'about' | 'company' | 'job' | 'results' | 'shortlist';

export default function TalentHuntPage() {
  const router = useRouter();
  const { showError } = useToast();
  const [step, setStep] = useState<Step>('about');
  const [loading, setLoading] = useState(false);
  const [companyExists, setCompanyExists] = useState(false);
  const [company, setCompany] = useState<any | null>(null);

  // Company form
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [workforceSize, setWorkforceSize] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [about, setAbout] = useState('');

  // Job form (mirror recruitment)
  const [position, setPosition] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState<string>('');
  const [careerCategory, setCareerCategory] = useState<string>('');
  const [categoryOfPosition, setCategoryOfPosition] = useState<string>('');
  const [totalYearsExperience, setTotalYearsExperience] = useState('');
  const [workCity, setWorkCity] = useState('');
  const [workCountry, setWorkCountry] = useState('');

  // Results
  const [results, setResults] = useState<any[]>([]);
  const [filterText, setFilterText] = useState('');
  // Filters section (defaults from job form)
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterJobType, setFilterJobType] = useState<string>('');
  const [filterMinExp, setFilterMinExp] = useState<string>('');
  const [filterCareerCats, setFilterCareerCats] = useState<string[]>([]);
  const [filterPosition, setFilterPosition] = useState<string>('');
  const [filterDescription, setFilterDescription] = useState<string>('');
  const [filterCategoryOfPosition, setFilterCategoryOfPosition] = useState<string>('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Always follow normal flow - check company profile
        const res = await recruiterService.getProfile();
        if (res?.success && res.data?.profile) {
          setCompanyExists(true);
          setCompany(res.data.profile);
        } else {
          setCompanyExists(false);
          setCompany(null);
        }
      } finally { setLoading(false); }
    })();
  }, []);

  const handleProceedFromAbout = () => {
    setStep('company');
  };

  const saveCompany = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('companyName', companyName);
      if (industry) form.append('industry', industry);
      if (location) form.append('location', location);
      if (contactEmail) form.append('contactEmail', contactEmail);
      if (contactPhone) form.append('contactPhone', contactPhone);
      if (website) form.append('website', website);
      if (workforceSize) form.append('workforceSize', workforceSize);
      if (logoFile) form.append('logo', logoFile);
      if (about) form.append('about', about);
      const res = await recruiterService.saveProfileForm(form);
      if ((res as any).success) {
        setCompanyExists(true);
        setCompany((res as any).data?.profile || null);
        setStep('job');
      }
    } finally { setLoading(false); }
  };

  const getMatches = async () => {
    setLoading(true);
    try {
      // Search for matches based on job criteria
      const res = await recruiterService.search({
        position: filterPosition || position,
        description: filterDescription || description,
        location: filterLocation || (isRemote ? undefined : (jobLocation || undefined)),
        categories: (filterCategoryOfPosition || categoryOfPosition) ? [filterCategoryOfPosition || categoryOfPosition] : undefined,
        jobTypes: (filterJobType || jobType) ? [filterJobType || jobType] : undefined,
        careerCategories: (filterCareerCats.length > 0 ? filterCareerCats[0] : (careerCategory || undefined)),
        minExperience: filterMinExp ? Number(filterMinExp) : (totalYearsExperience ? Number(totalYearsExperience) : undefined)
      });
      if (res.success) {
        setResults(res.data.results || []);
        setStep('results');
      }
    } catch (error) {
      console.error('Error finding matches:', error);
      showError('Failed to find matches');
    } finally { setLoading(false); }
  };

  const shortlist = async (userId: string) => {
    await recruiterService.shortlist(userId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {step === 'about' && (
        <div className="max-w-3xl mx-auto px-4 pb-8">
          <NavigationHeader title="Talent Hunt" />
          
          <Card>
            <CardHeader>
              <CardTitle>About Talent Hunt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-800">
              <p>
                Finding top talents just got easier and better. As a recruiter, employer or HR personnel, you can now source quality career professionals who make great additions to your team.
              </p>

              <div>
                <div className="font-semibold mb-1">Benefits</div>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Use simple tools to simplify complex recruitment procedures.</li>
                  <li>Find and hire onsite, remote and hybrid career professionals.</li>
                  <li>Attract great people to help grow your business.</li>
                  <li>Manage multiple listings and applications with ease.</li>
                  <li>Improve your recruitment and talent hiring results.</li>
                  <li>Conclude your recruitment process in record time.</li>
                  <li>Administer and review pre-interview assessment tests.</li>
                  <li>Keep the hiring process information-open and available.</li>
                  <li>Notify followers and non-followers of your company page.</li>
                </ul>
              </div>

              <div className="pt-2">
                <Button onClick={handleProceedFromAbout} disabled={loading}>
                  {loading ? 'Checking company page...' : 'Proceed'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'company' && (
        <div className="max-w-3xl mx-auto px-4 pb-8">
          <NavigationHeader title="Company Profile" />
          
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Review your company page or create one to continue.</CardDescription>
            </CardHeader>
          <CardContent className="space-y-6">
            {companyExists && company ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Company:</span> <span className="font-medium">{company.companyName}</span></div>
                  <div><span className="text-gray-500">Industry:</span> <span className="font-medium">{company.industry || '—'}</span></div>
                  <div><span className="text-gray-500">Location:</span> <span className="font-medium">{company.location || '—'}</span></div>
                  <div><span className="text-gray-500">Website:</span> <span className="font-medium">{company.website || '—'}</span></div>
                  <div><span className="text-gray-500">Workforce Size:</span> <span className="font-medium">{company.workforceSize || '—'}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{company.contactEmail || '—'}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{company.contactPhone || '—'}</span></div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-500 mb-1">About</div>
                  <div className="whitespace-pre-wrap">{company.about || '—'}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={()=>setStep('about')}>Back</Button>
                  <Button onClick={()=>setStep('job')}>Proceed to Job Details</Button>
                  <Button variant="outline" onClick={()=>router.push('/recruiters/profile')}>Edit Company Page</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-xl">
                <Input placeholder="Company/Organization name" value={companyName} onChange={(e)=>setCompanyName(e.target.value)} />
                <Input placeholder="Industry" value={industry} onChange={(e)=>setIndustry(e.target.value)} />
                <Input placeholder="Location" value={location} onChange={(e)=>setLocation(e.target.value)} />
                <Input placeholder="Contact email" value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)} />
                <Input placeholder="Contact phone" value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} />
                <Input placeholder="Website" value={website} onChange={(e)=>setWebsite(e.target.value)} />
                <Input placeholder="Workforce size" value={workforceSize} onChange={(e)=>setWorkforceSize(e.target.value)} />
                <Textarea placeholder="About company (description)" value={about} onChange={(e)=>setAbout(e.target.value)} className="min-h-[120px]" />
                <div>
                  <label className="text-sm text-gray-600">Company Logo</label>
                  <input type="file" accept="image/*" onChange={(e)=> setLogoFile(e.target.files?.[0] || null)} className="block mt-1" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={()=>setStep('about')}>Back</Button>
                  <Button onClick={saveCompany} disabled={loading || !companyName}>{loading ? 'Saving...' : 'Save & Continue'}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      )}

      {step === 'job' && (
        <div className="max-w-3xl mx-auto px-4 pb-8">
          <NavigationHeader title="Job Details" />
          
          <Card>
            <CardHeader>
              <CardTitle>Job details</CardTitle>
            </CardHeader>
          <CardContent className="space-y-3 max-w-xl">
            <Input placeholder="Position" value={position} onChange={(e)=>setPosition(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isRemote} onChange={(e)=>setIsRemote(e.target.checked)} />
              Remote position
            </label>
            {!isRemote && (
              <Input placeholder="Job location (address)" value={jobLocation} onChange={(e)=>setJobLocation(e.target.value)} />
            )}
            <Textarea placeholder="Job description" value={description} onChange={(e)=>setDescription(e.target.value)} className="min-h-[160px]" />
            <div>
              <label className="block text-sm text-gray-600 mb-1">Job Type</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={jobType} onChange={(e)=>setJobType(e.target.value)}>
                <option value="">Select job type</option>
                <option>Remote Job</option>
                <option>Freelance Job</option>
                <option>Part time Job</option>
                <option>Full time job</option>
                <option>Contract Job</option>
                <option>Volunteer Job</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Career Category</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={careerCategory} onChange={(e)=>setCareerCategory(e.target.value)}>
                <option value="">Select career category</option>
                <option>Undergraduate Internship</option>
                <option>Graduate Trainee / Interns</option>
                <option>Entry-Level</option>
                <option>Intermediate Level</option>
                <option>Experienced Level</option>
                <option>Senior Level</option>
                <option>Supervisory Level</option>
                <option>Management Level</option>
                <option>Executive Level</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category of Position</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={categoryOfPosition} onChange={(e)=>setCategoryOfPosition(e.target.value)}>
                <option value="">Select category of position</option>
                <option>Accounting / Auditing / Bookkeeping / Budgetting / Finance / Lending / Tax</option>
                <option>Administration / Secretarial / Personal Assistant (PA) / Clerical / Office Assistant</option>
                <option>Advertising / Branding / Public Relation (PR)</option>
                <option>Agriculture / Agro-Allied / Farming</option>
                <option>Architectural / Interior and Exterior Designing / Surveying</option>
                <option>Artisan / Labour / Factory Work / Craftsmen / Vocational / Semi-Skilled</option>
                <option>Arts / Craft / Art Creatives</option>
                <option>Automobile Services / Auto Painting / Auto Mechanic / Auto Electrician / Auto Panel Beater / Auto Upholstery</option>
                <option>Aviation / Airline Services / Air Hostess / Pilot / Captain / Aircraft Engineer</option>
                <option>Beauty / Beauty Care / Make-up / Hair Stylist / Pedicure / Manicure / Masseuse</option>
                <option>Biological Sciences - Biochemistry / Microbiology / Plant Science / Environmental</option>
                <option>Caregiver / Nanny / Domestic Help</option>
                <option>Cashiers / Tellers / Ticketing</option>
                <option>Chaplain / Pastoral / Reverend / Ministration</option>
                <option>Coaching / Mentoring / Change Management / Development / Training / Learning / Public Speaking</option>
                <option>Computer / Cloud Computing / Data Warehousing / Amazon Web Services (AWS)</option>
                <option>Computer / Database Support / Database Admin / Database Development / Oracle / MySQL</option>
                <option>Computer / Frontend Design / UI / UX / Frontend Scripting / JavaScript / React / JQuery</option>
                <option>Computer / Full Stack Software Development / Frontend & Backend / Web Design & Development</option>
                <option>Computer / Graphics Design / Artist</option>
                <option>Computer / Mobile App Development / Android / IOS / Games / React Native / Flutter</option>
                <option>Computer / Network & Hardware Engineering Support / Network Design and Security</option>
                <option>Computer / System Admin / Software Support / Windows Admin / Linux Admin</option>
                <option>Computer / Software Development / Software Testing / SaaS Development / Cloud Management / Analytics Development</option>
                <option>Computer Networking / Telecommunications / Mast Operations / Cybersecurity / Data Recovery / Home Networking</option>
                <option>Consulting / Business Strategy / Planning</option>
                <option>Cook / Chef / Baker / Pastry Chef / Steward</option>
                <option>Customer Service / Call Centre / Front Desk / Receptionist</option>
                <option>Data Entry / Data Reporting / Analysis / Business Analysis</option>
                <option>Design Creatives / 3D Design / Ad Design / Animation / Graphics / Prints / Visuals / Packaging</option>
                <option>Digital Marketing / Social Media Management</option>
                <option>Driving / Haulage / Dispatch Rider / Bike Rider / Chauffeur</option>
                <option>Economics / Statistics / Data Science</option>
                <option>Education - Higher Institution / Teaching / Lecturing / Training</option>
                <option>Education - Non-Academic / Registrar / Bursary / Admin / Librarian</option>
                <option>Education - Sec/Pri/Creche / Teaching / Tutoring / Creche Services</option>
                <option>Election Personnel / Ad-hoc Officers</option>
                <option>Engineering - Biomedical Engineering</option>
                <option>Engineering - Chemical / Petroleum / Petrochemical</option>
                <option>Engineering - Civil / Construction / Building</option>
                <option>Engineering - Electrical / Electronics / Telecom</option>
                <option>Engineering - Mechanical / Metallurgical / Mechatronics</option>
                <option>Environmental Services</option>
                <option>Executive / Top Management</option>
                <option>Facility Management / Estate Management / Maintenance / Real Estate</option>
                <option>Fashion Design / Beauty Care / Make-up / Tailoring / Hair Stylist / Bead Making / Shoe Making</option>
                <option>Food & Nutrition / Dietetics / Food Technology</option>
                <option>Furniture Design / Carpentry</option>
                <option>Graduate Trainee / Fresh Graduate / Graduate Internship</option>
                <option>Horticulture / Beautification / Gardening</option>
                <option>Hospitality / Travel & Tourism / Hotel / Restaurant / Catering / Museum / Club / Bar / Tour Guide</option>
                <option>House Keeping / Cleaning / Deep Cleaning / Drycleaning / Fumigation / Janitorial / Laundry</option>
                <option>HSE / Safety & Risk Management / Compliance</option>
                <option>Human Resources / Recruitment</option>
                <option>Insurance / Assurance / Actuary</option>
                <option>Internship / SIWES / Industrial Training</option>
                <option>Language Translation / Transcribing / Interpreting</option>
                <option>Law / Legal / Litigation</option>
                <option>Logistics / Procurement / Purchasing / Supply Chain</option>
                <option>Maritime Services / Shipping / Clearing & Forwarding / Marine Officer / Seamen</option>
                <option>Marketing / Sales / Business Development / Merchandiser</option>
                <option>Media / Broadcasting / Journalism / Content Writing / Editing / Blogging</option>
                <option>Medical - Anatomy / Physiology / Pathology / Basic Medical Science</option>
                <option>Medical - Dental / ENT</option>
                <option>Medical - Health Information / Medical Records / Health Management</option>
                <option>Medical - Nursing & Midwifery</option>
                <option>Medical - Optometrist / Ophthalmologist</option>
                <option>Medical - Pharmaceutical</option>
                <option>Medical - Physician / Medical Officer / Doctor / Consultants / Medical Internship</option>
                <option>Medical - Physiotherapy / Massage Therapy / Masseuse / Masseur</option>
                <option>Medical - Public Health Worker / Hospital Attendant / Orderly</option>
                <option>Medical - Veterinary Medicine</option>
                <option>Medical Laboratory / Radiography / Sonography</option>
                <option>Modelling / Ushering Services / Runway Services</option>
                <option>Monitoring and Evaluation / Social Worker</option>
                <option>Multimedia / Animation / Film Production / Photography / Cinematography / Video & Audio Editing</option>
                <option>Music Entertainment / Comedy / Disc Jockey (DJ) / Master of Ceremony (MC) / Events / Sound Engineering</option>
                <option>Operations / Project Management</option>
                <option>Physical Sciences - Chemistry / Physics / Geography / Earth Science (Geology) / Material Science / Astronomy</option>
                <option>Political Consulting / Policitical Advisory / Special Assistant</option>
                <option>Psychology / Clinical Psychology</option>
                <option>Quality Assurance (QA) / Quality Control (QC)</option>
                <option>Remote / Freelance / Work at home</option>
                <option>Research / Survey</option>
                <option>Scholarship / Grant / Competition</option>
                <option>Security - Guard / Gateman</option>
                <option>Security - Military / Police / Civil Defense / Para-Military</option>
                <option>Security - Professional / Public / Corporate Security Management</option>
                <option>Sports / Fitness / Fitness Coach / Gym Instructor / Nutritionist / Weightloss</option>
                <option>Store-Keeping & Warehousing</option>
                <option>Technician - Electrical / Electrician</option>
                <option>Technician - Fitter / Plumber / Welder / Panel Beater / Scaffolder</option>
                <option>Technician - Mechanical / Mechanic / Generator Technician</option>
                <option>Tender / Bid / Quotation / Proposal / Expression of Interest</option>
                <option>Waiter / Waitress / Concierge / Room Attendant</option>
              </select>
            </div>
            <Input placeholder="Total Years of Work Experience" type="number" value={totalYearsExperience} onChange={(e)=>setTotalYearsExperience(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input placeholder="Work Location - City" value={workCity} onChange={(e)=>setWorkCity(e.target.value)} />
              <Input placeholder="Work Location - Country" value={workCountry} onChange={(e)=>setWorkCountry(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setStep('company')}>Back</Button>
              <Button onClick={getMatches} disabled={loading || !position || !description}>{loading ? 'Matching...' : 'Find Matches'}</Button>
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {step === 'results' && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <NavigationHeader title="Matching Profiles" />
          
          <Card>
            <CardHeader>
              <CardTitle>Matching Profiles</CardTitle>
              <CardDescription>Refine results and shortlist candidates</CardDescription>
            </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <Input placeholder="Position" value={filterPosition} onChange={(e)=>setFilterPosition(e.target.value)} />
                <Input placeholder="Job description" value={filterDescription} onChange={(e)=>setFilterDescription(e.target.value)} />
                <select className="w-full border rounded px-3 py-2 text-sm" value={filterCategoryOfPosition} onChange={(e)=>setFilterCategoryOfPosition(e.target.value)}>
                  <option value="">Category of Position (any)</option>
                  <option>Accounting / Auditing / Bookkeeping / Budgetting / Finance / Lending / Tax</option>
                  <option>Administration / Secretarial / Personal Assistant (PA) / Clerical / Office Assistant</option>
                  <option>Advertising / Branding / Public Relation (PR)</option>
                  <option>Agriculture / Agro-Allied / Farming</option>
                  <option>Architectural / Interior and Exterior Designing / Surveying</option>
                  <option>Artisan / Labour / Factory Work / Craftsmen / Vocational / Semi-Skilled</option>
                  <option>Arts / Craft / Art Creatives</option>
                  <option>Automobile Services / Auto Painting / Auto Mechanic / Auto Electrician / Auto Panel Beater / Auto Upholstery</option>
                  <option>Aviation / Airline Services / Air Hostess / Pilot / Captain / Aircraft Engineer</option>
                  <option>Beauty / Beauty Care / Make-up / Hair Stylist / Pedicure / Manicure / Masseuse</option>
                  <option>Biological Sciences - Biochemistry / Microbiology / Plant Science / Environmental</option>
                  <option>Caregiver / Nanny / Domestic Help</option>
                  <option>Cashiers / Tellers / Ticketing</option>
                  <option>Chaplain / Pastoral / Reverend / Ministration</option>
                  <option>Coaching / Mentoring / Change Management / Development / Training / Learning / Public Speaking</option>
                  <option>Computer / Cloud Computing / Data Warehousing / Amazon Web Services (AWS)</option>
                  <option>Computer / Database Support / Database Admin / Database Development / Oracle / MySQL</option>
                  <option>Computer / Frontend Design / UI / UX / Frontend Scripting / JavaScript / React / JQuery</option>
                  <option>Computer / Full Stack Software Development / Frontend & Backend / Web Design & Development</option>
                  <option>Computer / Graphics Design / Artist</option>
                  <option>Computer / Mobile App Development / Android / IOS / Games / React Native / Flutter</option>
                  <option>Computer / Network & Hardware Engineering Support / Network Design and Security</option>
                  <option>Computer / System Admin / Software Support / Windows Admin / Linux Admin</option>
                  <option>Computer / Software Development / Software Testing / SaaS Development / Cloud Management / Analytics Development</option>
                  <option>Computer Networking / Telecommunications / Mast Operations / Cybersecurity / Data Recovery / Home Networking</option>
                  <option>Consulting / Business Strategy / Planning</option>
                  <option>Cook / Chef / Baker / Pastry Chef / Steward</option>
                  <option>Customer Service / Call Centre / Front Desk / Receptionist</option>
                  <option>Data Entry / Data Reporting / Analysis / Business Analysis</option>
                  <option>Design Creatives / 3D Design / Ad Design / Animation / Graphics / Prints / Visuals / Packaging</option>
                  <option>Digital Marketing / Social Media Management</option>
                  <option>Driving / Haulage / Dispatch Rider / Bike Rider / Chauffeur</option>
                  <option>Economics / Statistics / Data Science</option>
                  <option>Education - Higher Institution / Teaching / Lecturing / Training</option>
                  <option>Education - Non-Academic / Registrar / Bursary / Admin / Librarian</option>
                  <option>Education - Sec/Pri/Creche / Teaching / Tutoring / Creche Services</option>
                  <option>Election Personnel / Ad-hoc Officers</option>
                  <option>Engineering - Biomedical Engineering</option>
                  <option>Engineering - Chemical / Petroleum / Petrochemical</option>
                  <option>Engineering - Civil / Construction / Building</option>
                  <option>Engineering - Electrical / Electronics / Telecom</option>
                  <option>Engineering - Mechanical / Metallurgical / Mechatronics</option>
                  <option>Environmental Services</option>
                  <option>Executive / Top Management</option>
                  <option>Facility Management / Estate Management / Maintenance / Real Estate</option>
                  <option>Fashion Design / Beauty Care / Make-up / Tailoring / Hair Stylist / Bead Making / Shoe Making</option>
                  <option>Food & Nutrition / Dietetics / Food Technology</option>
                  <option>Furniture Design / Carpentry</option>
                  <option>Graduate Trainee / Fresh Graduate / Graduate Internship</option>
                  <option>Horticulture / Beautification / Gardening</option>
                  <option>Hospitality / Travel & Tourism / Hotel / Restaurant / Catering / Museum / Club / Bar / Tour Guide</option>
                  <option>House Keeping / Cleaning / Deep Cleaning / Drycleaning / Fumigation / Janitorial / Laundry</option>
                  <option>HSE / Safety & Risk Management / Compliance</option>
                  <option>Human Resources / Recruitment</option>
                  <option>Insurance / Assurance / Actuary</option>
                  <option>Internship / SIWES / Industrial Training</option>
                  <option>Language Translation / Transcribing / Interpreting</option>
                  <option>Law / Legal / Litigation</option>
                  <option>Logistics / Procurement / Purchasing / Supply Chain</option>
                  <option>Maritime Services / Shipping / Clearing & Forwarding / Marine Officer / Seamen</option>
                  <option>Marketing / Sales / Business Development / Merchandiser</option>
                  <option>Media / Broadcasting / Journalism / Content Writing / Editing / Blogging</option>
                  <option>Medical - Anatomy / Physiology / Pathology / Basic Medical Science</option>
                  <option>Medical - Dental / ENT</option>
                  <option>Medical - Health Information / Medical Records / Health Management</option>
                  <option>Medical - Nursing & Midwifery</option>
                  <option>Medical - Optometrist / Ophthalmologist</option>
                  <option>Medical - Pharmaceutical</option>
                  <option>Medical - Physician / Medical Officer / Doctor / Consultants / Medical Internship</option>
                  <option>Medical - Physiotherapy / Massage Therapy / Masseuse / Masseur</option>
                  <option>Medical - Public Health Worker / Hospital Attendant / Orderly</option>
                  <option>Medical - Veterinary Medicine</option>
                  <option>Medical Laboratory / Radiography / Sonography</option>
                  <option>Modelling / Ushering Services / Runway Services</option>
                  <option>Monitoring and Evaluation / Social Worker</option>
                  <option>Multimedia / Animation / Film Production / Photography / Cinematography / Video & Audio Editing</option>
                  <option>Music Entertainment / Comedy / Disc Jockey (DJ) / Master of Ceremony (MC) / Events / Sound Engineering</option>
                  <option>Operations / Project Management</option>
                  <option>Physical Sciences - Chemistry / Physics / Geography / Earth Science (Geology) / Material Science / Astronomy</option>
                  <option>Political Consulting / Policitical Advisory / Special Assistant</option>
                  <option>Psychology / Clinical Psychology</option>
                  <option>Quality Assurance (QA) / Quality Control (QC)</option>
                  <option>Remote / Freelance / Work at home</option>
                  <option>Research / Survey</option>
                  <option>Scholarship / Grant / Competition</option>
                  <option>Security - Guard / Gateman</option>
                  <option>Security - Military / Police / Civil Defense / Para-Military</option>
                  <option>Security - Professional / Public / Corporate Security Management</option>
                  <option>Sports / Fitness / Fitness Coach / Gym Instructor / Nutritionist / Weightloss</option>
                  <option>Store-Keeping & Warehousing</option>
                  <option>Technician - Electrical / Electrician</option>
                  <option>Technician - Fitter / Plumber / Welder / Panel Beater / Scaffolder</option>
                  <option>Technician - Mechanical / Mechanic / Generator Technician</option>
                  <option>Tender / Bid / Quotation / Proposal / Expression of Interest</option>
                  <option>Waiter / Waitress / Concierge / Room Attendant</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <Input placeholder="Filter by text..." value={filterText} onChange={(e)=>setFilterText(e.target.value)} />
                <Input placeholder="Location" value={filterLocation} onChange={(e)=>setFilterLocation(e.target.value)} />
                <select className="w-full border rounded px-3 py-2 text-sm" value={filterJobType} onChange={(e)=>setFilterJobType(e.target.value)}>
                  <option value="">Job Type (any)</option>
                  <option>Remote Job</option>
                  <option>Freelance Job</option>
                  <option>Part time Job</option>
                  <option>Full time job</option>
                  <option>Contract Job</option>
                  <option>Volunteer Job</option>
                </select>
                <Input placeholder="Minimum experience (years)" type="number" value={filterMinExp} onChange={(e)=>setFilterMinExp(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Career Category</label>
                <select className="w-full border rounded px-3 py-2 text-sm" value={filterCareerCats[0] || ''} onChange={(e)=>setFilterCareerCats(e.target.value ? [e.target.value] : [])}>
                  <option value="">Career Category (any)</option>
                  <option>Undergraduate Internship</option>
                  <option>Graduate Trainee / Interns</option>
                  <option>Entry-Level</option>
                  <option>Intermediate Level</option>
                  <option>Experienced Level</option>
                  <option>Senior Level</option>
                  <option>Supervisory Level</option>
                  <option>Management Level</option>
                  <option>Executive Level</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={()=>setStep('job')}>Back</Button>
                <Button onClick={getMatches} disabled={loading}>{loading ? 'Searching...' : 'Apply Filters'}</Button>
                <Button variant="outline" onClick={()=>{ setFilterLocation(''); setFilterJobType(''); setFilterMinExp(''); setFilterCareerCats([]); setFilterText(''); setFilterPosition(''); setFilterDescription(''); setFilterCategoryOfPosition(''); }}>Reset</Button>
                <Button variant="outline" onClick={()=>setStep('shortlist')}>Manage Shortlist</Button>
                <Button variant="outline" onClick={()=>router.push('/dashboard')}>Back to Dashboard</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.filter(r => !filterText || ((r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : r.user?.name) || '').toLowerCase().includes(filterText.toLowerCase())).map((r:any) => (
                <Card key={r.id}>
                  <CardHeader>
                                          <CardTitle className="text-base">{r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : r.user?.name || 'Professional'}</CardTitle>
                    <CardDescription>{r.persona || r.professionalSummary?.slice(0, 100) || ''}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-gray-600">Location: {r.stateOfResidence || r.jobHuntingSettings?.preferredLocations?.[0] || 'N/A'}</div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={()=>shortlist(r.userId || r.user?.id)}>Shortlist</Button>
                      <Button size="sm" variant="outline" onClick={()=>window.open(`/dashboard/professional-career-profile/view?id=${r.userId || r.user?.id}`, '_blank')}>View Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {results.length === 0 && <div className="text-gray-500">No results found.</div>}
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {step === 'shortlist' && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <NavigationHeader title="Shortlisted Candidates" />
          <ShortlistManager onBack={()=>setStep('results')} />
        </div>
      )}
    </div>
  );
}

function ShortlistManager({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await recruiterService.listShortlist();
      if ((res as any).success) setItems((res as any).data.items || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Shortlisted</CardTitle>
          <CardDescription>Remove or schedule interviews</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Back to Results</Button>
          <Button variant="outline" onClick={()=>window.location.href='/dashboard'}>Back to Dashboard</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((it:any) => (
              <Card key={it.id}>
                <CardHeader>
                  <CardTitle className="text-base">{it.candidate?.name || 'Candidate'}</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={async ()=>{ await recruiterService.removeShortlist(it.candidate?.id); load(); }}>Remove</Button>
                  <Button size="sm" variant="outline" onClick={()=>window.open(`/recruiters/interviews?candidateId=${it.candidate?.id}`, '_self')}>Schedule Interview</Button>
                </CardContent>
              </Card>
            ))}
            {items.length === 0 && <div className="text-gray-500">No shortlisted candidates yet.</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


