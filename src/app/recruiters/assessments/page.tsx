"use client"

import { useEffect, useState } from 'react'
import { recruiterService } from '@/services/recruiterService'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Question = { type: 'mcq' | 'text'; question: string; options?: string[]; correctOptionIndex?: number; maxScore?: number }

export default function AssessmentsPage() {
  const [items, setItems] = useState<any[]>([])
  const [candidateUserId, setCandidateUserId] = useState('')
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])

  const load = async () => {
    const res = await recruiterService.listAssessments()
    if (res.success) setItems(res.data.items || [])
  }
  useEffect(() => { load() }, [])

  const addQuestion = () => setQuestions([...questions, { type: 'mcq', question: '', options: ['A', 'B', 'C', 'D'], correctOptionIndex: 0, maxScore: 1 }])

  const create = async () => {
    await recruiterService.createAssessment({ candidateUserId, title, questions })
    setCandidateUserId(''); setTitle(''); setQuestions([])
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
        <CardHeader><CardTitle>Create Assessment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Candidate User ID" value={candidateUserId} onChange={(e) => setCandidateUserId(e.target.value)} />
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div key={idx} className="border p-2 rounded space-y-2">
                <Input placeholder="Question" value={q.question} onChange={(e) => setQuestions(qs => qs.map((qq, i) => i === idx ? { ...qq, question: e.target.value } : qq))} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Option 1" value={q.options?.[0] || ''} onChange={(e) => setQuestions(qs => qs.map((qq, i) => i === idx ? { ...qq, options: [e.target.value, qq.options?.[1] || '', qq.options?.[2] || '', qq.options?.[3] || ''] } : qq))} />
                  <Input placeholder="Option 2" value={q.options?.[1] || ''} onChange={(e) => setQuestions(qs => qs.map((qq, i) => i === idx ? { ...qq, options: [qq.options?.[0] || '', e.target.value, qq.options?.[2] || '', qq.options?.[3] || ''] } : qq))} />
                  <Input placeholder="Option 3" value={q.options?.[2] || ''} onChange={(e) => setQuestions(qs => qs.map((qq, i) => i === idx ? { ...qq, options: [qq.options?.[0] || '', qq.options?.[1] || '', e.target.value, qq.options?.[3] || ''] } : qq))} />
                  <Input placeholder="Option 4" value={q.options?.[3] || ''} onChange={(e) => setQuestions(qs => qs.map((qq, i) => i === idx ? { ...qq, options: [qq.options?.[0] || '', qq.options?.[1] || '', qq.options?.[2] || '', e.target.value] } : qq))} />
                </div>
                <Input placeholder="Correct Option Index (0-3)" value={String(q.correctOptionIndex ?? 0)} onChange={(e) => setQuestions(qs => qs.map((qq, i) => i === idx ? { ...qq, correctOptionIndex: Number(e.target.value) } : qq))} />
                <Input placeholder="Max Score" value={String(q.maxScore ?? 1)} onChange={(e) => setQuestions(qs => qs.map((qq, i) => i === idx ? { ...qq, maxScore: Number(e.target.value) } : qq))} />
              </div>
            ))}
            <Button variant="outline" onClick={addQuestion}>Add MCQ Question</Button>
          </div>
          <Button onClick={create}>Create</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Assessments</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {items.map(it => (
            <div key={it.id} className="border p-2 rounded">
              <div className="font-medium">{it.title}</div>
              <div className="text-sm text-gray-600">Questions: {it.questions?.length || 0}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}


