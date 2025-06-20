"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Container from "@/components/common/Container";
import { Tabs } from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetAllProductsQuery } from "@/redux/features/products/ProductAPI";

interface IConsole {
  admin: string;
  brand: string;
  condition: string;
  controller: string;
  description: string;
  images: string[];
  isVariant: boolean;
  memory: string;
  model: string;
  name: string;
  offer_price: number;
  price: number;
  product_type: string;
  quantity: number; 
  slug: string;
  _id: string;
}

export default function ConsoleSelector() {
  const [activeTab, setActiveTab] = useState("xbox");
  const { t } = useTranslation();
  const pathname = usePathname();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const { data: products } = useGetAllProductsQuery({
    product_type: activeTab,
    limit: 4,
  } as any);

  return (
    <div className='min-h-screen bg-[#F2F5F7]'>
      <div className='flex items-center justify-center pt-14 space-x-7 lg:space-x-9'>
        <hr className='flex-1 border-b-2 border-gray-300' />
        <h2
          className={`${
            pathname === "/"
              ? ""
              : "bg-[#FDFDFD] py-4 px-8 rounded-lg shadow-md"
          } text-[#101010] text-2xl md:text-5xl font-semibold text-center whitespace-nowrap`}
        >
          {t("consoleHeaderTitle")}
        </h2>
        <hr className='flex-1 border-b-2 border-gray-300' />
      </div>

      <div className='py-5'>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className='custom-tabs'
          items={[
            {
              key: "xbox",
              label: (
                <div className='group flex items-center justify-center'>
                  <div
                    className={`w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center transition-all group-hover:bg-tab1-radial ${
                      activeTab === "xbox"
                        ? "bg-tab1-radial"
                        : // ? "bg-gradient-to-r from-[#1B9E31] to-[#0E7A22]"
                          "bg-gradient-to-r from-[#ABABAB] to-[#CCCCCC]"
                    } bg-gradient-to-r from-gray-300 to-gray-400`}
                  >
                    <Image
                      src='/tab/xbox.svg'
                      alt='Xbox'
                      width={55}
                      height={55}
                      className='text-white'
                    />
                  </div>
                </div>
              ),
              children: (
                <div
                  className={`p-3 pb-12 md:pb-20 ${
                    activeTab === "xbox" ? "bg-[#63b95d]" : ""
                  }`}
                >
                  <Container className='w-[98%] mx-auto'>
                    <div className='flex items-center py-3 space-x-4 lg:space-x-7'>
                      <h2 className='text-2xl lg:text-5xl font-bold text-[#FDFDFD] pt-4 mb-8'>
                        Xbox
                      </h2>
                      <hr className='flex-1 border-b-4 border-gray-100 -mt-4' />
                    </div>
                    <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-8'>
                      {products?.data?.products?.length < 1 && (
                        <p className='text-lg text-white'>No Xbox found!</p>
                      )}
                      {products?.data?.products?.map((console: IConsole) => (
                        <Link
                          href={`/buy/${console?.slug}`}
                          key={console._id}
                          className='bg-white hover:bg-gray-200 rounded-lg overflow-hidden shadow-sm'
                        >
                          <div className='relative w-full aspect-square p-1.5 md:p-0'>
                            <img
                              src={`${API_URL}${console.images[0]}`}
                              alt={console?.name}
                              className='w-full aspect-square rounded-t-lg bg-cover bg-center'
                              style={{
                                backgroundImage: `url('/sell/${console?.product_type}-sq.jpeg')`,
                              }}
                            />
                          </div>
                          <div className='p-2 pt-0 md:p-4'>
                            <div className='flex justify-between items-start'>
                              <div>
                                <h3 className='font-semibold text-[#101010] text-base mb-0 lg:mb-2.5'>
                                  {console?.name} {console?.model}
                                </h3>
                                <p className='text-[#2B2B2B] text-xs md:text-base space-x-1'>
                                  Starting from
                                  <span className='text-[#00B67A] text-xs md:text-lg font-medium leading-'>
                                    {" "}
                                    ${console?.offer_price}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </Container>
                </div>
              ),
            },
            {
              key: "playstation",
              label: (
                <div className='group flex items-center justify-center'>
                  <div
                    className={`w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center transition-all group-hover:bg-tab2-radial ${
                      activeTab === "playstation"
                        ? "bg-tab2-radial"
                        : "bg-gradient-to-r from-[#ABABAB] to-[#CCCCCC]"
                    } hover:bg-gradient-to-r hover:from-[#023993] hover:to-[#0050D4]`}
                  >
                    <Image
                      src='/tab/playstation.svg'
                      alt='PlayStation'
                      width={60}
                      height={60}
                      className='text-white'
                    />
                  </div>
                </div>
              ),
              children: (
                <div className='p-3 pb-12 md:pb-20 bg-[#1761bf]'>
                  <Container className='w-[98%] mx-auto'>
                    <div className='flex items-center py-3 space-x-4 lg:space-x-7'>
                      <h2 className='text-2xl lg:text-5xl font-bold text-[#FDFDFD] pt-4 mb-8'>
                        Playstation
                      </h2>
                      <hr className='flex-1 border-b-4 border-gray-100 -mt-4' />
                    </div>
                    <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-8'>
                      {products?.data?.products?.length < 1 && (
                        <p className='text-lg text-white'>
                          No Playstation found!
                        </p>
                      )}
                      {products?.data?.products?.map((console: IConsole) => (
                        <Link
                          href={`/buy/${console?.slug}`}
                          key={console._id}
                          className='bg-white hover:bg-gray-200 rounded-lg overflow-hidden shadow-sm'
                        >
                          {/* <div className='relative w-full h-[153px] lg:h-[387px] p-1.5 md:p-0'> */}
                          <div className='relative w-full h lg:h-[387px] p-1.5 md:p-0'>
                            <img
                              src={`${API_URL}${console.images[0]}`}
                              alt={console?.name}
                              className='w-full aspect-square rounded-t-lg bg-cover bg-center'
                              style={{
                                backgroundImage: `url('/sell/${console?.product_type}-sq.jpeg')`,
                              }}
                            />
                          </div>
                          <div className='p-2 pt-0 md:p-4'>
                            <div className='flex justify-between items-start'>
                              <div>
                                <h3 className='font-semibold text-[#101010] text-base'>
                                  {console.name} {console.model}
                                </h3>
                                <p className='text-[#2B2B2B] text-xs md:text-base space-x-1 md:mb-2'>
                                  Starting from
                                  <span className='text-[#00B67A] text-xs md:text-lg font-medium'>
                                    {" "}
                                    ${console?.offer_price}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </Container>
                </div>
              ),
            },
            {
              key: "nintendo",
              label: (
                <div className='group flex items-center justify-center w-max mx-auto'>
                  <div
                    className={`w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center transition-all group-hover:bg-tab3-radial ${
                      activeTab === "nintendo"
                        ? "bg-tab3-radial"
                        : "bg-gradient-to-r from-[#ABABAB] to-[#CCCCCC]"
                    }`}
                  >
                    <Image
                      src='/tab/nintendo2.svg'
                      alt='Nintendo'
                      width={75}
                      height={160}
                      className='text-white'
                    />
                  </div>
                </div>
              ),
              children: (
                <div className='p-3 pb-12 md:pb-20 bg-[#f34040]'>
                  <Container className='w-[98%] mx-auto'>
                    <div className='flex items-center py-3 space-x-4 lg:space-x-7'>
                      <h2 className='text-2xl lg:text-5xl font-bold text-[#FDFDFD] pt-4 mb-8'>
                        Nintendo
                      </h2>
                      <hr className='flex-1 border-b-4 border-gray-100 -mt-4' />
                    </div>
                    <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-8'>
                      {products?.data?.products?.length < 1 && (
                        <p className='text-lg text-white'>No Nintendo found!</p>
                      )}
                      {products?.data?.products?.map((console: IConsole) => (
                        <Link
                          href={`/buy/${console?.slug}`}
                          key={console._id}
                          className='bg-white rounded-lg overflow-hidden shadow-sm'
                        >
                          {/* <div className='relative w-full h-[153px] lg:h-[387px] p-1.5 md:p-0'> */}
                          <div className='relative w-full h lg:h-[387px] p-1.5 md:p-0'>
                            <img
                              src={`${API_URL}${console.images[0]}`}
                              alt={console?.name}
                              className='w-full aspect-square rounded-t-lg bg-cover bg-center'
                              style={{
                                backgroundImage: `url('/sell/${console?.product_type}-sq.jpeg')`,
                              }}
                            />
                          </div>
                          <div className='p-2 pt-0 md:p-4'>
                            <div className='flex justify-between items-start mb-2'>
                              <div>
                                <h3 className='font-semibold text-[#101010] text-base'>
                                  {console.name} {console.model}
                                </h3>
                                <p className='text-[#2B2B2B] text-xs md:text-base space-x-1 md:mb-2'>
                                  Starting from
                                  <span className='text-[#00B67A] text-xs md:text-lg font-medium'>
                                    {" "}
                                    ${console?.offer_price}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </Container>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
