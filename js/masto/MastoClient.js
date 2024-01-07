export default class MastoClient {
  domain;
  accountId;

  constructor(domain, accountId){
    this.domain = domain;
    this.accountId = accountId;
  }

  #getUrl(path, params={}){
    const baseUrl = `${this.domain}/api/v1/${path}`;

    if(params == {}){
      return baseUrl;
    }

    return `${baseUrl}?` + Object.entries(params).map(function([key, value]){
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }).join("&");
  }

  #getAccountUrl(filter){
    return this.#getUrl(`accounts/${this.accountId}/statuses`, filter);
  }

  #getStatusContextUrl(statusId, filter={}){
    return this.#getUrl(`statuses/${statusId}/context`, filter);
  }

  async *fetchAccountStatuses(filter={}){
    do {
      var page = await (await fetch(this.#getAccountUrl(filter))).json();

      for(const status of page){
        filter.max_id = status.id;
        yield status;
      }
    } while(typeof filter.limit === 'undefined' && page.length > 0);
  }

  async fetchStatusContext(statusId){
    return await (await fetch(this.#getStatusContextUrl(statusId))).json();
  }
}