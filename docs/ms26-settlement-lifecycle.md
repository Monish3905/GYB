# Settlement Lifecycle
1. SUBMITTED: Payload sent to PSP.
2. ACCEPTED: PSP acknowledged receipt.
3. PROCESSING: PSP executing network transfer (IMPS/NEFT/RTGS).
4. COMPLETED: Final success.
5. FAILED/RETURNED/REVERSED: Unsuccessful states.
6. UNKNOWN: Crash or timeout. Requires explicit external status check. DO NOT RETRY BLINDLY.
