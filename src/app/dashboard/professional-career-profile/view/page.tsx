'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/useToast'
import { professionalCareerProfileService } from '@/services/professionalCareerProfileService'
import { PDFService } from '@/services/pdfService'
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Code,
  Settings,
  Users
} from 'lucide-react'
import Link from 'next/link'
import '@/styles/pdf.css'

export default function ProfessionalCareerProfileViewPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await professionalCareerProfileService.getProfile();
      
      if (response.success && response.data.profile) {
        setProfile(response.data.profile);
      } else {
        toast.showError('No professional career profile found', 'Error');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.showError('Failed to load profile', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const profileElement = document.getElementById('career-profile-content');
      if (!profileElement) {
        toast.showError('Profile content not found', 'Error');
        return;
      }

      toast.showInfo('Generating PDF...', 'Please wait');
      
      await PDFService.generateCareerProfilePDF(
        profileElement,
        profile?.fullName || 'Career Profile',
        {
          filename: `${profile?.fullName?.replace(/\s+/g, '-').toLowerCase() || 'career'}-profile.pdf`,
          format: 'a4',
          orientation: 'portrait',
          quality: 1.0
        }
      );

      toast.showSuccess('PDF generated successfully!', 'Download Complete');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.showError('Failed to generate PDF', 'Error');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/dashboard/professional-career-profile" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Professional Career Profile</h1>
            </div>
            
            <Card className="shadow-lg">
              <CardContent className="p-6 sm:p-12">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <User className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">No Profile Found</h2>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">You haven't created your professional career profile yet.</p>
                  <Link href="/dashboard/professional-career-profile/edit">
                    <Button size="lg" className="px-6 sm:px-8 h-12">
                      <Edit className="mr-2 h-5 w-5" />
                      Create Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header Navigation */}
          <div className="mb-6 sm:mb-8 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
              <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Link>
              <Link href="/dashboard/professional-career-profile" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Professional Career Profile</h1>
                <p className="text-gray-600 text-base sm:text-lg">Comprehensive professional overview</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard/professional-career-profile/edit">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-12">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Button onClick={handleDownload} size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-12">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Main Profile Content */}
          <div id="career-profile-content" className="bg-white shadow-xl rounded-lg overflow-hidden pdf-content">
            {/* Profile Header - White background like template */}
            <div className="profile-header profile-header-regular p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full border-4 border-gray-200 shadow-lg mx-auto sm:mx-0"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-200 shadow-lg mx-auto sm:mx-0">
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-gray-900">{profile.fullName}</h2>
                  <div className="contact-info grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-gray-700">
                    <div className="flex items-center justify-center sm:justify-start">
                      <Mail className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                      <span className="text-sm sm:text-lg truncate">{profile.emailAddress || 'Email not provided'}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                      <Phone className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                      <span className="text-sm sm:text-lg truncate">{profile.phoneNumber || 'Phone not provided'}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                      <Calendar className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                      <span className="text-sm sm:text-lg truncate">{formatDate(profile.dateOfBirth) || 'Date of birth not provided'}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                      <MapPin className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                      <span className="text-sm sm:text-lg truncate">
                        {profile.stateOfResidence && profile.lgaOfResidence 
                          ? `${profile.lgaOfResidence}, ${profile.stateOfResidence}`
                          : 'Location not provided'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              {/* Professional Summary */}
              {profile.professionalSummary && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-gray-700 pb-2">
                    <FileText className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    PROFESSIONAL SUMMARY
                  </h3>
                  <div className="content-section bg-gray-50 rounded-lg p-4 sm:p-6">
                    <p className="text-gray-700 leading-relaxed text-base sm:text-lg">{profile.professionalSummary}</p>
                  </div>
                </div>
              )}

              {/* Persona */}
              {profile.persona && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-gray-700 pb-2">
                    <User className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    PERSONA
                  </h3>
                  <div className="content-section bg-gray-50 rounded-lg p-4 sm:p-6">
                    <p className="text-gray-700 leading-relaxed text-base sm:text-lg">{profile.persona}</p>
                  </div>
                </div>
              )}

              {/* Two Column Layout for Skills */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                {/* Expertise & Competencies */}
                {profile.expertiseCompetencies && profile.expertiseCompetencies.length > 0 && (
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-gray-700 pb-2">
                      <Code className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                      TECHNICAL SKILLS
                    </h3>
                    <div className="content-section bg-gray-50 rounded-lg p-4 sm:p-6">
                      <div className="flex flex-wrap gap-2">
                        {profile.expertiseCompetencies.map((skill: string, index: number) => (
                          <span key={index} className="skill-badge bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Software Skills */}
                {profile.softwareSkills && profile.softwareSkills.length > 0 && (
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-gray-700 pb-2">
                      <Settings className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                      DEVELOPMENT SKILLS
                    </h3>
                    <div className="content-section bg-gray-50 rounded-lg p-4 sm:p-6">
                      <div className="flex flex-wrap gap-2">
                        {profile.softwareSkills.map((skill: string, index: number) => (
                          <span key={index} className="skill-badge bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Work Experience - Latest First */}
              {profile.workExperiences && profile.workExperiences.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-gray-700 pb-2">
                    <Briefcase className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    WORK EXPERIENCE
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    {profile.workExperiences
                      .sort((a: any, b: any) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
                      .map((experience: any, index: number) => (
                      <div key={experience.id} className="work-experience-item bg-gray-50 rounded-lg p-4 sm:p-6 border-l-4 border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                          <div className="flex-1">
                            <p className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1">{experience.companyName}</p>
                            <p className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1">{experience.designation}</p>
                            <p className="text-gray-600 text-sm sm:text-base">{experience.companyLocation}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs sm:text-sm">
                              {formatDate(experience.entryDate)} - {experience.isCurrentJob ? 'Present' : (experience.exitDate ? formatDate(experience.exitDate) : 'Date')}
                            </span>
                          </div>
                        </div>
                        {experience.jobDescription && (
                          <div className="mb-3">
                            <h5 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Responsibilities:</h5>
                            <div className="text-gray-700 whitespace-pre-line text-sm sm:text-base">{experience.jobDescription}</div>
                          </div>
                        )}
                        {experience.achievements && (
                          <div className="text-gray-700">
                            <h5 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Achievements:</h5>
                            <div className="whitespace-pre-line text-sm sm:text-base">{experience.achievements}</div>
                          </div>
                        )}
                        
                        {/* Reference Information */}
                        {(experience.employerOrSupervisorName || experience.officialPhone || experience.officialEmail) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Reference Information:</h5>
                            <div className="space-y-1 text-xs sm:text-sm text-gray-700">
                              {experience.employerOrSupervisorName && (
                                <div className="flex items-center">
                                  <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                  <span><strong>Contact:</strong> {experience.employerOrSupervisorName}</span>
                                </div>
                              )}
                              {experience.officialPhone && (
                                <div className="flex items-center">
                                  <Phone className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                  <span><strong>Phone:</strong> {experience.officialPhone}</span>
                                </div>
                              )}
                              {experience.officialEmail && (
                                <div className="flex items-center">
                                  <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                  <span><strong>Email:</strong> {experience.officialEmail}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profile.higherEducations && profile.higherEducations.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-gray-700 pb-2">
                    <GraduationCap className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    EDUCATION
                  </h3>
                  <div className="space-y-4">
                    {profile.higherEducations.map((education: any) => (
                      <div key={education.id} className="education-item bg-gray-50 rounded-lg p-4 sm:p-6 border-l-4 border-gray-600">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1">
                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                              {education.institutionName}{education.location ? `, ${education.location}` : ''}
                            </h4>
                            <p className="text-base sm:text-lg font-semibold text-gray-700 mb-1">{education.courseOfStudy}</p>
                            <p className="text-gray-600 text-sm sm:text-base">{education.qualification}</p>
                          </div>
                          <div className="text-left sm:text-right sm:ml-4">
                            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs sm:text-sm">
                              {education.entryYear} - {education.graduationYear}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NYSC Status */}
              {profile.nyscStatus && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-gray-700 pb-2">
                    <Award className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    NYSC STATUS
                  </h3>
                  <div className="content-section bg-gray-50 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <span className="nysc-status bg-gray-600 text-white px-4 py-2 rounded-full text-center">
                        {profile.nyscStatus}
                      </span>
                      {profile.nyscStatus === 'Completed' && profile.nyscCompletionDate && (
                        <span className="text-gray-700 text-sm sm:text-base">
                          Completed on: {formatDate(profile.nyscCompletionDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Education */}
              {profile.basicEducations && profile.basicEducations.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-gray-700 pb-2">
                    <GraduationCap className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    BASIC EDUCATION
                  </h3>
                  <div className="space-y-4">
                    {profile.basicEducations.map((education: any) => (
                      <div key={education.id} className="education-item bg-gray-50 rounded-lg p-4 sm:p-6 border-l-4 border-gray-500">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1">
                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                              {education.institutionName}{education.location ? `, ${education.location}` : ''}
                            </h4>
                            <p className="text-base sm:text-lg font-semibold text-gray-700 mb-1">{education.courseOfStudy}</p>
                            <p className="text-gray-600 text-sm sm:text-base">{education.qualification}</p>
                          </div>
                          <div className="text-left sm:text-right sm:ml-4">
                            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs sm:text-sm">
                              {education.entryYear} - {education.graduationYear}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Memberships */}
              {profile.professionalMemberships && profile.professionalMemberships.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-gray-700 pb-2">
                    <Users className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    PROFESSIONAL MEMBERSHIPS & ASSOCIATIONS
                  </h3>
                  <div className="space-y-4">
                    {profile.professionalMemberships.map((membership: any) => (
                      <div key={membership.id} className="membership-item bg-gray-50 rounded-lg p-4 sm:p-6 border-l-4 border-blue-600">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1">
                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{membership.organizationName}</h4>
                            <p className="text-base sm:text-lg font-semibold text-gray-700 mb-1">{membership.membershipType}</p>
                            <p className="text-gray-600 text-sm sm:text-base">{membership.membershipNumber}</p>
                          </div>
                          <div className="text-left sm:text-right sm:ml-4">
                            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs sm:text-sm">
                              {membership.membershipYear}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Training & Certifications */}
              {profile.trainingCertifications && profile.trainingCertifications.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-gray-700 pb-2">
                    <Award className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    TRAINING & CERTIFICATIONS
                  </h3>
                  <div className="space-y-4">
                    {profile.trainingCertifications.map((certification: any) => (
                      <div key={certification.id} className="certification-item bg-gray-50 rounded-lg p-4 sm:p-6 border-l-4 border-green-600">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1">
                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{certification.certificationName}</h4>
                            <p className="text-base sm:text-lg font-semibold text-gray-700 mb-1">{certification.issuingOrganization}</p>
                            <p className="text-gray-600 text-sm sm:text-base">{certification.certificationNumber}</p>
                          </div>
                          <div className="text-left sm:text-right sm:ml-4">
                            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs sm:text-sm">
                              {certification.issueDate ? formatDate(certification.issueDate) : certification.issueYear}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Details */}
              {profile.referenceDetails && profile.referenceDetails.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center border-b-2 border-gray-700 pb-2">
                    <Users className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                    REFERENCES
                  </h3>
                  <div className="space-y-4">
                    {profile.referenceDetails.map((reference: any) => (
                      <div key={reference.id} className="reference-item bg-gray-50 rounded-lg p-4 sm:p-6 border-l-4 border-purple-600">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{reference.fullName}</h4>
                            <p className="text-base sm:text-lg font-semibold text-gray-700 mb-1">{reference.designation}</p>
                            <p className="text-gray-600 text-sm sm:text-base">{reference.organizationName}</p>
                          </div>
                          <div className="space-y-2 text-sm sm:text-base text-gray-700">
                            {reference.emailAddress && (
                              <div className="flex items-center">
                                <Mail className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span>{reference.emailAddress}</span>
                              </div>
                            )}
                            {reference.phoneNumber && (
                              <div className="flex items-center">
                                <Phone className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span>{reference.phoneNumber}</span>
                              </div>
                            )}
                            {reference.relationship && (
                              <div className="flex items-center">
                                <User className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span><strong>Relationship:</strong> {reference.relationship}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 