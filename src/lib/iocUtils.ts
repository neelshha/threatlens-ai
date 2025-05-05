// src/lib/iocUtils.ts

export function getIOCType(value: string): 'ip' | 'hash' | 'domain' | 'unknown' {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return 'ip';
    if (/^[a-f0-9]{32,64}$/i.test(value)) return 'hash';
    if (/^[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) return 'domain';
    return 'unknown';
  }