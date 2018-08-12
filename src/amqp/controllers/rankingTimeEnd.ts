class RankingTimeEnd {

  constructor() {

  }

  /**
   *
   * @param payload
   * @returns {Promise<boolean>}
   */
  public async process(payload: any): Promise<boolean> {
    console.log('processing RankingTimeEnd...');
    console.log(payload);



    return true;
  }
}

export default new RankingTimeEnd();
