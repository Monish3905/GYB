export class ResourceScheduler {
  public async scheduleJob(jobName: string, cronExpr: string): Promise<string> {
    const id = `job-${Date.now()}`;
    console.log(`[SCHEDULER] Scheduled job ${jobName} at ${cronExpr}`);
    return id;
  }
}
