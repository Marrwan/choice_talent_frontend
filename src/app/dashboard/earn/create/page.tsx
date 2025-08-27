'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Category = {
  name: string;
  services: string[];
};

const RAW_CATEGORIES: Category[] = [
  { name: 'ACCOUNTING', services: [
    'Accounting','Auditing','Bookkeeping','Financial Accounting','Financial Advisory','Mortgage Lending','Personal Tax Planning','Small Business Tax','Tax Preparation'] },
  { name: 'ART CREATIVES', services: ['Arts','Craft','Creatives'] },
  { name: 'AUTOMOBILE SERVICES', services: [
    'Automobile Servicing','Automobile Painting','Automobile Mechanic','Automobile Electrician','Automobile Panel Beater','Automobile Upholstery'] },
  { name: 'BEAUTY', services: ['Beauty Care','Make-up','Hair Stylist','Pedicure','Manicure','Masseuse'] },
  { name: 'COACHING & MENTORING', services: [
    'Career Development Coaching','Change Management','Corporate Training','Diversity & Inclusion','Executive Coaching','Interview Preparation','Leadership Development','Life Coaching','Negotiation','Public Speaking','Resume Review','Team Building','Training'] },
  { name: 'CAREGIVER', services: ['Caregiver','Nanny','Domestic Help'] },
  { name: 'CHEF', services: ['Cook','Chef','Baker','Pastry Chef','Steward'] },
  { name: 'CONSULTING', services: [
    'Advertising','Brand Consulting','Business Consulting','Educational Consulting','Email Marketing','Environmental Consulting','Financial Consulting','HR Consulting','Healthcare Consulting','Legal Consulting','Management Consulting','Marketing Consulting','Non-profit Consulting','Political Consulting','Pricing Strategy','Project Management','Public Relations','Search Engine Marketing (SEM)','Search Engine Optimization (SEO)','Tax Advisory'] },
  { name: 'DATA ANALYSIS', services: ['Data Entry','Data Analysis','Business Analysis'] },
  { name: 'DESIGN CREATIVE', services: [
    '3D Design','Ad Design','Animation','Brand Design','Cinematography','Engineering Design','Graphic Design','Illustration','Industrial Design','Interaction Design','Interior Design','Logo Design','Packaging Design','Presentation Design','Print Design','UX Research','User Experience Design (UED)','Video Editing','Video Production','Videography','Visual Design','Web Design','WordPress Design'] },
  { name: 'EVENTS', services: [
    'Audio Engineering','Bartending','Catering','Comedy','Corporate Events','Disc Jockey (DJ)','Event Coordination','Event Photography','Event Planning','Event Production','Floral Design','Live Events','Master of Ceremony (MC)','Musician','Photo Booths','Product Launch Events','Sound Design','Trade Shows','Wedding Officiating','Wedding Planning'] },
  { name: 'FASHION', services: ['Fashion Design','Tailoring','Bead Making','Shoe Making'] },
  { name: 'FITNESS', services: ['Fitness Coach','Gym Instructor','Nutritionist','Weightloss'] },
  { name: 'FINANCE', services: [
    'Budgeting','Financial Accounting','Financial Advisory','Financial Analysis','Financial Planning','Financial Reporting','Insurance','Loans','Retirement Planning'] },
  { name: 'HOUSEKEEPING', services: ['Cleaning','Deep Cleaning','Drycleaning','Fumigation','Janitorial','Laundry'] },
  { name: 'INFORMATION TECHNOLOGY', services: [
    'Backup & Recovery Systems','Computer Networking','Computer Repair','Cybersecurity','Data Recovery','Home Networking','IT Consulting','Network Support','Telecommunications'] },
  { name: 'INSURANCE', services: [
    'Auto Insurance','Commercial Insurance','Health Insurance','Homeowners Insurance','Insurance','Life Insurance','Small Business Insurance','Title Insurance'] },
  { name: 'LAW', services: [
    'Bankruptcy Law','Business Law','Consumer Law','Copyright Law','Corporate Law','Criminal Defense Law','DUI Law','Divorce Law','Entertainment Law','Estate Planning Law','Family Law','IT Law','Immigration Law','Intellectual Property Law','Labor and Employment Law','Legal Consulting','Notary','Patent Law','Personal Injury Law','Property Law','Startup Law','Tax Law','Trademark Law','Trust and Estate Litigation','Wills Planning Law'] },
  { name: 'MARKETING', services: [
    'Advertising','Blogging','Brand Marketing','Content Marketing','Content Strategy','Demand Generation','Digital Marketing','Direct Mail Marketing','Email Marketing','Event Marketing','Growth Marketing','Lead Generation','Market Research','Marketing Consulting','Marketing Strategy','Mobile Marketing','Performance Marketing','Product Marketing','Public Relations','Real Estate Marketing','Search Engine Marketing (SEM)','Search Engine Optimization (SEO)','Social Media Marketing'] },
  { name: 'OPERATIONS', services: [
    'Administrative Assistance','Appointment Scheduling','Customer Service','Customer Support','Data Entry','Data Reporting','Executive Administrative Assistance','File Management','Filing','Human Resources (HR)','Invoice Processing','Online Research','Outsourcing','Payroll Services','Personal Assistance','Program Management','Project Management','Research Skills','Strategic Planning','Technical Support','Transcription','Typing','Virtual Assistance'] },
  { name: 'PHOTOGRAPHY', services: [
    'Commercial Photography','Corporate Photography','Event Photography','Food Photography','Headshot Photography','Nature Photography','Pet Photography','Photo Booths','Portrait Photography','Real Estate Photography','Restaurant Photography','Sports Photography','Stock Photography','Video Animation','Video Editing','Videography','Wedding Photography'] },
  { name: 'PROPERTY DEVELOPMENT', services: ['Architecture','Interior Design','Landscape Design','Quantity Surveying'] },
  { name: 'REAL ESTATE', services: ['Commercial Lending','Commercial Real Estate','Mortgage Lending','Property Law','Property Management','Real Estate','Real Estate Appraisal','Real Estate Marketing','Relocation'] },
  { name: 'SOFTWARE DEVELOPMENT', services: [
    'Android Development','Application Development','Analytics Development','Backend Development','Cloud Application Development','Cloud Management','Custom Software Development','Database Development','Enterprise Content Management','Frontend Development','Information Management','Information Security','Mobile Application Development','SaaS Development','Software Testing','User Experience Design (UED)','Web Design','Web Development','iOS Development'] },
  { name: 'TECHNICIAN', services: ['Carpentry Technician','Electrical Technician','Fitting Technician','Mechanical Technician','Panel Beating Technician','Plumbing Technician','Scaffolding Technician','Welding Technician'] },
  { name: 'TOURISM', services: ['Tourism','Tour Guide','Travel Planning'] },
  { name: 'WRITING', services: ['Blogging','Content Strategy','Copywriting','Editing','Ghostwriting','Grant Writing','Technical Writing','Translation','User Experience Writing','Resume Writing','Writing'] },
];

export default function EarnCreateServicesPage() {
  const router = useRouter();
  // Add services modal
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [modalStep, setModalStep] = useState<'categories'|'category'>('categories');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (!query.trim()) return RAW_CATEGORIES;
    const q = query.toLowerCase();
    return RAW_CATEGORIES
      .map(cat => ({ ...cat, services: cat.services.filter(s => s.toLowerCase().includes(q)) }))
      .filter(cat => cat.name.toLowerCase().includes(q) || cat.services.length > 0);
  }, [query]);

  const toggleService = (svc: string) => {
    if (selected.includes(svc)) {
      setSelected(prev => prev.filter(s => s !== svc));
    } else if (selected.length < 10) {
      setSelected(prev => [...prev, svc]);
    }
  };

  const [about, setAbout] = useState('');
  const [useProfileLocation, setUseProfileLocation] = useState(true);
  const [remote, setRemote] = useState(false);
  const [contactForPrice, setContactForPrice] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [rate, setRate] = useState('');
  const [allowMessages, setAllowMessages] = useState(true);

  const onPublish = async () => {
    // TODO: Wire to backend in next steps
    router.push('/dashboard/earn/services');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-8">
      <NavigationHeader title="Let's set up your services" />

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Services provided</CardTitle>
          <div className="text-sm text-gray-600">Add up to 10 services*</div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setOpen(true)}>+ Add services</Button>
            <div className="text-sm text-gray-600">{selected.length} selected</div>
          </div>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selected.map(s => (
                <span key={s} className="text-xs border rounded-full px-3 py-1">{s}</span>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* About */}
          <div>
            <div className="text-lg font-semibold mb-1">About</div>
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <Textarea
              placeholder="Tell us about your services and what makes you stand out, such as the projects you’ve worked on or your years of experience."
              value={about}
              onChange={(e)=>setAbout(e.target.value)}
              className="min-h-[140px]"
            />
          </div>

          {/* Work location */}
          <div>
            <div className="text-lg font-semibold mb-1">Work location</div>
            <div className="text-sm text-gray-600 mb-2">Select all that apply*</div>
            <label className="flex items-center gap-2 text-sm mb-2">
              <input type="checkbox" checked={useProfileLocation} onChange={(e)=>setUseProfileLocation(e.target.checked)} />
              Use current profile location
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={remote} onChange={(e)=>setRemote(e.target.checked)} />
              I am available to work remotely
            </label>
          </div>

          {/* Pricing */}
          <div>
            <div className="text-lg font-semibold mb-1">Pricing</div>
            <label className="flex items-center gap-2 text-sm mb-2">
              <input type="checkbox" checked={!contactForPrice} onChange={(e)=>setContactForPrice(!e.target.checked)} />
              Starting from (currency selector + hourly rate)
            </label>
            {!contactForPrice && (
              <div className="flex items-center gap-2 pl-6">
                <select className="border rounded px-2 py-2" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
                  {['USD','NGN','EUR','GBP','KES','GHS','ZAR','CAD','AUD','INR','JPY','CNY','BRL','MXN','AED','SAR'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Input placeholder="Hourly rate" value={rate} onChange={(e)=>setRate(e.target.value)} className="w-40" />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm mt-2">
              <input type="checkbox" checked={contactForPrice} onChange={(e)=>setContactForPrice(e.target.checked)} />
              Contact for pricing
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allowMessages} onChange={(e)=>setAllowMessages(e.target.checked)} />
              Allow non-network users to message you
            </label>
          </div>

          <div className="pt-2">
            <Button disabled onClick={onPublish}>Publish</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v)=>{ setOpen(v); if(!v){ setModalStep('categories'); setActiveCategory(null);} }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{modalStep === 'categories' ? 'Add your services' : activeCategory?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Search services (Ex: Email Marketing)"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />
            <div className="text-sm text-gray-600">Services provided* — You can add up to 10 services</div>

            {modalStep === 'categories' ? (
              <div className="max-h-[60vh] overflow-auto border rounded">
                {filtered.map(cat => (
                  <button
                    key={cat.name}
                    type="button"
                    className="w-full text-left px-4 py-4 bg-gray-50 hover:bg-gray-100 border-b font-medium flex items-center justify-between"
                    onClick={()=>{ setActiveCategory(cat); setModalStep('category'); }}
                  >
                    <span>{cat.name}</span>
                    <span className="text-gray-500">▾</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-auto border rounded">
                {activeCategory?.services.map(s => (
                  <label key={s} className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={selected.includes(s)} onChange={()=>toggleService(s)} />
                      <span className="font-medium">{s}</span>
                    </div>
                    {!selected.includes(s) && selected.length >= 10 && (
                      <span className="text-xs text-gray-400">limit reached</span>
                    )}
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              {modalStep === 'category' ? (
                <>
                  <Button variant="outline" onClick={()=>setModalStep('categories')}>Back</Button>
                  <Button onClick={()=>setOpen(false)}>Done</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={()=>setOpen(false)}>Back</Button>
                  <Button onClick={()=>setOpen(false)}>Done</Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


