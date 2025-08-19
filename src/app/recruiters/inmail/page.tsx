"use client"

import { useEffect, useState } from 'react'
import { recruiterService } from '@/services/recruiterService'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function InmailPage() {
  const [inbox, setInbox] = useState<any[]>([])
  const [sent, setSent] = useState<any[]>([])
  const [recipientId, setRecipientId] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')

  const load = async () => {
    const res = await recruiterService.listInmail()
    if (res.success) {
      setInbox(res.data.inbox || [])
      setSent(res.data.sent || [])
    }
  }
  useEffect(() => { load() }, [])

  const send = async () => {
    await recruiterService.sendInmail(recipientId, subject, content)
    setRecipientId(''); setSubject(''); setContent('')
    load()
  }

  return (
    <div className="container mx-auto px-4 py-8 grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <Link href="/recruiters/dashboard">
          <Button variant="outline">Back to Recruiter Dashboard</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Compose InMail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Recipient User ID" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} />
          <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea placeholder="Message" value={content} onChange={(e) => setContent(e.target.value)} />
          <Button onClick={send}>Send</Button>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Inbox</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {inbox.map(m => (<div key={m.id}><b>{m.subject || 'No subject'}</b><div className="text-sm text-gray-600">{m.content}</div></div>))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sent</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sent.map(m => (<div key={m.id}><b>{m.subject || 'No subject'}</b><div className="text-sm text-gray-600">{m.content}</div></div>))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


