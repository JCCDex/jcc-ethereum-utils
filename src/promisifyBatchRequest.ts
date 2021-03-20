export default class PromisifyBatchRequest {
  private batch: any;
  private requests: any[];

  constructor(batchRequest: any) {
    this.batch = new batchRequest();
    this.requests = [];
  }

  add(_request, ...params) {
    const that = this;
    const request = new Promise((resolve, reject) => {
      that.batch.add(
        _request.call(null, ...params, (err, data) => {
          if (err) return reject(err);
          resolve(data);
        })
      );
    });
    this.requests.push(request);
  }

  async execute() {
    this.batch.execute();
    return await Promise.all(this.requests);
  }
}
