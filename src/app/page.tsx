import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    title: "Focusing on efficiency",
    description:
      "Experience lightning-fast responses, intuitive interactions, and intelligent solutions tailored to your needs.",
  },
  {
    title: "Simple",
    description:
      "The use-friendly interface allows anyone to easily interact with our AI agent.",
  },
  {
    title: "Smart",
    description:
      "Our AI agents use the latest technology to understand complex questions and deliver accurate answers.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black/10 flex items-center justify-center">
      {/* background pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-black/10 bg-[linear-gradient(to_right,#1b1b1b_1px,transparent_1px),linear-gradient(to_bottom,#1b1b1b_1px,transparent_1px)] bg-[size:7rem_10rem]" />

      <section className="w-full px-4 py-8 mx-auto max-w-7xl sm:px-4 lg:px-8 flex flex-col items-center space-y-10 text-center">
        <header className="space-y-6">
          <h1 className="text-6xl tracking-tight md:text-8xl bg-gradient-to-r from-gray-600 to-gray-400 bg-clip-text text-transparent font-light relative">
            Quill AI.
          </h1>
          <p
            className="max-w-[600px] text-sm text-gray-400 md:text-lg/relaxed xl:text-2xl/relaxed
          "
          >
            Meet your AI chat companion that goes beyond conversation - it can
            actually get things done!
            <br />
            <br />
            <span className="text-gray-600 text-xs md:text-sm">
              Powered by IBM&apos;s WxTools & Claude LLM&apos;s
            </span>
          </p>
        </header>
        <SignedIn>
          <Link href={"/dashboard"}>
            <button className="group relative inline-flex items-center justify-center px-4 py-3.5 text-base font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-700 transition-all duration-200 ease-in shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </Link>
        </SignedIn>

        <SignedOut>
          <SignInButton
            mode="modal"
            fallbackRedirectUrl={"/dashboard"}
            forceRedirectUrl={"/dashboard"}
          >
            <button className="group relative inline-flex items-center justify-center px-4 py-3.5 text-base font-medium text-white/70 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-700 transition-all duration-200 ease-in shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <span className="text-xs md:text-sm leading-relaxed tracking-wider">
                Sign Up
              </span>
              <ArrowRight className="ml-2 h-3.5 w-3.5 md:h-4 md:w-4 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </SignInButton>
        </SignedOut>

        {/* features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 pt-8 max-w-3xl mx-auto">
          {FEATURES.map(({ title, description }) => (
            <div key={title} className="text-center">
              <div className="text-2xl font-semibold text-gray-400">
                {title}
              </div>
              <div className="text-sm text-gray-500 ml-1">{description}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
