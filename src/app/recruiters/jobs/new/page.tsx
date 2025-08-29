'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { jobService } from '@/services/jobService';
import { useToast } from '@/lib/useToast';

export default function NewJobPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [jobType, setJobType] = useState<string>('');
  const [careerCategory, setCareerCategory] = useState<string>('');
  const [categoryOfPosition, setCategoryOfPosition] = useState<string>('');
  const [totalYearsExperience, setTotalYearsExperience] = useState('');
  const [workCity, setWorkCity] = useState('');
  const [workCountry, setWorkCountry] = useState('');

  const handlePublish = async () => {
    if (!position.trim() || !description.trim()) return;
    setSaving(true);
    try {
      const composedWorkLocation = [workCity.trim(), workCountry.trim()].filter(Boolean).join(', ');
      const res = await jobService.create({
        position: position.trim(),
        location: isRemote ? undefined : (location.trim() || undefined),
        isRemote,
        description: description.trim(),
        status: 'published',
        jobType: jobType || undefined,
        careerCategory: careerCategory || undefined,
        categoryOfPosition: categoryOfPosition || undefined,
        totalYearsExperience: totalYearsExperience ? Number(totalYearsExperience) : undefined,
        workLocation: composedWorkLocation || undefined
      });
      if ((res as any).success) {
        showSuccess('Job published successfully', 'Your listing is now live.');
        setTimeout(() => router.push('/recruiters/dashboard'), 600);
      } else {
        showError((res as any).message || 'Failed to publish job', 'Error');
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <NavigationHeader title="Create Job" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
        <p className="text-gray-600 mt-2">Fill in the details for your job posting</p>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-xl">Job Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Basic Job Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
            <Input placeholder="Position" value={position} onChange={(e)=>setPosition(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isRemote} onChange={(e)=>setIsRemote(e.target.checked)} />
              Remote position
            </label>
            {!isRemote && (
              <Input placeholder="Job location (address)" value={location} onChange={(e)=>setLocation(e.target.value)} />
            )}
            <Textarea placeholder="Job description" className="min-h-[160px]" value={description} onChange={(e)=>setDescription(e.target.value)} />
          </div>
          {/* Job Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Job Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Additional Details</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Total Years of Work Experience" type="number" value={totalYearsExperience} onChange={(e)=>setTotalYearsExperience(e.target.value)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input placeholder="Work Location - City" value={workCity} onChange={(e)=>setWorkCity(e.target.value)} />
                <Input placeholder="Work Location - Country" value={workCountry} onChange={(e)=>setWorkCountry(e.target.value)} />
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end pt-6 border-t">
            <Button onClick={handlePublish} disabled={saving || !position || !description} className="px-8">
              {saving ? 'Publishing...' : 'Publish Job'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


