export function generateTradeId(): string {
  const num = Math.floor(Math.random() * 90000) + 10000
  return `TXN-${num}`
}

export function generateDepositId(): string {
  const num = Math.floor(Math.random() * 900000) + 100000
  return `DEP-${num}`
}

export function generateWithdrawalId(): string {
  const num = Math.floor(Math.random() * 900000) + 100000
  return `WDR-${num}`
}

export function generateReferralCode(name: string): string {
  const clean = name.replace(/\s/g, '').toUpperCase().slice(0, 4)
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${clean}${num}`
}