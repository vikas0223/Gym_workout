import WorkoutPlanner from "@/components/workout-planner"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-indigo-300 text-slate-800 p-4">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-indigo-900">
          Personalized Workout Planner
        </h1>
        <p className="text-xl text-center mb-12 text-indigo-700">
          Create your custom workout plan based on your goals and preferences
        </p>
        <WorkoutPlanner />
      </div>
    </main>
  )
}

