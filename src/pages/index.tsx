import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const [file, setFile] = useState();

  const { mutate } = trpc.example.addABI.useMutation({
    onSuccess: () => {
      alert("Lets goo!");
    },
    onError: () => {
      alert("Dafuq");
    },
  });

  function handleChange(event: any) {
    setFile(event.target.files[0]);
  }
  function handleSubmit(event: any) {
    event.preventDefault();
    if (file) {
      const fileReader = new FileReader();
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (e) => {
        if (e.target) {
          if (e.target.result) {
            // TODO: CHECK IF THIS IS CONTENT IS LIKE AN ABI
            const data = JSON.parse(e.target.result.toString());
            mutate({
              abi: JSON.stringify(data["abi"]),
              contractName: data["contractName"],
            });
          }
        }
      };
    } else {
      alert("No file!");
    }
  }
  return (
    <div className="bg-gray-50  text-gray-800">
      <header>
        <div className="py-20 px-6 text-center text-gray-800">
          <h1 className="mt-0 mb-6 text-5xl font-bold">π³</h1>
          <h3 className="mb-8 text-3xl font-bold">Protocol Intelligence</h3>
        </div>
      </header>

      <section>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center">
            <div className="mb-3 w-96">
              <label
                htmlFor="formFileLg"
                className="form-label mb-2 inline-block text-gray-700"
              >
                Add ABI
              </label>
              <input
                accept=".json"
                className="form-control
                m-0
                block
                w-full
                rounded
                border
                border-solid
                border-gray-300
                bg-white bg-clip-padding
                px-2 py-1.5 text-xl
                font-normal
                text-gray-700
                transition
                ease-in-out
                focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
                id="formFileLg"
                type="file"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex justify-center space-x-2">
            <button
              type="submit"
              className="inline-block rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
            >
              Button
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Home;
