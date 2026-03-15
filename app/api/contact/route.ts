import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formId = process.env.FORMSPREE_ID
  if (!formId) {
    console.error('[contact] FORMSPREE_ID manquant')
    return NextResponse.json({ error: 'Form not configured' }, { status: 500 })
  }

  const body = await req.json()

  let res: Response
  try {
    res = await fetch(`https://formspree.io/f/${formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.error('[contact] fetch Formspree échoué :', err)
    return NextResponse.json({ error: 'Network error' }, { status: 502 })
  }

  const text = await res.text()
  console.log(`[contact] Formspree status=${res.status} body=${text}`)

  try {
    return NextResponse.json(JSON.parse(text), { status: res.status })
  } catch {
    return NextResponse.json({ error: text }, { status: res.status })
  }
}
