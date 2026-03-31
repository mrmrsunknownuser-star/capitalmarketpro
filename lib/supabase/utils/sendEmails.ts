export async function sendEmail(type: string, to: string, data: Record<string, any>) {
  try {
    const res = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, to, data }),
    })
    return await res.json()
  } catch (error) {
    console.error('Email error:', error)
  }
}