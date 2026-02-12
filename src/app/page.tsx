/** @jsxImportSource @emotion/react */
'use client';

import { Global, css } from '@emotion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const globalStyles = css`
  .clearfix {
    *zoom: 1;
  }

  .notification a:not {
    text-decoration: none;
  }

  .clearfix:after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    overflow: hidden;
    clear: both;
  }
  .home {
    padding-top: 26rem;
  }
  .swiper-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
  }
  .banner {
    position: relative;
    height: 30rem;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .banner2 {
    background-image: url('../assets/images/banner_bp2.jpg');
  }
  .banner3 {
    background-image: url('../assets/images/banner_bp3.jpg');
  }
  .banner1 {
    background-image: url('../assets/images/banner_bp1.jpg');
    img {
      width: 100%;
      // height:
    }
    .tangzhuan {
      position: absolute;
      left: 50%;
      top: 40%;
      color: #fff;
      font-size: 40px;
      transform: translate(-50%, -50%);
    }
    .info {
      position: absolute;
      left: 50%;
      top: 50%;
      font-size: 20px;
      color: #03bcc0;
      transform: translate(-50%, -50%);
    }
  }

  .display-bg {
    background: #fff;
  }

  .display-data {
    overflow: hidden;
    width: 1200px;
    margin: 0 auto;
    padding: 2rem 2rem 1rem 2rem;
  }

  .display-data .card {
    float: left;
    width: 48%;
    text-align: center;
    border-radius: 5px;
    box-shadow: none;
  }

  .display-data .card:last-child {
    float: right;
  }

  .display-data .card .button {
    font-size: 14px;
    margin: 1rem 0;
    padding-right: 2rem;
    padding-left: 2rem;
  }

  .display-data .title {
    text-align: center;
    padding: 1rem 0;
    margin: 0;
  }

  .display-data .arbitrage {
    min-height: 19.5rem;
  }

  .display-data .dingtou-line {
    min-height: 20.5rem;
  }

  .arbitrage .thead {
    overflow: hidden;
    font-weight: bolder;
  }

  .arbitrage .tbody {
    overflow: hidden;
    min-height: 17.2rem;
  }

  .arbitrage .thead p {
    background-color: #f8f8f9;
  }

  .arbitrage div p:last-child {
    border: 0;
  }

  .arbitrage .tbody > div {
    float: left;
    width: 100%;
    // padding: 0 3rem;
  }

  .arbitrage div p {
    float: left;
    width: 20%;
    text-align: center;
    padding: 0.4rem 0;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    // border-right: 1px solid #e9eaec;
  }
  .arbitrage .tbody p {
    line-height: 3;
  }

  .arbitrage .tbody div:nth-child(even) {
    background-color: #f8f8f9;
  }

  .arbitrage div .detail {
    width: 30%;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .is-selected {
    overflow: hidden;
    background-color: #f8f8f9;
  }

  h1.problem {
    text-align: center;
    font-size: 30px;
    font-weight: 900;
    padding: 20px;
    background: url('../assets/images/icon-ui.png') center bottom no-repeat;
    background-size: 149px 14px;
  }

  .c_container {
    width: 1200px;
    margin: 2rem auto 0;
  }
  .tech_pf {
    /*width: 100%;*/
    background: #fff;
  }
  .c_center {
    text-align: center;
  }
  .bgWhite {
    background: #ffffff;
  }
  .module_top_bg {
    background: url(../assets/images/icon-ui.png) bottom no-repeat;
    background-size: 154px 14px;
    padding: 2rem 0 1.5rem;
    margin: 0 0 30px;
    font-size: 30px;
    position: relative;
  }

  .module_top_bg2 {
    background-image: url(../assets/images/icon-ui2.png);
    position: relative;
  }

  .module_top_bg i {
    display: inline-block;
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: #fff;
    top: 0;
    left: 50%;
    margin: -11px 0 0 -11px;
    transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    -o-transform: rotate(45deg);
  }

  .pb_st {
    margin-top: 0.5rem;
  }

  .pb_st .ps_con {
    margin-top: 30px;
  }

  .pb_st .ps_box {
    border: 1px dashed #ccc;
    padding: 1rem;
  }
  .pb_st .problem {
    padding: 2rem 1rem;
  }
  .pb_st dl {
    position: relative;
    text-align: center;
  }

  .pb_st dl dt {
    position: absolute;
    top: -12px;
    left: 50%;
    margin-left: -50px;
    background-color: #f7f7f7;
    padding: 0 17px;
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: #2b2d3c;
    letter-spacing: 0.53px;
    line-height: 24px;
  }

  .pb_st dl dd {
    display: inline-block;
    box-sizing: border-box;
    width: 280px;
    font-size: 14px;
    line-height: 24px;
    margin: 0 3px;
    vertical-align: top;
  }

  .pb_st .problem {
  }

  .pb_st .problem dd {
    color: #fff;
    background: #3273dc;
    border-radius: 2px;
    font-family: PingFangSC-Regular;
    padding: 16px 0;
  }

  .pb_st .solutions dd {
    color: #333;
    padding: 30px 20px 5px;
    position: relative;
  }

  .pb_st .solutions dd:after {
    content: '';
    position: absolute;
    right: -3px;
    top: 0;
    bottom: 0;
    border-left: 1px solid #eee;
  }

  .pb_st .solutions dd:last-child:after {
    border-left: 0;
  }

  .pb_st .icon_down {
    width: 30px;
    display: block;
    margin: -1px auto 20px auto;
  }
  .pro_int {
    background: #f9fbfe;
    margin-top: 60px;
    padding-bottom: 70px;
  }

  .pro_int dl {
    float: left;
    width: 50%;
    box-sizing: border-box;
  }

  .pro_int dl:nth-of-type(1) {
    padding-right: 60px;
    border-right: 1px solid #ddd;
  }

  .pro_int dl:nth-of-type(2) {
    padding-left: 60px;
  }

  .pro_int dl dt {
    font-size: 16px;
    color: #59afe8;
    line-height: 28px;
    margin-bottom: 20px;
  }

  .pro_int dl dd {
    color: #666;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .pro_int dl dd b {
    display: inline-block;
    margin-bottom: 8px;
    color: #000;
    font-weight: 400;
  }

  .pro_int .flag_box {
    margin-top: 60px;
  }

  .pro_int .flag_box a {
    cursor: pointer;
    float: left;
    width: 220px;
    margin: 0 10px;
    text-align: center;
    color: #fff;
    line-height: 28px;
    padding: 14px 0;
    background: #59afe8;
    border-radius: 4px;
  }

  .pro_int .flag_box a:hover {
    background: #4fa3da;
  }

  .pro_int .flag_box a .icon {
    width: 32px;
    margin-right: 10px;
  }

  .pro_int .flag_box a > * {
    vertical-align: middle;
  }

  .pro_int .flag_box a.more {
    background: #768791;
  }

  .pro_int .flag_box a.more span:last-child {
    margin-left: 5px;
    font-size: 22px;
  }

  .pro_int .flag_box a.more:hover {
    background: #869caa;
  }

  .tech_pf dl {
    width: 498px;
    /*height: 90px;*/
    border: 1px solid #e5e7eb;
    padding: 50px 40px 30px;
    position: relative;
    display: inline-block;
    margin: 40px 0;
    vertical-align: top;
  }

  .tech_pf dl:nth-child(odd) {
    margin-left: 34px;
  }

  .tech_pf dl dt {
    width: 150px;
    height: 70px;
    position: absolute;
    top: -35px;
    left: 50%;
    margin-left: -75px;
    background: url(../assets/images/icon-tech-pf1.png) center no-repeat;
    background-size: contain;
  }

  .tech_pf dl:nth-child(3) dt {
    background-image: url(../assets/images/icon-tech-pf4.png);
  }

  .tech_pf dl:nth-child(4) dt {
    background-image: url(../assets/images/icon-tech-pf3.png);
  }

  .tech_pf dl:nth-child(5) dt {
    background-image: url(../assets/images/icon-tech-pf2.png);
  }

  .tech_pf dl dd {
    font-size: 14px;
    line-height: 22px;
    color: #4d4d4d;
  }

  .advisors {
    margin-top: 60px;
    background-color: #092a40;
    padding: 0 0 60px;
  }

  .advisors dl {
    width: 180px;
    height: 295px;
    padding: 35px 50px 20px;
    background-color: #0b334d;
    float: left;
    margin: 30px 10px 0;
    box-sizing: content-box;
  }

  .advisors dl:hover {
    background-color: #0d3f60;
  }

  .advisors dl dt {
    color: #03bcc0;
    background: url() top no-repeat;
    background-size: 100px 100px;
    padding-top: 120px;
    font-size: 20px;
    margin-bottom: 25px;
  }

  .advisors dl:nth-child(3) dt {
    /*background-image: url(../assets/images/img-jiangtao.png)*/
  }

  .advisors dl:nth-child(4) dt {
    /*background-image: url(../assets/images/img-shenbo.png)*/
  }

  .advisors dl:nth-child(5) dt {
    background-image: url(/common/images/index2/icon-zhai.png);
  }

  .advisors dl:nth-child(6) dt {
    /*background-image: url(../assets/images/img-tan.png)*/
  }

  .advisors dl:nth-child(7) dt {
    background-image: url(/common/images/index2/icon-shang.png);
  }

  .advisors dl dd {
    font-size: 14px;
    line-height: 20px;
    color: #fff;
    position: relative;
    text-align: left;
    margin: 5px 0;
  }

  .advisors dl dd:after {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    position: absolute;
    top: 9px;
    left: -12px;
    border-radius: 2px;
  }

  .investor {
    padding: 0 10px 40px;
  }

  .investor img {
    display: block;
    width: 270px;
    height: 100px;
    margin: 30px 20px 0 0;
    float: left;
  }

  .investor img:nth-child(4) {
    margin-right: 0;
  }

  .faq {
    background-color: #092a40;
    padding: 1px 0;
  }

  .faq dl {
    float: left;
    width: 380px;
    height: 240px;
    padding: 32px 20px;
    margin: 0 30px 30px 0;
    box-sizing: border-box;
    background: #0b334d;
    border-radius: 2px;
  }

  .faq dl:nth-of-type(3),
  .faq dl:nth-of-type(6) {
    margin-right: 0;
  }

  .faq dl dt {
    color: #03bcc0;
    margin-bottom: 16px;
  }

  .faq dl dd {
    color: #bae4ff;
  }

  .road_map {
    font-size: 12px;
    padding-bottom: 30px;
    background: url(../assets/images/map.jpg) center 25px repeat;
  }

  .road_map ul {
    line-height: 0;
  }

  .road_map ul li {
    box-sizing: content-box;
    width: 140px;
    height: 234px;
    padding: 0 5px;
    float: left;
    background: url(../assets/images/map-down2.png?v=2) center top no-repeat;
    background-size: 150px 131px;
    position: relative;
    vertical-align: top;
  }

  .road_map ul li span {
    display: block;
    width: 100%;
    line-height: 64px;
    position: absolute;
    left: 0;
    top: 0;
  }

  .road_map ul li p {
    width: 100%;
    line-height: 16px;
    text-align: left;
    color: #666;
    position: absolute;
    left: 0;
    top: 135px;
  }

  .road_map ul li:nth-child(2n) {
    background: url(../assets/images/map-up2.png?v=2) center bottom no-repeat;
    background-size: 150px 132px;
  }

  .road_map ul li:nth-child(2n) span {
    top: 170px;
  }

  .road_map ul li:nth-child(2n) p {
    bottom: 135px;
    top: auto;
  }

  @media screen and (max-width: 768px) {
    .banner {
      height: 15rem;
    }
    .home {
      padding-top: 12rem;
    }
    .display-data {
      width: 100%;
      padding: 0;
    }
    .display-data .card {
      width: 100%;
    }
    .c_container {
      width: 100%;
    }
    .pb_st .ps_con {
      position: relative;
    }

    .pb_st .ps_box {
      float: left;
      width: 46%;
      margin: 0 2%;
      padding: 10px;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
    }

    .pb_st dl dt {
      font-size: 12px;
      line-height: 18px;
      top: -9px;
    }

    .pb_st dl dd {
      width: 96%;
      font-size: 10px;
      margin: 0 0 10px;
      line-height: 14px;
      height: 88px;
      display: -webkit-box;
      -webkit-box-align: center;
      -webkit-box-pack: center;
    }

    .pb_st .icon_down {
      position: absolute;
      width: 14px;
      left: 50%;
      top: 48%;
      margin: -7px 0 0 -7px;
      transform: rotate(-90deg);
    }

    .pb_st .problem dd,
    .pb_st .solutions dd {
      padding: 10px 2%;
    }

    .pb_st .solutions dd:after {
      border-bottom: 1px solid #eee;
      border-left: 0;
      left: 0;
      right: 0;
      bottom: 0;
      top: auto;
    }

    .pb_st .solutions dd:last-child:after {
      border-bottom: 0;
    }

    .pro_int dl {
      width: 100%;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      padding: 0 10px;
    }

    .pro_int dl:nth-of-type(1) {
      padding-right: 10px;
      border-right: 0;
    }

    .pro_int dl:nth-of-type(2) {
      padding-left: 10px;
    }

    .pro_int .flag_box {
      margin-top: 20px;
    }

    .pro_int .flag_box a {
      width: 19%;
      margin: 0 0 0 1%;
      font-size: 7px;
      line-height: 18px;
      padding: 5px 0;
    }

    .pro_int .flag_box a:nth-child(3) {
      width: 26%;
    }

    .pro_int .flag_box a:last-child {
      width: 10%;
    }

    .pro_int .flag_box a .icon {
      width: 14px;
      margin-right: 2px;
    }

    .pro_int .flag_box a.more span:last-child {
      margin-left: 0;
      font-size: 10px;
    }
    .tech_pf dl {
      width: 90%;
      margin: 30px auto;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      height: auto;
      padding: 35px 15px 20px;
    }

    .tech_pf dl:last-child {
      margin-bottom: 0;
    }

    .tech_pf dl dt {
      width: 100px;
      height: 40px;
      top: -20px;
      margin-left: -50px;
    }

    .tech_pf dl:nth-child(odd) {
      margin-left: 0;
    }
    .advisors dl {
      width: 38%;
      height: 220px;
      padding: 3% 5%;
      background-color: #0b334d;
      float: left;
      margin: 10px 1% 0;
    }

    .advisors dl dt {
      background-size: 80px 80px;
      padding-top: 90px;
      font-size: 16px;
      margin-bottom: 15px;
    }

    .advisors dl dd {
      font-size: 10px;
      line-height: 14px;
      color: #fff;
      position: relative;
      text-align: left;
      margin: 5px 0;
    }

    .advisors dl dd:after {
      top: 5px;
      left: -10px;
    }

    .investor {
      padding: 0 0 20px;
    }

    .investor img {
      width: 46%;
      margin: 10px 2%;
      height: auto;
    }
    .road_map {
      position: relative;
      height: 1320px;
    }

    .road_map ul {
      width: 1220px;
      position: absolute;
      bottom: -210px;
      left: 50%;
      margin-left: -116px;
      transform: rotate(-90deg);
      transform-origin: 0 0;
    }

    .road_map ul li span,
    .road_map ul li p {
      transform: rotate(90deg);
    }

    .road_map ul li p {
      top: 160px;
      width: 100px;
      left: 20px;
    }

    .road_map ul li:nth-child(2n) p {
      bottom: 156px;
    }
    .faq dl {
      float: none;
      width: 96%;
      margin: 10px 2%;
      height: auto;
    }
  }
  .notification {
    text-align: center;
    padding: 2rem 1.5rem 2rem;
  }
  .notification .button {
    margin: 0 auto;
    font-size: 1.1rem;
    padding: 0.5rem 2.5rem;
    height: auto;
  }
`;

export default function Home() {
  const swiperParams = {
    modules: [Pagination, Autoplay],
    pagination: {
      el: '.swiper-pagination',
      dynamicBullets: true,
      clickable: true,
    },
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    loop: true,
  };

  return (
    <>
      {/* <Global styles={globalStyles} /> */}
      <div className="home">
        <section className="swiper-box">
            <Swiper {...swiperParams}>
              <SwiperSlide>
                <div className="banner banner1">
                   {/* <h5 className="tangzhuan">tangzhuan</h5> */}
                   {/* <p className="info">info</p> */}
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="banner banner2"></div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="banner banner3"></div>
              </SwiperSlide>
              <div className="swiper-pagination"></div>
            </Swiper>
          </section>
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
    </>
  );
}
