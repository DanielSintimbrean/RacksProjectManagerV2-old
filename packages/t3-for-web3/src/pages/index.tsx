import { type NextPage } from "next";
import Head from "next/head";
import Layout from "../componests/Layout";

import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const trpcUtils = trpc.useContext();
  const hello = trpc.example.hello.useQuery({ text: "from tRPC" });
  const secret = trpc.auth.getSecretMessage.useQuery(undefined, {
    retry(failureCount, error) {
      if (error?.shape?.data.code === "UNAUTHORIZED") {
        trpcUtils.auth.getSecretMessage.setData(undefined, "Not logged in");
        return false;
      }
      return true;
    },
  });

  return (
    <Layout>
      <Head>
        <title>T3 for web3</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            T3 <span className="text-[hsl(280,100%,70%)]">for</span> web3
          </h1>

          <p className="text-2xl text-white">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>
          <p className="text-2xl text-white">
            Secret Message <br />
            {secret.data}
          </p>
        </div>
      </main>
    </Layout>
  );
};

export default Home;