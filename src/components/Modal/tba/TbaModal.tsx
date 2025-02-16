"use client";
import ModalFrame from "@/app/helpers/ModalFrame";
import { Error } from "@/components/ErrorHandler/Error";
import { parseAddress } from "@/components/utils/helpers";
import Loader from "@/components/utils/Loader";
import { starknetProvider } from "@/config";
import { useAccountStore } from "@/hooks/useAccountStore";
import { useTokenBound } from "@/hooks/useTokenBound";
import { useAccount } from "@starknet-react/core";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Contract, num } from "starknet";

type tbaInput = {
  tbaAddress: string;
};

const TbaModal = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { account, address } = useAccount()
  const [loading, setLoading] = useState(false)
  const addTba = useAccountStore((state) => state.addTba)
  const { tokenbound } = useTokenBound()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<tbaInput>();

  const onSubmit: SubmitHandler<tbaInput> = async (data) => {
    setLoading(true)
    try {
      const ownerNFT = await tokenbound.getOwnerNFT(data.tbaAddress)
      const tokenAddress = num.toHex(ownerNFT[0])
      const tokenId = ownerNFT[1].toString()

      const { abi } = await starknetProvider.getClassAt(tokenAddress)

      const contract = new Contract(abi, tokenAddress, starknetProvider)
      contract.connect(account!)

      const owner = num.toHex(await contract.owner_of(tokenId))

      if(parseAddress(owner) !== parseAddress(address!)) {
        toast.error("You are not the owner of the account", {
          style: {
              color: "#fff",
              padding: "4px 15px",
              borderRadius: "8px",
              background: "#890162",
              margin: "auto"
              },
          });
      } else {
        addTba(data.tbaAddress)
        toast.success("token bound account added successfully", {
          style: {
              color: "#fff",
              padding: "4px 15px",
              borderRadius: "8px",
              background: "#890162",
              margin: "auto"
              },
          });
      }

      setValue("tbaAddress", "")
      setModalOpen(false)
      setLoading(false)

    } catch(err) {
      console.error(err, 'error')
      setLoading(false)
      toast.error("You are not the owner of the account", {
        style: {
            color: "#fff",
            padding: "4px 15px",
            borderRadius: "8px",
            background: "#890162",
            margin: "auto"
            },
        });

      setValue("tbaAddress", "")
      setModalOpen(false)
      setLoading(false)
    }

  };
  return (
    <div>
      <Loader
      loading={loading}
      />
      <button className="underline" onClick={() => setModalOpen(true)}>
        add TBA
      </button>
      <ModalFrame
        className="bg-[#03031d]"
        open={isModalOpen}
        setOpen={setModalOpen}
      >
        {/* Header */}
        <div className="relative flex justify-center">
          <h1 className="font-bold text-xl mb-4">Add a Token Bound Account</h1>
        </div>
        {/* Search */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <input
              {...register("tbaAddress", { required: true })}
              className="bg-input rounded-2xl p-3 text-xl text-white-1 placeholder:text-xl placeholder:text-gray-700 placeholder:font-semibold font-mono outline-none focus:outline focus:outline-1 focus:outline-button-1"
              placeholder="Enter an Account"
            />
            <Error
            error={errors.tbaAddress?.type}
            />
          </div>
          <button
          type="submit"
          className="bg-button px-8 py-2 rounded-xl mx-auto font-semibold">
            Add Account
          </button>
        </form>
        {/* <div className="relative">
            <input
              type="text"
              className="rounded-[40px] pl-6 pr-12 py-4 w-full text-xl placeholder:text-white-1 placeholder:font-space bg-hero outline-none focus:outline focus:outline-1 focus:outline-button-1"
              placeholder="Enter an Account"
            />
          </div> */}
      </ModalFrame>
    </div>
  );
};

export default TbaModal;
