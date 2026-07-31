import { IEventBus } from '@payment-os/event-bus';

export class SapAdapter {
  constructor(private bus: IEventBus) {
    this.subscribeToInternalEvents();
  }

  private subscribeToInternalEvents() {
    this.bus.subscribe('payment.domain.ledger.ledgerposted', async (event: any) => {
      // Translate LedgerPosted internal event to SAP FI Document
      const sapDocument = {
        DocType: 'SA',
        CompanyCode: '1000',
        PostingDate: event.payload.postedAt,
        Currency: 'USD',
        Entries: event.payload.entries.map((e: any) => ({
          GLAccount: e.accountId,
          Amount: e.amount,
          DCIndicator: e.type === 'CREDIT' ? 'H' : 'S'
        }))
      };

      // In production, send to SAP NetWeaver Gateway via OData or RFC
      // await axios.post('https://sap-gateway/sap/opu/odata/sap/API_OPENTRANS/', sapDocument)
    });
  }
}
