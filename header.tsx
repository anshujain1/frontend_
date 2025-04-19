import React from 'react'
import Segwise from "../public/segwise.png"
import Image from 'next/image'
const header = () => {
  return (
    <div>
    <div className="flex flex-col sm:flex-row items-center gap-4 m-4 sm:m-10 p-0">

      <Image src={Segwise} alt="none" height={80} className="" />
  
      <div className="p-4">
        <div className="font-semibold text-gray-600 text-xl">Segwise</div>
        <div className="font-light text-gray-600 text-xl">Front End Test</div>
      </div>
    </div>
  </div>
  
  )
}

export default header