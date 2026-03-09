export function isValidIP(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every(p => {
    const n = parseInt(p, 10)
    return !isNaN(n) && n >= 0 && n <= 255 && p === String(n)
  })
}

export function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
}

export function numberToIP(num: number): string {
  return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join('.')
}

export function isIPInSubnet(ip: string, subnet: string): boolean {
  const [subnetIP, maskBits] = subnet.split('/')
  const mask = maskBits ? parseInt(maskBits, 10) : 24
  if (isNaN(mask) || mask < 0 || mask > 32) return false
  const ipNum = ipToNumber(ip)
  const subnetNum = ipToNumber(subnetIP)
  const maskNum = (~0 << (32 - mask)) >>> 0
  return (ipNum & maskNum) === (subnetNum & maskNum)
}

export function getSubnetSize(subnet: string): number {
  const [, maskBits] = subnet.split('/')
  const mask = maskBits ? parseInt(maskBits, 10) : 24
  if (isNaN(mask)) return 0
  // Subtract 2 for network and broadcast addresses
  return Math.max(0, Math.pow(2, 32 - mask) - 2)
}

export function getIPRange(devices: { ip_address: string }[]): string {
  if (devices.length === 0) return ''
  if (devices.length === 1) return devices[0].ip_address
  const nums = devices.map(d => ipToNumber(d.ip_address)).sort((a, b) => a - b)
  return `${numberToIP(nums[0])} - ${numberToIP(nums[nums.length - 1])}`
}

export function getNextAvailableIP(usedIPs: string[], subnet: string, startFrom: string): string | null {
  const usedSet = new Set(usedIPs)
  const [subnetBase, maskBits] = subnet.split('/')
  const mask = maskBits ? parseInt(maskBits, 10) : 24
  const total = Math.pow(2, 32 - mask)
  const subnetStart = ipToNumber(subnetBase)
  let current = ipToNumber(startFrom)

  for (let i = 0; i < total; i++) {
    const ip = numberToIP(current)
    if (!usedSet.has(ip) && isIPInSubnet(ip, subnet)) {
      // Skip network address and broadcast address
      const hostPart = current - subnetStart
      if (hostPart > 0 && hostPart < total - 1) {
        return ip
      }
    }
    current++
    if (current >= subnetStart + total) {
      current = subnetStart + 1
    }
  }
  return null
}
