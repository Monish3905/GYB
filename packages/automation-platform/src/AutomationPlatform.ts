export class AutomationPlatform {
  public async executeWorkflow(workflowId: string, payload: any): Promise<string> {
    const execId = `exec-${Date.now()}`;
    console.log(`[AUTOMATION] Executing workflow ${workflowId} with id ${execId}`);
    return execId;
  }
}
