'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { serviceService } from '@/services/serviceService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image as ImageIcon, X, Upload } from 'lucide-react';

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
  type SelectedService = { serviceName: string; category: string };
  const [selected, setSelected] = useState<SelectedService[]>([]);

  const filtered = useMemo(() => {
    if (!query.trim()) return RAW_CATEGORIES;
    const q = query.toLowerCase();
    return RAW_CATEGORIES
      .map(cat => ({ ...cat, services: cat.services.filter(s => s.toLowerCase().includes(q)) }))
      .filter(cat => cat.name.toLowerCase().includes(q) || cat.services.length > 0);
  }, [query]);

  const toggleService = (svc: string, category: string) => {
    const key = `${category}::${svc}`;
    const exists = selected.find(s => `${s.category}::${s.serviceName}` === key);
    if (exists) {
      setSelected(prev => prev.filter(s => `${s.category}::${s.serviceName}` !== key));
    } else if (selected.length < 10) {
      setSelected(prev => [...prev, { serviceName: svc, category }]);
    }
  };

  const [about, setAbout] = useState('');
  const [useProfileLocation, setUseProfileLocation] = useState(true);
  const [remote, setRemote] = useState(false);
  const [contactForPrice, setContactForPrice] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [rate, setRate] = useState('');
  const [allowMessages, setAllowMessages] = useState(true);
  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + media.length > 8) {
      alert('Maximum 8 media files allowed');
      return;
    }
    
    const newMedia = [...media, ...files];
    setMedia(newMedia);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMediaPreview([...mediaPreview, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    // Check if this is an existing media item or a new one
    if (index < existingMedia.length) {
      // Remove from existing media
      const newExistingMedia = existingMedia.filter((_, i) => i !== index);
      setExistingMedia(newExistingMedia);
      // Update mediaPreview to reflect the change
      const newPreviews = mediaPreview.filter((_, i) => i !== index);
      setMediaPreview(newPreviews);
    } else {
      // Remove from new media (adjust index for new media array)
      const newMediaIndex = index - existingMedia.length;
      const newMedia = media.filter((_, i) => i !== newMediaIndex);
      const newPreviews = mediaPreview.filter((_, i) => i !== index);
      setMedia(newMedia);
      setMediaPreview(newPreviews);
    }
  };

  const onPublish = async () => {
    // Save each selected service as a record
    for (const svc of selected) {
      await serviceService.upsert({
        category: svc.category,
        serviceName: svc.serviceName,
        description: about,
        location: useProfileLocation ? 'profile' : undefined,
        pricingAmount: contactForPrice ? undefined : (rate ? Number(rate) : undefined),
        pricingCurrency: contactForPrice ? undefined : currency,
        pricingType: contactForPrice ? undefined : 'hourly',
        remoteAvailable: remote,
        allowMessages: allowMessages,
        status: 'published',
        media: media,
        existingMedia: existingMedia // Pass existing media URLs to preserve them
      });
    }
    router.push('/dashboard/earn/services');
  };

  // Prefill from existing services on load
  useEffect(() => {
    (async () => {
      try {
        const mine = await serviceService.mine();
        if (mine.success && mine.data && mine.data.length > 0) {
          const svcs: SelectedService[] = mine.data.slice(0, 10).map((s: any) => ({ serviceName: s.serviceName, category: s.category }));
          setSelected(svcs);
          const first = mine.data[0];
          setAbout(first.description || '');
          setRemote(!!first.remoteAvailable);
          setUseProfileLocation(first.location === 'profile');
          if (first.pricingAmount && first.pricingCurrency) {
            setContactForPrice(false);
            setCurrency(first.pricingCurrency);
            setRate(String(first.pricingAmount));
          } else {
            setContactForPrice(true);
          }
          setAllowMessages(first.allowMessages !== false);
          
          // Load existing media
          if (first.media && Array.isArray(first.media) && first.media.length > 0) {
            setExistingMedia(first.media);
            setMediaPreview(first.media);
            // Note: We can't set the actual File objects since they're URLs from the server
            // The media preview will show the existing images
          }
        }
      } catch {}
    })();
  }, []);

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
                <span key={`${s.category}-${s.serviceName}`} className="text-xs border rounded-full px-3 py-1">{s.serviceName}</span>
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

          <div>
            <div className="text-lg font-semibold mb-2">Media</div>
            <p className="text-sm text-gray-600 mb-3">Add up to 8 media files to showcase your work and experience.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {mediaPreview.map((preview, index) => (
                <div key={index} className="relative">
                  <img 
                    src={preview} 
                    alt={`Media ${index + 1}`} 
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            {(media.length + existingMedia.length) < 8 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                  id="media-upload"
                />
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload media files</p>
                  <p className="text-xs text-gray-500">Images and videos supported</p>
                </label>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button onClick={onPublish}>Publish</Button>
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
                      <input type="checkbox" checked={!!selected.find(x => x.serviceName === s && x.category === (activeCategory?.name || ''))} onChange={()=>toggleService(s, activeCategory?.name || '')} />
                      <span className="font-medium">{s}</span>
                    </div>
                    {!selected.find(x => x.serviceName === s && x.category === (activeCategory?.name || '')) && selected.length >= 10 && (
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


