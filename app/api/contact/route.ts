import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID
  if (!formId) return NextResponse.json({ error: 'Form not configured' }, { status: 500 })

  const body = await req.json()

  const res = await fetch(`https://formspree.io/f/${formId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
