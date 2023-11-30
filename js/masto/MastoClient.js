export default class MastoClient {
  domain;
  accountId;

  constructor(domain, accountId){
    this.domain = domain;
    this.accountId = accountId;
  }

  #getUrl(filter){
    const baseUrl = `${this.domain}/api/v1/accounts/${this.accountId}/statuses`;

    if(filter == {}){
      return baseUrl;
    }

    return `${baseUrl}?` + Object.entries(filter).map(function([key, value]){
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }).join("&");
  }

  async *fetchStatuses(filter={}){
    do {
      var page = await (await fetch(this.#getUrl(filter))).json();

      for(const status of page){
        filter.max_id = status.id;
        yield status;
      }
    } while(typeof filter.limit === 'undefined' && page.length > 0);
  }
}