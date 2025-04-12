"use client"

import type React from "react"

import { useAppContext } from "./app-context"
import { Code, Terminal, PuzzleIcon as PuzzlePiece, Trophy, CheckCircle, Smartphone } from "lucide-react"

export default function HomePage() {
  const { navigateTo } = useAppContext()

  return (
    <section id="home">
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Practice Coding and Level Up Your Skills
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          An interactive platform to enhance your programming skills through hands-on practice, real-world challenges,
          and instant feedback.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <button
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium shadow hover:bg-primary/90 hover:-translate-y-1 transition-all flex items-center justify-center"
            onClick={() => navigateTo("compiler")}
          >
            <Terminal className="mr-2 h-5 w-5" /> Try the Compiler
          </button>
          <button
            className="bg-white text-primary px-6 py-3 rounded-lg font-medium shadow border border-primary hover:bg-gray-50 hover:-translate-y-1 transition-all flex items-center justify-center"
            onClick={() => navigateTo("questions")}
          >
            <Code className="mr-2 h-5 w-5" /> Solve Challenges
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
        <FeatureCard
          icon={<Code />}
          title="Interactive Code Editor"
          description="Write, edit, and run your code with syntax highlighting and real-time feedback. Support for multiple programming languages."
        />
        <FeatureCard
          icon={<Terminal />}
          title="Code Execution System"
          description="Compile and run your code instantly. See the output, errors, and performance metrics to optimize your solutions."
        />
        <FeatureCard
          icon={<PuzzlePiece />}
          title="Coding Challenges"
          description="Practice with algorithmic problems across different difficulty levels. Test your solutions against various test cases."
        />
        <FeatureCard
          icon={<Trophy />}
          title="Points and Rewards"
          description="Earn points by solving problems correctly. Track your progress and see how you stack up against others."
        />
        <FeatureCard
          icon={<CheckCircle />}
          title="Instant Feedback"
          description="Get immediate feedback on your solutions. Learn from your mistakes and improve your coding skills."
        />
        <FeatureCard
          icon={<Smartphone />}
          title="Responsive Design"
          description="Practice coding on any device. Our platform is optimized for desktop, tablet, and mobile experiences."
        />
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow hover:-translate-y-2 hover:shadow-lg transition-all">
      <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

