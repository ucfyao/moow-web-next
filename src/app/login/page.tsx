"use client"; 

import { Layout, Menu, MenuProps, Button, Form, Input } from "antd"; 
import { useState } from "react"; 
import { CSSProperties } from 'react';

const { Header, Footer, Sider, Content } = Layout; 

const menuItems: MenuProps['items'] = [
  {
    label: 'Home', 
    key: 'homepage', 
  },
  {
    label: 'Investment', 
    key: 'investment', 
  },
  {
    label: 'Arbitrage', 
    key: 'arbitrage',
  },
  {
    label: 'Market Data', 
    key: 'marketData', 
    children: [ // nested menu items 
      {
        label: 'Coins',
        key: 'coins',
 
      },
      {
        label: 'Exchanges', 
        key: 'exchanges',
      },
      {
        label: 'News',
        key: 'news',
      },
    ],
  },
];


const Login = (props: { style?: CSSProperties }) => {

  const [current, setCurrent] = useState('mail'); 
  console.log(current)

  const onMenuClick: MenuProps['onClick'] = (e) => {
    console.log('Menu clicked:', e); 
    setCurrent(e.key); 
  };

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
};

  return (
    <Layout>
      {/* NavBar is added in layout.
      However, Menu from antd shows a more compact coding snippet.
      Therefore, NavBar may be modified based on the code here.  */}
      
      {/* <div className='header flex items-center'>
        <Menu
          onClick={onMenuClick} 
          selectedKeys={[current]} 
          mode="horizontal" 
          items={menuItems} 
          style={{ flexGrow: 1 }}
        />
      </div> */}

      <Layout>
        <Content className="content flex items-center">
          <div className='absolute right-60 bg-white flex items-center justify-center px-6' 
                style={{
                  width: 500, 
                  height: 300, 
                  borderRadius: 16, 
          }}>
            <Form
              name="normal_login"
              className="login-form w-full "
              initialValues={{
                remember: true,
              }}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              onFinish={onFinish}
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  {
                    required: true,
                    message: 'Enter your username.'                        
                  },
                ]}
              >
                <Input placeholder="username" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your password.',
                  },
                ]}
              >
                <Input
                  type="password"
                  placeholder="password"
                />
              </Form.Item>

              <Form.Item className='flex justify-center'>
                <Button type="primary" htmlType="submit">
                  Login
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Content>
      </Layout>

    </Layout>
  );
};

export default Login; 
