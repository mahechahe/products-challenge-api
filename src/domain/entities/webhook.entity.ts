export class EventWompi {
  constructor(
    public event: string,
    public data: WompiData,
    public environment: string,
    public signature: WompiSignature,
    public timestamp: number,
    public sent_at: string,
  ) {}
}

class WompiData {
  constructor(public transaction: WompiTransaction) {}
}

class WompiTransaction {
  constructor(
    public id: string,
    public amount_in_cents: number,
    public reference: string,
    public customer_email: string,
    public currency: string,
    public payment_method_type: string,
    public redirect_url: string,
    public status: string,
    public shipping_address: null,
    public payment_link_id: null,
    public payment_source_id: null,
  ) {}
}

class WompiSignature {
  constructor(
    public properties: string[],
    public checksum: string,
  ) {}
}

export class ResponseWompi {
  constructor(
    public success: boolean,
    public message: string,
  ) {}
}
