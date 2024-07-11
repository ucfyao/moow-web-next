'use client';
// const signupStyle = css``

export default function Home() {
  return (
    <div className="home">
      <div className="display-bg">
        <div className="display-data">
          <div className="card">
            <h6
              className="title is-6"
              style={{
                paddingBottom: 0,
              }}
            >
              定投实盘数据
            </h6>
            <div className="dingtou-line" id="line-container"></div>
          </div>
          <div className="card">
            <h6 className="title is-6">搬砖实盘价差</h6>
            <div className="arbitrage is-fullwidth">
              <div className="thead">
                <p>交易对</p>
                <p className="detail">价格</p>
                <p className="detail">卖出</p>
                <p>价差(DIFF%)</p>
              </div>
              <div className="tbody">
                <div v-for="item in arbitrageList"></div>
                <div
                  style={{
                    lineHeight: '8rem',
                  }}
                >
                  暂无数据
                </div>
              </div>
              <a href="/hq/arbitrage">
                <div className="button is-info">查看更多</div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="pb_st c_container c_center">
        <h1 className="title problem">市场痛点与解决方案</h1>
        <div className="ps_con clearfix">
          <dl className="ps_box problem">
            <dt>市场痛点</dt>
            <dd>
              没有专业的交易策略
              <br />
              资产风险极高
            </dd>
            <dd>
              手工交易效率低
              <br />
              容易出错
            </dd>
            <dd>
              做不同币种的资产配置与调仓
              <br />
              手续费高
            </dd>
            <dd>
              无法长时间持续盯盘
              <br />
              错过机会
            </dd>
          </dl>
          {/* <Image src="../assets/images/icon-down.png" alt="" className="icon_down" /> */}
          <dl className="ps_box solutions">
            <dt>解决方案</dt>
            <dd>均摊成本，分散风险</dd>
            <dd>不需要看盘，不需要看 k 线，不要打听种种内幕</dd>
            <dd>自动化定投，省心还省力，克服人性弱点，拒绝追涨杀跌</dd>
            <dd>定投指数，AI优选指数推荐</dd>
          </dl>
        </div>
      </div>

      <div className="tech_pf c_container c_center ">
        <div className="module_top_bg">为什么选择我们</div>
        <dl>
          <dt></dt>
          <dd>
            通过交易所使用apikey交易，并进行加密存储，安全放心
            <br />
            &nbsp;
          </dd>
        </dl>
        <dl>
          <dt></dt>
          <dd>
            通过数学建模与机器学习训练AI程序实现最优策略的量化交易，多种策略选择，助你轻松定投
          </dd>
        </dl>
        <dl>
          <dt></dt>
          <dd>
            支持数家交易所，多币种，跨平台资产管理
            <br />
            &nbsp;
          </dd>
        </dl>
        <dl>
          <dt></dt>
          <dd>
            一键式资产托管，多维度的数据可视化
            <br />
            &nbsp;
          </dd>
        </dl>
      </div>
      <div className="notification">
        <div className="button is-info is-medium">去定投</div>
      </div>
    </div>
  );
}
