export class Card {
  constructor(
    public number: string,
    public exp_month: string,
    public exp_year: string,
    public card_holder: string,
    public identification_client: string,
    public adress_client: string,
    public city_client: string,
    public email_client: string,
    public phone_client: string,
    public cvc: string,
  ) {}
}

export class Acceptance {
  constructor(
    public acceptance_token: string,
    public permalink: string,
    public type: string,
  ) {}
}

export class Token {
  constructor(
    public id: string,
    public createdAt: Date,
    public brand: string,
    public name: string,
    public lastFour: string,
    public bin: string,
    public expYear: string,
    public expMonth: string,
    public cardHolder: string,
    public expiresAt: Date,
  ) {}
}
