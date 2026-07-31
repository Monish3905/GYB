export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'AED' | 'PHP' | 'GBP' | 'JPY' | string;

export class Decimal {
  private value: bigint;
  private decimals: number = 8;

  constructor(value: string | number | bigint) {
    if (typeof value === 'string' || typeof value === 'number') {
      // Basic stub for decimal logic
      // In production, use decimal.js or exact math
      this.value = BigInt(Math.round(Number(value) * Math.pow(10, this.decimals)));
    } else {
      this.value = value;
    }
  }

  add(other: Decimal): Decimal {
    return new Decimal(this.value + other.value);
  }
  
  subtract(other: Decimal): Decimal {
    return new Decimal(this.value - other.value);
  }
  
  multiply(other: Decimal): Decimal {
    // Requires scaling correction
    return new Decimal((this.value * other.value) / BigInt(Math.pow(10, this.decimals)));
  }
  
  divide(other: Decimal): Decimal {
    // Requires scaling correction
    return new Decimal((this.value * BigInt(Math.pow(10, this.decimals))) / other.value);
  }
  
  compareTo(other: Decimal): number {
    if (this.value < other.value) return -1;
    if (this.value > other.value) return 1;
    return 0;
  }
  
  toString(): string {
    const str = this.value.toString();
    const isNegative = str.startsWith('-');
    const absStr = isNegative ? str.slice(1) : str;
    
    const padded = absStr.padStart(this.decimals + 1, '0');
    const intPart = padded.slice(0, padded.length - this.decimals);
    const fracPart = padded.slice(padded.length - this.decimals);
    
    return `${isNegative ? '-' : ''}${intPart}.${fracPart}`;
  }
  
  toNumber(): number {
    return Number(this.toString());
  }
}
