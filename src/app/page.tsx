import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

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
]

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black/10">
      {/* background pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-black/10 bg-[linear-gradient(to_right,#1b1b1b_1px,transparent_1px),linear-gradient(to_bottom,#1b1b1b_1px,transparent_1px)] bg-[size:7rem_10rem]" />

      <section className="mx-auto flex w-full max-w-7xl flex-col items-center space-y-10 px-4 py-8 text-center sm:px-4 lg:px-8">
        <header className="space-y-6">
          <h1 className="relative bg-gradient-to-r from-gray-600 to-gray-400 bg-clip-text text-6xl font-light tracking-tight text-transparent md:text-8xl">
            Quill AI.
          </h1>
          <p className="max-w-[600px] text-sm text-gray-400 md:text-lg/relaxed xl:text-2xl/relaxed">
            Meet your AI chat companion that goes beyond conversation - it can
            actually get things done!
            <br />
            <br />
            <span className="text-xs text-gray-600 md:text-sm">
              Powered by IBM&apos;s WxTools & Claude LLM&apos;s
            </span>
          </p>
        </header>
        <SignedIn>
          <Link href={"/dashboard"}>
            <button className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3.5 text-base font-medium text-white shadow-lg transition-all duration-200 ease-in hover:-translate-y-0.5 hover:from-gray-800 hover:to-gray-700 hover:shadow-xl">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
            </button>
          </Link>
        </SignedIn>

        <SignedOut>
          <SignInButton
            mode="modal"
            fallbackRedirectUrl={"/dashboard"}
            forceRedirectUrl={"/dashboard"}
          >
            <button className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3.5 text-base font-medium text-white/70 shadow-lg transition-all duration-200 ease-in hover:-translate-y-0.5 hover:from-gray-800 hover:to-gray-700 hover:shadow-xl">
              <span className="text-xs leading-relaxed tracking-wider md:text-sm">
                Sign Up
              </span>
              <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 md:h-4 md:w-4" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
            </button>
          </SignInButton>
        </SignedOut>

        {/* features */}
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 pt-8 md:grid-cols-3 md:gap-16">
          {FEATURES.map(({ title, description }) => (
            <div key={title} className="text-center">
              <div className="text-2xl font-semibold text-gray-400">
                {title}
              </div>
              <div className="ml-1 text-sm text-gray-500">{description}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
