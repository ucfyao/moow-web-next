"use client"  

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import slider from '../assets/images/banner_bp1.jpg'
import icon_ui2 from '../assets/images/icon-ui.png'
import Icon_down from '../assets/images/icon-down.png'
import Icon_tech1 from '../assets/images/icon-tech-pf1.png'
import Icon_tech2 from '../assets/images/icon-tech-pf2.png'
import Icon_tech3 from '../assets/images/icon-tech-pf3.png'
import Icon_tech4 from '../assets/images/icon-tech-pf4.png'


export default function Home() {
  return (
    <div>
      {/* <p>This is from src/app/page.tsx</p> */}

      {/* banner */}
      <div className="mt-[60px]">
        <Image
          src={slider}
          alt="Banner"
          width={1920}
          height={750}
          className="w-screen max-h-[30vh] object-cover"
        />
      </div>

      {/* flex box is directly used here as a draft. Refinement is needed. */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '300px'}}> 
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <div style={{ textAlign: 'center' }}>定投实盘数据</div>
          <button>去试试</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column'}}> 
          <div style={{ textAlign: 'center' }}>板砖实盘差价</div>
          <button>查看更多</button>
        </div>
      </div>

      <div className="my-10 px-2">
        {/* Market pain points & solutions */}
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col items-center justify-center space-y-2 px-8 py-4 mb-6 relative">
            <h2 className="text-3xl font-black text-center">Market Pain Points and Solutions</h2>
            <Image src={icon_ui2} alt="" width={149} height={14} />
          </div>
          <div className="w-full lg:w-[70%] mx-auto flex md:flex-col items-stretch justify-center md:items-center">
            <dl className="w-full flex flex-col md:flex-row justify-evenly items-center border-dashed border-2 border-[#ccc] px-4 lg:px-8 py-4 relative">
              <dt className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[whitesmoke] p-2">
                Problems
              </dt>
              <dd className="w-full md:w-[15%] text-sm bg-[#3273dc] text-white rounded-sm m-1 p-4 text-center">
                没有专业的交易策略
                <br />
                资产风险极高
              </dd>
              <dd className="w-full md:w-[15%] text-sm bg-[#3273dc] text-white rounded-sm m-1 p-4 text-center">
                手工交易效率低
                <br />
                容易出错
              </dd>
              <dd className="w-full md:w-[15%] text-sm bg-[#3273dc] text-white rounded-sm m-1 p-4 text-center">
                做不同币种的资产配置与
                <br />
                调仓手续费高
              </dd>
              <dd className="w-full md:w-[15%] text-sm bg-[#3273dc] text-white rounded-sm m-1 p-4 text-center">
                无法长时间持续盯盘
                <br />
                错过机会
              </dd>
            </dl>
            <div className="block my-auto px-2">
              <Image
                src={Icon_down}
                alt=""
                width={31}
                height={44}
                className="-rotate-90 md:mb-10 md:mt-1 md:rotate-0"
              />
            </div>
            <dl className="w-full flex flex-col md:flex-row justify-evenly items-center border-dashed border-2 border-[#ccc] px-4 lg:px-8 py-4 relative">
              <dt className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[whitesmoke] p-2">
                Solutions
              </dt>
              <dd className="w-full md:w-[15%] text-sm text-black border-r-2 border-[#eee] rounded-sm m-1 p-4 text-center">
                均摊成本，分散风险
              </dd>
              <dd className="w-full md:w-[15%] text-sm text-black border-r-2 border-[#eee] rounded-sm m-1 p-4 text-center">
                不需要看盘，不需要看 k 线，不要打听种种内幕
              </dd>
              <dd className="w-full md:w-[15%] text-sm text-black border-r-2 border-[#eee] rounded-sm m-1 p-4 text-center">
                自动化定投，省心还省力，克服人性弱点，拒绝追涨杀跌
              </dd>
              <dd className="w-full md:w-[15%] text-sm text-black rounded-sm m-1 p-4 text-center">
                定投指数，AI优选指数推荐
              </dd>
            </dl>
          </div>
        </div>

        {/* Why choose us */}
        <div className="w-full lg:w-[70%] mx-auto bg-white py-10 my-10 px-2">
          <div className="flex flex-col items-center justify-center space-y-2 px-8 py-4 mb-20 relative">
            <h2 className="text-3xl font-black text-center">Why Choose Us</h2>
            <Image src={icon_ui2} alt="" width={149} height={14} />
          </div>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:mx-6">
              <dl className="w-full flex flex-col md:flex-row justify-evenly items-center border-solid border-2 border-[#ccc] px-4 lg:px-8 py-4 relative">
                <dt className="absolute -top-9 left-1/2 transform -translate-x-1/2 px-2">
                  <Image src={Icon_tech1} alt="" width={69} height={69} />
                </dt>
                <dd className="text-sm my-6 p-4 text-center">
                  通过交易所使用apikey交易，并进行加密存储，安全放心
                </dd>
              </dl>
              <dl className="w-full flex flex-col md:flex-row justify-evenly items-center border-solid border-2 border-[#ccc] px-4 lg:px-8 py-4 relative">
                <dt className="absolute -top-9 left-1/2 transform -translate-x-1/2 px-2">
                  <Image src={Icon_tech2} alt="" width={69} height={69} />
                </dt>
                <dd className="text-sm my-6 p-4 text-center">
                  通过数学建模与机器学习训练AI程序实现最优策略的量化交易，多种策略选择，助你轻松定投
                </dd>
              </dl>
              <dl className="w-full flex flex-col md:flex-row justify-evenly items-center border-solid border-2 border-[#ccc] px-4 lg:px-8 py-4 relative">
                <dt className="absolute -top-9 left-1/2 transform -translate-x-1/2 px-2">
                  <Image src={Icon_tech3} alt="" width={69} height={69} />
                </dt>
                <dd className="text-sm my-6 p-4 text-center">
                  支持数家交易所，多币种，跨平台资产管理
                </dd>
              </dl>
              <dl className="w-full flex flex-col md:flex-row justify-evenly items-center border-solid border-2 border-[#ccc] px-4 lg:px-8 py-4 relative">
                <dt className="absolute -top-9 left-1/2 transform -translate-x-1/2 px-2">
                  <Image src={Icon_tech4} alt="" width={69} height={69} />
                </dt>
                <dd className="text-sm my-6 p-4 text-center">一键式资产托管，多维度的数据可视化</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Invest Button */}
        <div className="flex justify-center items-center">
          <Link href="/strategies">
            <button className="border-2 text-white bg-[#209cee] text-lg p-2 rounded-md">
              Invest Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
