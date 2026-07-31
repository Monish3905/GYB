export class VelocityEngine {
  public checkVelocity(customerId: string, amount: number): boolean {
    // In reality this queries redis or read models for daily volume
    // Mocking a $10,000 daily limit for the sake of the engine
    if (amount > 10000) {
      return false; // Velocity breached
    }
    return true;
  }
}
