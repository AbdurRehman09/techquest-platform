'use client'

import React from 'react';
import { Layout, Typography, Button } from "antd";
import { usePathname } from "next/navigation";

const { Header } = Layout;
const { Title } = Typography;

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  // Condition to check if the path is /signin or /signup
  const isAuthPage = pathname === "/signin" || pathname === "/signup";
  return (
    <Layout className="min-h-screen">
      {!isAuthPage &&(
        <Header className="bg-white flex items-center justify-between p-4 border-b">
        <Title level={4} className="m-0">TechQuest</Title>
        <div>
          <Button className="mr-2" style={{backgroundColor:"#c5e4f0"}}>Feedback</Button>
          <Button type="text">aizanaveed</Button>
        </div>
      </Header>)}
      {children}
      </Layout>
  );
};

export default ClientLayout;
