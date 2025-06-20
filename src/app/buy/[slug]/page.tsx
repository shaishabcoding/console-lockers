/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import ReviewCarousel from "@/components/share/review-carousel/ReviewCarousel";
import Container from "@/components/common/Container";
import { BlogCarousel } from "@/components/home/blogs/BlogCarousel";
import ConsoleModal from "@/components/modal/Modal";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "@/redux/features/modal/modalSlice";

import ProductSpecification from "@/components/product/ProductSpecification";
import ProductDescription from "@/components/product/ProductDescription";
import Link from "next/link";
import { showTradeInDescription } from "@/redux/features/tradeIn/showTradeInSlice";
import { useTranslation } from "react-i18next";
import { RootState } from "@/redux/store/store";
import {
  useFindSlugProductQuery,
  useGetSingleProductQuery,
} from "@/redux/features/products/ProductAPI";
import Loading from "@/app/loading";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { modifiedCart } from "@/redux/features/cart/TrackCartItem";

interface RelatedProduct {
  _id: string;
  name: string;
  condition: string;
  price: string;
  images: [number];
  brand: string;
  slug: string;
  product_type: string;
  model: string;
}

interface ModalTradeInData {
  productName: string;
  productPrice: number;
}

const ProductDetailsPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedController, setSelectedController] = useState<string>("");
  const [selectedMemory, setSelectedMemory] = useState<string>("");
  const [selectedCondition, setSelectedCondition] = useState<string>("");
  const dispatch = useDispatch();
  const modalState = useSelector((state: RootState) => state?.modal?.modal);
  const isOpenTradeIn = useSelector(
    (state: RootState) => state?.showTradeInData?.isOpenTradeIn
  );

  const modalTradeInData: ModalTradeInData | null = useSelector(
    (state: RootState) =>
      state?.modalTradeInDataSlice?.modalTradeInData as ModalTradeInData | null
  );

  const { t } = useTranslation();
  const params = useParams();
  const [slug, setSlug] = useState(params.slug);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const {
    data: singleProduct,
    isLoading,
    isError,
  } = useGetSingleProductQuery({
    slug: slug as string | undefined,
  });

  const { data: slugRes } = useFindSlugProductQuery({
    productName: singleProduct?.data?.product?.name,
    condition: selectedCondition,
    controller: selectedController,
    memory: selectedMemory,
    model: selectedModel,
  });

  useEffect(() => {
    if (!singleProduct?.data?.product?.slug || !slugRes?.data?.slug) return;

    if (singleProduct?.data?.product?.slug !== slugRes?.data?.slug) {
      setSlug(slugRes?.data?.slug);
      window.history.pushState(null, "", slugRes?.data?.slug);
    }
  }, [slugRes]);

  useEffect(() => {
    setSelectedModel(singleProduct?.data?.product?.model);
    setSelectedController(singleProduct?.data?.product?.controller);
    setSelectedMemory(singleProduct?.data?.product?.memory);
    setSelectedCondition(singleProduct?.data?.product?.condition);
  }, [singleProduct]);

  if (isLoading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (isError) return <div>Error Occur!</div>;

  const product = singleProduct?.data;
  const productType = singleProduct?.data?.product?.product_type as string;

  const handleTrade = () => {
    dispatch(toggleModal());
  };

  const startOver = () => {
    dispatch(toggleModal());
    dispatch(showTradeInDescription());
  };

  const handleAddToCart = () => {
    dispatch(modifiedCart({}));

    const existingCart = JSON.parse(localStorage?.getItem("cart") || "[]");

    const newProduct = {
      productId: product?.product?._id,
      quantity: 1,
      tradeIn: modalTradeInData || null,
    };

    // Check if the productId already exists to prevent duplicates
    interface CartItem {
      productId: string;
      quantity: number;
      tradeIn: any;
    }

    const isDuplicate: boolean = existingCart.some(
      (item: CartItem) => item.productId === newProduct.productId
    );

    if (isDuplicate) {
      const updatedCart = existingCart.map((item: CartItem) => {
        if (item.productId === newProduct.productId) {
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }
        return item;
      });
      localStorage?.setItem("cart", JSON.stringify(updatedCart));
    }

    if (!isDuplicate) {
      toast.success("Product added to cart successfully!");
      existingCart.push(newProduct); // Add new product
      localStorage?.setItem("cart", JSON.stringify(existingCart)); // Save updated cart
    }

    router.push("/cart");
  };

  return (
    <div>
      {/* only for desktop */}
      <div
        className={`hidden md:block py-16 
        ${product?.product?.product_type === "xbox" && "bg-[#2BA33B]"}  
        ${product?.product?.product_type === "playstation" && "bg-[#004BAF]"}
        ${product?.product?.product_type === "nintendo" && "bg-[#D61D1E]"}
        `}
      >
        <Container>
          <div className='hidden md:block'>
            <div className='flex flex-col lg:flex-row gap-8'>
              <div className='xl:w-1/2 relative' style={{ overflow: "hidden" }}>
                <img
                  src={`${API_URL}${product?.product?.images[0]}`}
                  alt={product?.product?.name}
                  className='rounded-lg w-full aspect-square bg-cover bg-center'
                  style={{
                    backgroundImage: `url('/sell/${product?.product?.product_type}-sq.jpeg')`,
                  }}
                />
              </div>

              <div className='xl:w-1/2'>
                <div className='flex justify-between items-center mb-2.5'>
                  <div className='flex flex-col gap-3'>
                    <h1 className='text-3xl lg:text-[40px] text-[#FDFDFD] font-semibold'>
                      {product?.product?.name}
                    </h1>
                    <p className='text-[#FDFDFD] text-lg mb-2 flex items-center justify-between'>
                      {" "}
                      {selectedModel} | {selectedMemory} | Black{" "}
                    </p>
                  </div>
                  <div className='flex flex-col gap-3 items-end'>
                    <h2 className='text-2xl lg:text-5xl font-semibold text-[#FDFDFD]'>
                      €
                      {product?.product?.offer_price ?? product?.product?.price}
                    </h2>
                    <p className='text-lg text-[#FDFDFD]'>incl. tax</p>
                  </div>
                </div>

                {/* reviews */}
                <div className='flex items-center gap-2.5 mb-6'>
                  <p className='flex items-center gap-1'>
                    {[...Array(Math.round(product?.product?.ratings))].map(
                      (v) => (
                        <svg
                          key={v}
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <rect width='24' height='24' fill='#00B67A' />
                          <path
                            d='M11.2392 7.14165C11.4787 6.4046 12.5214 6.40461 12.7609 7.14165L13.6166 9.77509C13.7237 10.1047 14.0309 10.3279 14.3774 10.3279H17.1464C17.9214 10.3279 18.2436 11.3196 17.6166 11.7751L15.3765 13.4026C15.0961 13.6064 14.9788 13.9675 15.0859 14.2971L15.9415 16.9305C16.181 17.6676 15.3374 18.2805 14.7104 17.8249L12.4703 16.1974C12.1899 15.9937 11.8102 15.9937 11.5299 16.1974L9.28972 17.8249C8.66275 18.2805 7.81917 17.6676 8.05865 16.9305L8.9143 14.2971C9.0214 13.9675 8.90408 13.6064 8.62369 13.4026L6.38355 11.7751C5.75658 11.3196 6.0788 10.3279 6.85378 10.3279H9.62274C9.96932 10.3279 10.2765 10.1047 10.3836 9.77509L11.2392 7.14165Z'
                            fill='#FDFDFD'
                          />
                        </svg>
                      )
                    )}
                  </p>
                  <h2 className='font-medium text-[#FDFDFD]'>
                    {product?.product?.ratings}
                  </h2>
                  <Link href={`/reviews?productName=${product?.product?.name}`}>
                    <p className='underline text-[#FDFDFD]'>
                      ({product?.product?.reviewCount} reviews)
                    </p>
                  </Link>
                </div>

                {/* Model */}
                <div className='mb-6'>
                  <h4 className='text-2xl font-semibold text-[#FDFDFD] mb-2'>
                    {singleProduct?.data?.product?.modelLabel}
                  </h4>
                  <div className='flex flex-wrap gap-4'>
                    {product?.meta?.models?.map(
                      ({ model, price }: Record<string, any>) => (
                        <button
                          key={model}
                          disabled={selectedModel === model}
                          className={`w-[110px] gap-3 md:w-[200px] 2xl:w-[256px] lg:flex-none flex flex-col items-center justify-center lg:px-4 py-5 border-4 rounded-md ${
                            selectedModel === model
                              ? `${
                                  productType === "xbox" ? "text-[#3BAE3B]" : ""
                                }
                              ${
                                productType === "playstation"
                                  ? "text-[#1861C0]"
                                  : ""
                              }
                              ${
                                productType === "nintendo"
                                  ? "text-[#D61D1E]"
                                  : ""
                              }
                              
                              bg-[#FDFDFD] cursor-not-allowed border-transparent`
                              : "text-[#FDFDFD]"
                          }`}
                          onClick={() => setSelectedModel(model)}
                        >
                          <span className='text-2xl font-semibold'>
                            {model}
                          </span>
                          {selectedModel === model ? (
                            <Check />
                          ) : (
                            <span>{price}</span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className='bg-[#daedf2] w-full p-6 rounded-lg border-l-4 border-black'>
                  <div className='flex flex-wrap gap-2 mb-2'>
                    <p className='text-[#6B6B6B]'>
                      <span className='text-base text-[#101010] font-normal'>
                        {t("model")}:{" "}
                      </span>
                      {singleProduct?.data?.product?.modelDes}
                    </p>
                  </div>
                  {/* <p className="text-[#2E7EF6] text-base font-medium underline cursor-pointer">
                    Learn more
                  </p> */}
                </div>

                {/* Controller */}
                <div className='mb-6 mt-3'>
                  <h4 className='text-2xl font-semibold text-[#FDFDFD] mb-2'>
                    {singleProduct?.data?.product?.controllerLabel}
                  </h4>
                  <div className='flex flex-wrap gap-4'>
                    {product?.meta?.controllers?.map(
                      ({ controller, price }: Record<string, any>) => (
                        <button
                          key={controller}
                          disabled={selectedController === controller}
                          className={`w-[110px] gap-3 md:w-[200px] 2xl:w-[256px] lg:flex-none flex flex-col items-center justify-center lg:px-4 py-5 border-4 rounded-md ${
                            selectedController === controller
                              ? `${
                                  productType === "xbox" ? "text-[#3BAE3B]" : ""
                                }
                              ${
                                productType === "playstation"
                                  ? "text-[#1861C0]"
                                  : ""
                              }
                              ${
                                productType === "nintendo"
                                  ? "text-[#D61D1E]"
                                  : ""
                              }
                              
                              bg-[#FDFDFD] cursor-not-allowed border-transparent`
                              : "text-[#FDFDFD]"
                          }`}
                          onClick={() => setSelectedController(controller)}
                        >
                          <span className='text-2xl font-semibold'>
                            {controller}
                          </span>
                          {selectedController === controller ? (
                            <Check />
                          ) : (
                            <span>{price}</span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className='bg-[#daedf2] w-full p-6 rounded-lg border-l-4 border-black mb-6'>
                  <div className='flex flex-wrap gap-2 mb-2'>
                    <p className='text-[#6B6B6B]'>
                      <span className='text-base text-[#101010] font-normal'>
                        {t("controller")}:{" "}
                      </span>
                      {singleProduct?.data?.product?.controllerDes}
                    </p>
                  </div>
                </div>

                {/* Memory */}
                <div className='mb-6'>
                  <h4 className='text-2xl font-semibold text-[#FDFDFD] mb-2'>
                    {singleProduct?.data?.product?.memoryLabel}
                  </h4>
                  <div className='flex flex-wrap gap-4'>
                    {product?.meta?.memorys?.map(
                      ({ memory, price }: Record<string, any>) => (
                        <button
                          key={memory}
                          disabled={selectedMemory === memory}
                          className={`w-[110px] gap-3 md:w-[200px] 2xl:w-[256px] lg:flex-none flex flex-col items-center justify-center lg:px-4 py-5 border-4 rounded-md ${
                            selectedMemory === memory
                              ? `${
                                  productType === "xbox" ? "text-[#3BAE3B]" : ""
                                }
                              ${
                                productType === "playstation"
                                  ? "text-[#1861C0]"
                                  : ""
                              }
                              ${
                                productType === "nintendo"
                                  ? "text-[#D61D1E]"
                                  : ""
                              }
                              
                              bg-[#FDFDFD] cursor-not-allowed border-transparent`
                              : "text-[#FDFDFD]"
                          }`}
                          onClick={() => setSelectedMemory(memory)}
                        >
                          <span className='text-2xl font-semibold'>
                            {memory}
                          </span>
                          {selectedMemory === memory ? (
                            <Check />
                          ) : (
                            <span>{price}</span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className='bg-[#daedf2] w-full p-6 rounded-lg border-l-4 border-black mb-6'>
                  <div className='flex flex-wrap gap-2 mb-2'>
                    <p className='text-[#6B6B6B]'>
                      <span className='text-base text-[#101010] font-normal'>
                        {t("memory")}:{" "}
                      </span>
                      {singleProduct?.data?.product?.memoryDes}
                    </p>
                  </div>
                </div>

                {/* Conditions */}
                <div className='mb-6'>
                  <h4 className='text-2xl font-semibold text-[#FDFDFD] mb-2'>
                    {singleProduct?.data?.product?.conditionLabel}
                  </h4>
                  <div className='flex flex-wrap gap-4'>
                    {product?.meta?.conditions?.map(
                      ({ condition, price }: Record<string, any>) => (
                        <button
                          key={condition}
                          disabled={selectedCondition === condition}
                          className={`w-[110px] gap-3 md:w-[200px] 2xl:w-[256px] lg:flex-none flex flex-col items-center justify-center lg:px-4 py-5 border-4 rounded-md ${
                            selectedCondition === condition
                              ? `${
                                  productType === "xbox" ? "text-[#3BAE3B]" : ""
                                }
                              ${
                                productType === "playstation"
                                  ? "text-[#1861C0]"
                                  : ""
                              }
                              ${
                                productType === "nintendo"
                                  ? "text-[#D61D1E]"
                                  : ""
                              }
                              bg-[#FDFDFD] cursor-not-allowed border-transparent`
                              : "text-[#FDFDFD]"
                          }`}
                          onClick={() => setSelectedCondition(condition)}
                        >
                          <span className='text-2xl font-semibold'>
                            {condition}
                          </span>
                          {selectedCondition === condition ? (
                            <Check />
                          ) : (
                            <span>{price}</span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className='bg-[#daedf2] w-full p-6 rounded-lg border-l-4 border-black mb-6'>
                  <div className='flex flex-wrap gap-2 mb-2'>
                    <p className='text-[#6B6B6B]'>
                      <span className='text-base text-[#101010] font-normal'>
                        {t("condition")}:{" "}
                      </span>
                      {singleProduct?.data?.product?.conditionDes}
                    </p>
                  </div>
                </div>

                {/* Trade-in */}
                <div className='mb-6'>
                  {!isOpenTradeIn ? (
                    <>
                      <h4 className='text-2xl font-semibold text-[#FDFDFD] mb-2'>
                        {t("tradeIn")}:
                      </h4>
                      <button
                        className={`w-[120px] text-[#FDFDFD] md:w-[200px] 2xl:w-[256px] h-[91px] lg:h-[111px] lg:flex-none flex flex-col items-center justify-center lg:px-20 sm:px-10  py-8 border-4 rounded-md ${
                          modalState
                            ? "border-black bg-[#E7E7E7] border-transparent"
                            : "border-gray-300"
                        }`}
                        onClick={() => {
                          handleTrade();
                        }}
                      >
                        {modalState ? "No" : "Yes"}
                      </button>
                    </>
                  ) : (
                    <div>
                      {/* Conditions Box */}
                      <div className='bg-[#f0f7ff] p-4 rounded-lg mb-6'>
                        <p className='text-gray-600 mb-2'>
                          <span className='font-medium text-gray-900'>
                            Conditions:
                          </span>{" "}
                          The phone will have heavy signs of wear, such as
                          deeper scratches, dents and other marks. The phone is
                          unlocked, fully tested and works like new.
                        </p>
                        <button className='text-blue-600 hover:underline text-sm'>
                          Learn More
                        </button>
                      </div>

                      {/* Trade-in Header */}
                      <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-xl font-semibold text-[#FDFDFD]'>
                          Trade-in
                        </h2>

                        <button
                          onClick={() => startOver()}
                          className='flex items-center text-[#FDFDFD] transition-colors'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            strokeWidth={1.5}
                            stroke='currentColor'
                            className='w-5 h-5 mr-2'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
                            />
                          </svg>
                          {t("startOver")}
                        </button>
                      </div>

                      {/* Value Display */}
                      <div className='bg-[#e8f7f1] p-4 rounded-lg mb-6'>
                        <div className='flex items-start justify-start gap-2'>
                          <button className='text-gray-600 hover:text-gray-900 transition-colors'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 24 24'
                              strokeWidth={1.5}
                              stroke='currentColor'
                              className='w-5 h-5'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
                              />
                            </svg>
                          </button>
                          <p className='text-center text-gray-600'>
                            yOUR {modalTradeInData?.productName} IS VALUED AT €
                            {modalTradeInData?.productPrice ?? 0}
                          </p>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className='text-gray-200 border-l-4 border-black rounded-s-lg'>
                        <p className='p-3'>
                          After trade-in price estimate. We will ship the free
                          trade-in kit to your home address and refund the
                          trade-in value within 2-3 business days from receiving
                          the phone.
                        </p>
                      </div>

                      <div className='my-4 border-b'></div>
                    </div>
                  )}
                </div>

                <div className='flex justify-between items-center mb-6'>
                  <p className='text-[#FDFDFD] text-[18px] font-medium flex items-center justify-between'>
                    {selectedModel} | {selectedMemory} | Black
                  </p>
                  <div>
                    <h2 className='text-2xl font-semibold text-[#FDFDFD]'>
                      {product?.product?.offer_price ?? product?.product?.price}
                    </h2>
                    <span className='text-sm text-[#FDFDFD]'>incl. tax</span>
                  </div>
                </div>

                <div className='mb-6'>
                  <h4 className='font-normal mb-2 text-[#FDFDFD]'>
                    {t("pleaseSelectYourConsole")}
                  </h4>

                  <div className='relative w-full'>
                    <select
                      name='phoneCode'
                      // value={formData.phoneCode}
                      // onChange={(e) => handleInputChange(e as any)}
                      className='px-4 py-3 border rounded-3xl  bg-white text-sm sm:text-base appearance-none w-full'
                    >
                      <option value='' defaultValue={"Choose a console"}>
                        {t("chooseAConsole")}
                      </option>
                      {/* {consoleLists?.data?.products?.map((console: any) => (
                    
                  ))} */}
                      <option>Xbox</option>
                      <option>Playstation</option>
                      <option>Nintendo</option>
                    </select>

                    <div className='absolute inset-y-0 right-0 flex items-center px-3'>
                      <svg
                        className='w-6 h-6 text-gray-500'
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                        aria-hidden='true'
                      >
                        <path
                          fillRule='evenodd'
                          d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className='flex flex-col gap-4 space-y-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-[#DAEDF2] p-3 rounded-md'>
                      <Image
                        src='/sell/ship-ready.svg'
                        width={20}
                        height={20}
                        alt='usb'
                      />
                    </div>
                    <h2 className='text-base font-medium text-[#FDFDFD]'>
                      Ready to be shipped.
                    </h2>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className={`h-14 flex items-center justify-center bg-black text-white text-center px-6 py-3 rounded-md`}
                  >
                    {t("addToCart")}
                  </button>
                </div>
              </div>
            </div>

            {/* related products */}
            <div className='mt-16'>
              <h3 className='text-[32px] font-semibold mb-10 text-[#FDFDFD]'>
                You may also like
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                {singleProduct?.data?.relatedProducts
                  ?.slice(0, 4)
                  .map((product: RelatedProduct) => (
                    <Link
                      key={product._id}
                      href={`/buy/${product?.slug}`}
                      className='rounded-lg'
                      passHref
                    >
                      <div className='bg-[#FDFDFD] hover:shadow-md border border-gray-100 rounded-lg pb-2'>
                        <img
                          src={`${API_URL}${product.images[0]}`}
                          alt={product?.name}
                          className='w-full aspect-square rounded-t-lg bg-cover bg-center'
                          style={{
                            backgroundImage: `url('/sell/${product?.product_type}-sq.jpeg')`,
                          }}
                        />
                        <div className='px-3'>
                          <h3 className='text-xl text-[#101010] font-semibold mb-2 mt-5'>
                            {product?.name} {product?.model}
                          </h3>
                          <div className='flex items-center gap-3 text-[#2B2B2B] mb-4'>
                            <div className='flex items-center gap-2'>
                              <p className='text-[#2B2B2B] text-base'>Price:</p>
                              <span className='text-[#00B67A] text-lg font-semibold'>
                                {product.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>

            <ProductSpecification />
            <ProductDescription />

            {/* {tradeIn && <ConsoleModal  />} */}
            {modalState && <ConsoleModal />}

            {/* <ProductDescription /> */}
            {/* <Blogs /> */}
          </div>
        </Container>

        <div className='hidden md:block'>
          <ReviewCarousel productName={product?.product?.name} />
          <BlogCarousel />
        </div>
      </div>

      {/* --------------------- only for mobile ---------------- */}

      <div
        // className='md:hidden'
        className={`md:hidden ${
          singleProduct?.data?.product?.product_type === "xbox" &&
          "bg-[url(/sell/xbox.jpeg)]"
        } ${
          singleProduct?.data?.product?.product_type === "playstation" &&
          "bg-[url(/sell/playstation.jpeg)]"
        } ${
          singleProduct?.data?.product?.product_type === "nintendo" &&
          "bg-[url(/sell/nintendo.jpeg)]"
        } bg-cover bg-no-repeat`}
      >
        <div className='w-full h-[426px]'>
          <Image
            src={`${API_URL}${product?.product?.images[0]}`}
            className='w-full h-[426px] aspect-square'
            width={800}
            height={800}
            alt='xbox'
          />
        </div>

        <div>
          {/* product into */}
          <div>
            <div className='pt-6 mx-5 pb-2.5 border-b-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <h3 className='text-lg text-[#FDFDFD]'>Review</h3>

                  <div className='flex items-center'>
                    <p className='flex items-center gap-1'>
                      {[...Array(Math.round(product?.product?.ratings))].map(
                        () => (
                          <svg
                            width='20'
                            height='21'
                            viewBox='0 0 20 21'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <g clip-path='url(#clip0_2122_18709)'>
                              <path
                                d='M11.0202 2.50976L12.5488 5.27412C12.7583 5.65357 13.2839 6.01403 13.7162 6.06276L16.2893 6.3862C17.9368 6.58972 18.3617 7.75894 17.2405 8.98361L15.3303 11.0584C15.0114 11.406 14.8458 12.0693 14.974 12.5246L15.6433 14.9672C16.1697 16.8957 15.1686 17.695 13.4093 16.7478L10.9516 15.4243C10.504 15.1823 9.79299 15.2175 9.37248 15.4892L7.03288 17.0035C5.35804 18.086 4.2923 17.3734 4.6598 15.4099L5.1304 12.925C5.21826 12.4605 5.00762 11.8124 4.65993 11.4935L2.57381 9.58021C1.35634 8.45484 1.68383 7.2554 3.30616 6.91534L5.8393 6.38621C6.26681 6.29335 6.76225 5.90146 6.93619 5.50274L8.23399 2.61726C8.94337 1.06262 10.1949 1.01363 11.0202 2.50976Z'
                                fill='#FDFDFD'
                              />
                            </g>
                            <defs>
                              <clipPath id='clip0_2122_18709'>
                                <rect
                                  width='20'
                                  height='20'
                                  fill='white'
                                  transform='translate(0 0.0507812)'
                                />
                              </clipPath>
                            </defs>
                          </svg>
                        )
                      )}
                      <svg
                        width='20'
                        height='21'
                        viewBox='0 0 20 21'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M11.4421 2.975L12.9087 5.90833C13.1087 6.31667 13.6421 6.70833 14.0921 6.78333L16.7504 7.225C18.4504 7.50833 18.8504 8.74167 17.6254 9.95833L15.5587 12.025C15.2087 12.375 15.0171 13.05 15.1254 13.5333L15.7171 16.0917C16.1837 18.1167 15.1087 18.9 13.3171 17.8417L10.8254 16.3667C10.3754 16.1 9.63375 16.1 9.17541 16.3667L6.68375 17.8417C4.90041 18.9 3.81708 18.1083 4.28375 16.0917L4.87541 13.5333C4.98375 13.05 4.79208 12.375 4.44208 12.025L2.37541 9.95833C1.15875 8.74167 1.55041 7.50833 3.25041 7.225L5.90875 6.78333C6.35041 6.70833 6.88375 6.31667 7.08375 5.90833L8.55041 2.975C9.35041 1.38333 10.6504 1.38333 11.4421 2.975Z'
                          stroke='#FDFDFD'
                          stroke-width='1.25'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                        />
                      </svg>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`pt-6 px-5 sticky -top-10 left-0 right-0 z-10 
			${singleProduct?.data?.product?.product_type === "xbox" && "bg-[#3caf4fd0]"}
			${
        singleProduct?.data?.product?.product_type === "playstation" &&
        "bg-[#004cafda]"
      }
			${singleProduct?.data?.product?.product_type === "nintendo" && "bg-[#f34040ce]"}
	  `}
          >
            <div className='pt-5 pb-2 border-b-2'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex flex-col gap-3'>
                  <h2 className='text-2xl font-semibold text-[#FDFDFD]'>
                    {product?.product?.name}
                  </h2>
                  <h3 className='text-base text-[#FDFDFD]'>
                    {selectedModel} | {selectedMemory} | {selectedCondition}
                  </h3>
                </div>

                <h2 className='text-[36px] font-semibold text-[#FDFDFD]'>
                  ${product?.product?.offer_price}
                </h2>
              </div>
            </div>
          </div>

          {/* Select the Xbox One model */}
          <div>
            <div className='flex items-center justify-center pt-8 space-x-2.5'>
              <hr className='flex-1 border-b-2 border-[#B5B5B5]' />
              <h2
                className={
                  "bg-[#FDFDFD] py-2 px-6 rounded-lg shadow-md text-[#101010] text-base font-medium text-center whitespace-nowrap"
                }
              >
                {singleProduct?.data?.product?.modelLabel}
              </h2>
              <hr className='flex-1 border-b-2 border-[#B5B5B5]' />
            </div>

            {/* Select the Xbox One model */}

            <div className='grid grid-cols-3 gap-5 px-4 py-4'>
              {product?.meta?.models?.map(
                ({ model, price }: Record<string, any>) => (
                  <div
                    key={model}
                    onClick={() => setSelectedModel(model)}
                    className={`
                    ${
                      selectedModel === model
                        ? `${productType === "xbox" ? "text-[#3BAE3B]" : ""}
                        ${productType === "playstation" ? "text-[#1861C0]" : ""}
                        ${productType === "nintendo" ? "text-[#D61D1E]" : ""}
                        
                        bg-[#FDFDFD] cursor-not-allowed border-transparent`
                        : "text-[#FDFDFD]"
                    }
                    text-base border-4 border-[#FDFDFD] font-semibold py-2.5 text-center flex flex-col items-center justify-center rounded-md p-1`}
                  >
                    <span className='overflow-hidden'>{model}</span>
                    {selectedModel === model ? <Check /> : <span>{price}</span>}
                    {/* <span className='font-light'>{price}</span> */}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Model */}
          <div className='px-5'>
            <p className='text-[#FDFDFD]'>
              <span className='font-medium h-fit'>MODEL: </span>{" "}
              {singleProduct?.data?.product?.modelDes}
            </p>
          </div>

          {/* controller */}
          <div>
            <div className='flex items-center justify-center pt-3 space-x-2.5'>
              <hr className='flex-1 border-b-2 border-[#B5B5B5]' />
              <h2
                className={
                  "bg-[#FDFDFD] py-2 px-6 rounded-lg shadow-md text-[#101010] text-base font-medium text-center whitespace-wrap"
                }
              >
                {singleProduct?.data?.product?.controllerLabel}
              </h2>
              <hr className='flex-1 border-b-2 border-[#B5B5B5]' />
            </div>

            <div className='grid grid-cols-3 gap-5 px-4 py-4'>
              {product?.meta?.controllers?.map(
                ({ controller, price }: Record<string, any>) => (
                  <div
                    key={controller}
                    onClick={() => setSelectedController(controller)}
                    className={`
                    ${
                      selectedController === controller
                        ? `${productType === "xbox" ? "text-[#3BAE3B]" : ""}
                        ${productType === "playstation" ? "text-[#1861C0]" : ""}
                        ${productType === "nintendo" ? "text-[#D61D1E]" : ""}
                        
                        bg-[#FDFDFD] cursor-not-allowed border-transparent`
                        : "text-[#FDFDFD]"
                    }
                    text-base border-4 border-[#FDFDFD] font-semibold py-2.5 text-center flex flex-col items-center justify-center rounded-md p-4`}
                  >
                    <span>{controller}</span>
                    {selectedController === controller ? (
                      <Check />
                    ) : (
                      <span>{price}</span>
                    )}
                    {/* <span className='font-light'>{price}</span> */}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Controller */}
          <div className='px-5 pb-6'>
            <p className='text-[#FDFDFD]'>
              <span className='font-medium h-fit'>CONTROLLER:</span>{" "}
              {singleProduct?.data?.product?.controllerDes}
            </p>
          </div>

          {/* What is the storage capacity? (Not applicable for Xbox One X) */}
          <div>
            <div className='flex items-center justify-center pt-4 space-x-2.5'>
              <hr className='flex-1 border-b-2 border-[#B5B5B5]' />
              <h2
                className={
                  "bg-[#FDFDFD] py-2 px-6 rounded-lg shadow-md text-[#101010] text-base font-medium text-center whitespace-wrap"
                }
              >
                {singleProduct?.data?.product?.memoryLabel}
              </h2>
              <hr className='flex-1 border-b-2 border-[#B5B5B5]' />
            </div>

            <div className='grid grid-cols-3 gap-5 px-4 py-4'>
              {product?.meta?.memorys?.map(
                ({ memory, price }: Record<string, any>) => (
                  <div
                    key={memory}
                    onClick={() => setSelectedMemory(memory)}
                    className={`
                    ${
                      selectedMemory === memory
                        ? `${productType === "xbox" ? "text-[#3BAE3B]" : ""}
                        ${productType === "playstation" ? "text-[#1861C0]" : ""}
                        ${productType === "nintendo" ? "text-[#D61D1E]" : ""}
                        
                        bg-[#FDFDFD] cursor-not-allowed border-transparent`
                        : "text-[#FDFDFD]"
                    }
                    text-base border-4 border-[#FDFDFD] font-semibold py-2.5 text-center flex flex-col items-center justify-center rounded-md p-1`}
                  >
                    <span>{memory}</span>
                    {selectedMemory === memory ? (
                      <Check />
                    ) : (
                      <span>{price}</span>
                    )}
                    {/* <span className='font-light'>{price}</span> */}
                  </div>
                )
              )}
            </div>
            {/* Memory */}
            <div className='px-5'>
              <p className='text-[#FDFDFD]'>
                <span className='font-medium h-fit'>MEMORY:</span>{" "}
                {singleProduct?.data?.product?.memoryDes}
              </p>
            </div>
          </div>

          {/* What is the condition of your console? */}
          <div>
            <div className='flex items-center justify-center pt-4 space-x-2.5'>
              <hr className='flex-1 border-b-2 border-[#B5B5B5]' />
              <h2
                className={
                  "bg-[#FDFDFD] py-2 px-6 rounded-lg shadow-md text-[#101010] text-base font-medium text-center whitespace-wrap"
                }
              >
                {singleProduct?.data?.product?.conditionLabel}
              </h2>
              <hr className='flex-1 border-b-2 border-[#B5B5B5]' />
            </div>

            <div className='grid grid-cols-3 gap-5 px-4 py-4'>
              {product?.meta?.conditions?.map(
                ({ condition, price }: Record<string, any>) => (
                  <div
                    key={condition}
                    onClick={() => setSelectedCondition(condition)}
                    className={`
                    ${
                      selectedCondition === condition
                        ? `${productType === "xbox" ? "text-[#3BAE3B]" : ""}
                        ${productType === "playstation" ? "text-[#1861C0]" : ""}
                        ${productType === "nintendo" ? "text-[#D61D1E]" : ""}
                        bg-[#FDFDFD] cursor-not-allowed border-transparent`
                        : "text-[#FDFDFD]"
                    }
                    text-base capitalize border-4 border-[#FDFDFD] font-semibold py-2.5 text-center flex flex-col items-center justify-center rounded-md p-4`}
                  >
                    <span>{condition}</span>
                    {selectedCondition === condition ? (
                      <Check />
                    ) : (
                      <span>{price}</span>
                    )}
                    {/* <span className='font-light'>{price}</span> */}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Condition */}
          <div className='px-5'>
            <p className='text-[#FDFDFD]'>
              <span className='font-medium h-fit'>CONDITION:</span>{" "}
              {singleProduct?.data?.product?.conditionDes}
            </p>
          </div>

          {/* Trade-in */}
          <div className='mb-6 px-5 pt-5'>
            {!isOpenTradeIn ? (
              <>
                <h4 className='text-2xl font-semibold text-[#FDFDFD] mb-2'>
                  {t("tradeIn")}:
                </h4>
                <button
                  className={`w-[120px] text-[#FDFDFD] md:w-[200px] 2xl:w-[256px] h-[91px] lg:h-[111px] lg:flex-none flex flex-col items-center justify-center lg:px-20 sm:px-10  py-8 border-4 rounded-md ${
                    modalState
                      ? "border-black bg-[#E7E7E7] border-transparent"
                      : "border-gray-300"
                  }`}
                  onClick={() => {
                    handleTrade();
                  }}
                >
                  {modalState ? "No" : "Yes"}
                </button>
              </>
            ) : (
              <div>
                {/* Conditions Box */}
                <div className='bg-[#f0f7ff] p-4 rounded-lg mb-6'>
                  <p className='text-gray-600 mb-2'>
                    <span className='font-medium text-gray-900'>
                      Conditions:
                    </span>{" "}
                    The phone will have heavy signs of wear, such as deeper
                    scratches, dents and other marks. The phone is unlocked,
                    fully tested and works like new.
                  </p>
                  <button className='text-blue-600 hover:underline text-sm'>
                    Learn More
                  </button>
                </div>

                {/* Trade-in Header */}
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold text-[#FDFDFD]'>
                    Trade-in
                  </h2>

                  <button
                    onClick={() => startOver()}
                    className='flex items-center text-[#FDFDFD] transition-colors'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-5 h-5 mr-2'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
                      />
                    </svg>
                    {t("startOver")}
                  </button>
                </div>

                {/* Value Display */}
                <div className='bg-[#e8f7f1] p-4 rounded-lg mb-6'>
                  <div className='flex items-start justify-start gap-2'>
                    <button className='text-gray-600 hover:text-gray-900 transition-colors'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={1.5}
                        stroke='currentColor'
                        className='w-5 h-5'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
                        />
                      </svg>
                    </button>
                    <p className='text-center text-gray-600'>
                      yOUR {modalTradeInData?.productName} IS VALUED AT €
                      {modalTradeInData?.productPrice ?? 0}
                    </p>
                  </div>
                </div>

                {/* Additional Information */}
                <div className='text-gray-200 border-l-4 border-black rounded-s-lg'>
                  <p className='p-3'>
                    After trade-in price estimate. We will ship the free
                    trade-in kit to your home address and refund the trade-in
                    value within 2-3 business days from receiving the phone.
                  </p>
                </div>

                <div className='my-4 border-b'></div>
              </div>
            )}
          </div>
        </div>

        {/* submit button */}
        <div className='p-2.5 bg-[#FDFDFD] sticky bottom-0 left-0 right-0 z-10'>
          <button
            onClick={handleAddToCart}
            className={`${
              singleProduct?.data?.product?.product_type === "xbox" &&
              "bg-[#49A947]"
            } ${
              singleProduct?.data?.product?.product_type === "playstation" &&
              "bg-[#1861C0]"
            } ${
              singleProduct?.data?.product?.product_type === "nintendo" &&
              "bg-[#D61D1E]"
            } w-full text-[#FDFDFD] font-semibold h-12 rounded-lg`}
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
