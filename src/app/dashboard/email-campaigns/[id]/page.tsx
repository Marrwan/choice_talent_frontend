'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/lib/useToast'
import { emailCampaignService, type EmailCampaign, type CampaignRecipient, type CampaignStats } from '@/services/emailCampaignService'
import { ArrowLeft, Play, Pause, RotateCcw, Mail, Users, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react'

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const campaignId = params.id as string
  
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null)
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [recipientsPage, setRecipientsPage] = useState(1)
  const [recipientsTotalPages, setRecipientsTotalPages] = useState(1)

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails()
      fetchRecipients()
    }
  }, [campaignId, recipientsPage])

  const fetchCampaignDetails = async () => {
    try {
      const response = await emailCampaignService.getCampaign(campaignId)
      if (response.success) {
        setCampaign(response.data.campaign)
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Error fetching campaign details:', error)
      toast.showError('Failed to fetch campaign details')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecipients = async () => {
    try {
      const response = await emailCampaignService.getCampaignRecipients(campaignId, recipientsPage, 50)
      if (response.success) {
        setRecipients(response.data.recipients)
        setRecipientsTotalPages(response.data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching recipients:', error)
      toast.showError('Failed to fetch recipients')
    }
  }

  const startCampaign = async () => {
    try {
      // Optimistic update - immediately update the campaign status
      if (campaign) {
        setCampaign({
          ...campaign,
          status: 'active',
          startedAt: new Date().toISOString()
        })
      }

      const response = await emailCampaignService.startCampaign(campaignId)
      if (response.success) {
        toast.showSuccess('Campaign started successfully')
        fetchCampaignDetails()
      } else {
        // Revert optimistic update if failed
        fetchCampaignDetails()
      }
    } catch (error) {
      console.error('Error starting campaign:', error)
      toast.showError('Failed to start campaign')
      // Revert optimistic update on error
      fetchCampaignDetails()
    }
  }

  const pauseCampaign = async () => {
    try {
      // Optimistic update - immediately update the campaign status
      if (campaign) {
        setCampaign({
          ...campaign,
          status: 'paused'
        })
      }

      const response = await emailCampaignService.pauseCampaign(campaignId)
      if (response.success) {
        toast.showSuccess('Campaign paused successfully')
        fetchCampaignDetails()
      } else {
        // Revert optimistic update if failed
        fetchCampaignDetails()
      }
    } catch (error) {
      console.error('Error pausing campaign:', error)
      toast.showError('Failed to pause campaign')
      // Revert optimistic update on error
      fetchCampaignDetails()
    }
  }

  const resumeCampaign = async () => {
    try {
      // Optimistic update - immediately update the campaign status
      if (campaign) {
        setCampaign({
          ...campaign,
          status: 'active'
        })
      }

      const response = await emailCampaignService.resumeCampaign(campaignId)
      if (response.success) {
        toast.showSuccess('Campaign resumed successfully')
        fetchCampaignDetails()
      } else {
        // Revert optimistic update if failed
        fetchCampaignDetails()
      }
    } catch (error) {
      console.error('Error resuming campaign:', error)
      toast.showError('Failed to resume campaign')
      // Revert optimistic update on error
      fetchCampaignDetails()
    }
  }

  const sendNextBatch = async () => {
    try {
      const response = await emailCampaignService.sendNextBatch(campaignId)
      if (response.success) {
        toast.showSuccess(`Batch sent: ${response.data.sentCount} emails`)
        fetchCampaignDetails()
      }
    } catch (error) {
      console.error('Error sending batch:', error)
      toast.showError('Failed to send batch')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      active: { color: 'bg-green-100 text-green-800', icon: Play },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: Pause },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getProgressPercentage = () => {
    if (!campaign || campaign.totalEmails === 0) return 0
    return Math.round((campaign.sentEmails / campaign.totalEmails) * 100)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
          <p className="text-gray-600 mb-4">The campaign you&apos;re looking for doesn&apos;t exist</p>
          <Button onClick={() => router.push('/dashboard/email-campaigns')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard/email-campaigns')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-gray-600">{campaign.subject}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Campaign Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Campaign Overview
              {getStatusBadge(campaign.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{campaign.totalEmails}</div>
                <div className="text-sm text-gray-600">Total Recipients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{campaign.sentEmails}</div>
                <div className="text-sm text-gray-600">Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{campaign.failedEmails}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{campaign.emailsPerHour}</div>
                <div className="text-sm text-gray-600">Per Hour</div>
              </div>
            </div>

            {campaign.totalEmails > 0 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Target Audience:</strong> {campaign.targetAudience.replace('_', ' ')}
              </div>
              <div>
                <strong>Created:</strong> {new Date(campaign.createdAt).toLocaleDateString()}
              </div>
              {campaign.startedAt && (
                <div>
                  <strong>Started:</strong> {new Date(campaign.startedAt).toLocaleDateString()}
                </div>
              )}
              {campaign.completedAt && (
                <div>
                  <strong>Completed:</strong> {new Date(campaign.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaign.status === 'draft' && (
              <Button onClick={startCampaign} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Start Campaign
              </Button>
            )}
            {campaign.status === 'active' && (
              <>
                <Button onClick={pauseCampaign} variant="outline" className="w-full">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Campaign
                </Button>
                <Button onClick={sendNextBatch} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Next Batch
                </Button>
              </>
            )}
            {campaign.status === 'paused' && (
              <Button onClick={resumeCampaign} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Resume Campaign
              </Button>
            )}
            {campaign.status === 'completed' && (
              <div className="text-center text-green-600">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Campaign completed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      {stats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Email Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                <div className="text-sm text-gray-600">Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.bounced}</div>
                <div className="text-sm text-gray-600">Bounced</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipients */}
      <Card>
        <CardHeader>
          <CardTitle>Recipients</CardTitle>
          <CardDescription>
            Showing {recipients.length} of {campaign.totalEmails} recipients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recipients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recipients found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((recipient, index) => (
                    <TableRow key={index}>
                      <TableCell>{recipient.name}</TableCell>
                      <TableCell>{recipient.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {recipientsTotalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRecipientsPage(recipientsPage - 1)}
                      disabled={recipientsPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm">
                      Page {recipientsPage} of {recipientsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRecipientsPage(recipientsPage + 1)}
                      disabled={recipientsPage === recipientsTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 