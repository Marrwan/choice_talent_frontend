import { apiClient } from '@/lib/api';

// TypeScript interfaces for Job Hunting Settings
export interface JobHuntingSettings {
  id: string;
  userId: string;
  jobTypes: string[];
  careerCategory: string;
  categoryOfPositions: string[];
  totalYearsOfWorkExperience: string;
  preferredLocations: string[];
  minimumSalaryExpectation?: string;
  workWithProposedPay: boolean;
  salaryExpectationNegotiable?: string;
  searchScope?: 'country_only' | 'global';
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobHuntingSettingsData {
  jobTypes: string[];
  careerCategory: string;
  categoryOfPositions: string[];
  totalYearsOfWorkExperience: string;
  preferredLocations: string[];
  minimumSalaryExpectation?: string;
  workWithProposedPay: boolean;
  salaryExpectationNegotiable?: string;
  searchScope?: 'country_only' | 'global';
}

// API Response types
export interface JobHuntingSettingsResponse {
  success: boolean;
  message: string;
  data: {
    settings: JobHuntingSettings | null;
  };
}

// Job Hunting Settings Service
export const jobHuntingSettingsService = {
  // Get user's job hunting settings
  async getSettings(): Promise<JobHuntingSettingsResponse> {
    return apiClient.get<JobHuntingSettingsResponse>('/job-hunting-settings', true);
  },

  // Create or update job hunting settings
  async createOrUpdateSettings(data: CreateJobHuntingSettingsData): Promise<JobHuntingSettingsResponse> {
    return apiClient.post<JobHuntingSettingsResponse>('/job-hunting-settings', data, true);
  },

  // Delete job hunting settings
  async deleteSettings(): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>('/job-hunting-settings', true);
  }
};

// Constants for form options
export const JOB_TYPES = [
  'Remote Jobs',
  'Freelance Jobs',
  'Part-time Jobs',
  'Full-time Jobs',
  'Contract Jobs',
  'Volunteer Jobs'
];

export const CAREER_CATEGORIES = [
  'Undergraduate Internship',
  'Graduate Trainee / Interns',
  'Entry-Level',
  'Intermediate Level',
  'Experienced Level',
  'Senior Level',
  'Supervisory Level',
  'Management Level',
  'Executive Level'
];

export const CATEGORY_OF_POSITIONS = [
  'Accounting / Auditing / Bookkeeping / Budgetting / Finance / Lending / Tax',
  'Administration / Secretarial / Personal Assistant (PA) / Clerical / Office Assistant',
  'Advertising / Branding / Public Relation (PR)',
  'Agriculture / Agro-Allied / Farming',
  'Architectural / Interior and Exterior Designing / Surveying',
  'Artisan / Labour / Factory Work / Craftsmen / Vocational / Semi-Skilled',
  'Arts / Craft / Art Creatives',
  'Automobile Services / Auto Painting / Auto Mechanic / Auto Electrician / Auto Panel Beater / Auto Upholstery',
  'Aviation / Airline Services / Air Hostess / Pilot / Captain / Aircraft Engineer',
  'Beauty / Beauty Care / Make-up / Hair Stylist / Pedicure / Manicure / Masseuse',
  'Biological Sciences - Biochemistry / Microbiology / Plant Science / Environmental',
  'Caregiver / Nanny / Domestic Help',
  'Cashiers / Tellers / Ticketing',
  'Chaplain / Pastoral / Reverend / Ministration',
  'Coaching / Mentoring / Change Management / Development / Training / Learning / Public Speaking',
  'Computer / Cloud Computing / Data Warehousing / Amazon Web Services (AWS)',
  'Computer / Database Support / Database Admin / Database Development / Oracle / MySQL',
  'Computer / Frontend Design / UI / UX / Frontend Scripting / JavaScript / React / JQuery',
  'Computer / Full Stack Software Development / Frontend & Backend / Web Design & Development',
  'Computer / Graphics Design / Artist',
  'Computer / Mobile App Development / Android / IOS / Games / React Native / Flutter',
  'Computer / Network & Hardware Engineering Support / Network Design and Security',
  'Computer / System Admin / Software Support / Windows Admin / Linux Admin',
  'Computer / Software Development / Software Testing / SaaS Development / Cloud Management / Analytics Development',
  'Computer Networking / Telecommunications / Mast Operations / Cybersecurity / Data Recovery / Home Networking',
  'Consulting / Business Strategy / Planning',
  'Cook / Chef / Baker / Pastry Chef / Steward',
  'Customer Service / Call Centre / Front Desk / Receptionist',
  'Data Entry / Data Reporting / Analysis / Business Analysis',
  'Design Creatives / 3D Design / Ad Design / Animation / Graphics / Prints / Visuals / Packaging',
  'Digital Marketing / Social Media Management ',
  'Driving / Haulage / Dispatch Rider / Bike Rider / Chauffeur',
  'Economics / Statistics / Data Science',
  'Education - Higher Institution / Teaching / Lecturing / Training',
  'Education - Non-Academic / Registrar / Bursary / Admin / Librarian',
  'Education - Sec/Pri/Creche / Teaching / Tutoring / Creche Services',
  'Election Personnel / Ad-hoc Officers',
  'Engineering - Biomedical Engineering',
  'Engineering - Chemical / Petroleum / Petrochemical',
  'Engineering - Civil / Construction / Building',
  'Engineering - Electrical / Electronics / Telecom',
  'Engineering - Mechanical / Metallurgical / Mechatronics',
  'Environmental Services',
  'Executive / Top Management',
  'Facility Management / Estate Management / Maintenance / Real Estate',
  'Fashion Design / Beauty Care / Make-up / Tailoring / Hair Stylist / Bead Making / Shoe Making',
  'Food & Nutrition / Dietetics / Food Technology',
  'Furniture Design / Carpentry',
  'Graduate Trainee / Fresh Graduate / Graduate Internship',
  'Horticulture / Beautification / Gardening',
  'Hospitality / Travel & Tourism / Hotel / Restaurant / Catering / Museum / Club / Bar / Tour Guide',
  'House Keeping / Cleaning / Deep Cleaning / Drycleaning / Fumigation / Janitorial / Laundry',
  'HSE / Safety & Risk Management / Compliance',
  'Human Resources / Recruitment',
  'Insurance / Assurance / Actuary',
  'Internship / SIWES / Industrial Training',
  'Language Translation / Transcribing / Interpreting',
  'Law / Legal / Litigation',
  'Logistics / Procurement / Purchasing / Supply Chain',
  'Maritime Services / Shipping / Clearing & Forwarding / Marine Officer / Seamen',
  'Marketing / Sales / Business Development / Merchandiser',
  'Media / Broadcasting / Journalism / Content Writing / Editing / Blogging',
  'Medical - Anatomy / Physiology / Pathology / Basic Medical Science',
  'Medical - Dental / ENT',
  'Medical - Health Information / Medical Records / Health Management',
  'Medical - Nursing & Midwifery',
  'Medical - Optometrist / Ophthalmologist',
  'Medical - Pharmaceutical',
  'Medical - Physician / Medical Officer / Doctor / Consultants / Medical Internship',
  'Medical - Physiotherapy / Massage Therapy / Masseuse / Masseur',
  'Medical - Public Health Worker / Hospital Attendant / Orderly',
  'Medical - Veterinary Medicine',
  'Medical Laboratory / Radiography / Sonography',
  'Modelling / Ushering Services / Runway Services',
  'Monitoring and Evaluation / Social Worker',
  'Multimedia / Animation / Film Production / Photography / Cinematography / Video & Audio Editing',
  'Music Entertainment / Comedy / Disc Jockey (DJ) / Master of Ceremony (MC) / Events / Sound Engineering',
  'Operations / Project Management',
  'Physical Sciences - Chemistry / Physics / Geography / Earth Science (Geology) / Material Science / Astronomy',
  'Political Consulting / Policitical Advisory / Special Assistant ',
  'Psychology / Clinical Psychology',
  'Quality Assurance (QA) / Quality Control (QC)',
  'Remote / Freelance / Work at home',
  'Research / Survey',
  'Scholarship / Grant / Competition',
  'Security - Guard / Gateman',
  'Security - Military / Police / Civil Defense / Para-Military',
  'Security - Professional / Public / Corporate Security Management',
  'Sports / Fitness / Fitness Coach / Gym Instructor / Nutritionist / Weightloss',
  'Store-Keeping & Warehousing',
  'Technician - Electrical / Electrician',
  'Technician - Fitter / Plumber / Welder / Panel Beater / Scaffolder',
  'Technician - Mechanical / Mechanic / Generator Technician',
  'Tender / Bid / Quotation / Proposal / Expression of Interest',
  'Waiter / Waitress / Concierge / Room Attendant'
];

export const YEARS_OF_EXPERIENCE = [
  '0 - 1 Years of work experience',
  '2 Years of work experience',
  '3 Years of work experience',
  '4 Years of work experience',
  '5 Years of work experience',
  '6 Years of work experience',
  '7 Years of work experience',
  '8 Years of work experience',
  '9 Years of work experience',
  '10 Years of work experience',
  '11 Years of work experience',
  '12 Years of work experience',
  '13 Years of work experience',
  '14 Years of work experience',
  '15 Years of work experience',
  '16 Years of work experience',
  '17 Years of work experience',
  '18 Years of work experience',
  '19 Years of work experience',
  '20 Years of work experience',
  '21 Years of work experience',
  '22 Years of work experience',
  '23 Years of work experience',
  '24 Years of work experience',
  '25 Years of work experience',
  '26 Years of work experience',
  '27 Years of work experience',
  '28 Years of work experience',
  '29 Years of work experience',
  '30 Years of work experience',
  '31 Years of work experience',
  '32 Years of work experience',
  '33 Years of work experience',
  '34 Years of work experience',
  '35 Years of work experience and above'
];

export const NIGERIAN_STATES = [
  'Abia State',
  'Adamawa State',
  'Akwa Ibom State',
  'Anambra State',
  'Bauchi State',
  'Bayelsa State',
  'Benue State',
  'Borno State',
  'Cross Rivers State',
  'Delta State',
  'Ebonyi State',
  'Edo State',
  'Ekiti State',
  'Enugu State',
  'Gombe State',
  'Imo State',
  'Jigawa State',
  'Kaduna State',
  'Kano State',
  'Katsina State',
  'Kebbi State',
  'Kogi State',
  'Kwara State',
  'Lagos State',
  'Nasarawa State',
  'Niger State',
  'Ogun State',
  'Ondo State',
  'Osun State',
  'Oyo State',
  'Plateau State',
  'Rivers State',
  'Sokoto State',
  'Taraba State',
  'Yobe State',
  'Zamfara State',
  'Abuja (FCT)'
];

export const SALARY_NEGOTIABLE_OPTIONS = ['Yes', 'No']; 