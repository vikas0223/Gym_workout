"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  UserIcon as Male,
  UserIcon as Female,
  ArrowLeft,
  ArrowRight,
  Activity,
  Loader2,
  Save,
  BookOpen,
  Trash2,
  Info,
  Target,
  Clock,
} from "lucide-react"
import { exerciseDatabase } from "@/lib/exercise-database"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export default function WorkoutPlanner() {
  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    weight: "",
    duration: 30,
    equipment: [],
    goal: "",
    type: "",
    difficulty: "",
    muscleGroups: [],
  })

  const [step, setStep] = useState(0) // Start with gender selection
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [satisfaction, setSatisfaction] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [errors, setErrors] = useState({})
  const [savedPlans, setSavedPlans] = useState([])
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showSavedPlans, setShowSavedPlans] = useState(false)

  // Load saved plans from localStorage on component mount
  useEffect(() => {
    const savedPlansFromStorage = localStorage.getItem("savedWorkoutPlans")
    if (savedPlansFromStorage) {
      setSavedPlans(JSON.parse(savedPlansFromStorage))
    }
  }, [])

  const equipmentOptions = [
    "Barbells",
    "Dumbbells",
    "Bodyweight",
    "Machine",
    "Kettlebells",
    "Cables",
    "Bands",
    "Medicine Ball",
    "Resistance Bands",
    "TRX",
    "Foam Roller",
    "Yoga Mat",
  ]

  // Mapping of muscle groups to their corresponding body parts
  const muscleGroupMapping = {
    "Upper Body Push": ["chest", "frontShoulders"],
    "Upper Body Pull": ["upperBack", "lats"],
    "Lower Body Push": ["quads", "calves"],
    "Lower Body Pull": ["hamstrings", "glutes"],
    Core: ["abs", "obliques", "lowerBack"],
    Arms: ["biceps", "triceps", "forearms"],
    Shoulders: ["frontShoulders", "rearShoulders"],
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const handleSliderChange = (value) => {
    setFormData({
      ...formData,
      duration: value[0],
    })
  }

  const handleCheckboxChange = (name, value, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        [name]: [...formData[name], value],
      })
    } else {
      setFormData({
        ...formData,
        [name]: formData[name].filter((item) => item !== value),
      })
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const handleGenderSelect = (gender) => {
    setFormData({
      ...formData,
      gender,
    })
    setStep(1)
  }

  const handleMuscleGroupSelect = (group) => {
    if (formData.muscleGroups.includes(group)) {
      setFormData({
        ...formData,
        muscleGroups: formData.muscleGroups.filter((g) => g !== group),
      })
    } else {
      setFormData({
        ...formData,
        muscleGroups: [...formData.muscleGroups, group],
      })
    }

    // Clear error for muscleGroups
    if (errors.muscleGroups) {
      setErrors({
        ...errors,
        muscleGroups: null,
      })
    }
  }

  const handleBodyPartSelect = (bodyPart) => {
    // Find which muscle group this body part belongs to
    let targetGroup = null
    for (const [group, parts] of Object.entries(muscleGroupMapping)) {
      if (parts.includes(bodyPart)) {
        targetGroup = group
        break
      }
    }

    if (targetGroup) {
      handleMuscleGroupSelect(targetGroup)
    }
  }

  const handleAllEquipment = (checked) => {
    if (checked) {
      // Select all equipment options
      setFormData({
        ...formData,
        equipment: equipmentOptions.map((eq) => eq.toLowerCase()),
      })
    } else {
      // Deselect all
      setFormData({
        ...formData,
        equipment: [],
      })
    }
  }

  const validateStep = () => {
    const newErrors = {}

    switch (step) {
      case 1: // Basic info
        if (!formData.age) newErrors.age = "Age is required"
        if (!formData.weight) newErrors.weight = "Weight is required"
        break
      case 2: // Equipment
        if (formData.equipment.length === 0) newErrors.equipment = "Please select at least one equipment option"
        break
      case 3: // Muscle groups
        if (formData.muscleGroups.length === 0) newErrors.muscleGroups = "Please select at least one muscle group"
        break
      case 4: // Goals
        if (!formData.goal) newErrors.goal = "Please select a fitness goal"
        if (!formData.type) newErrors.type = "Please select a workout type"
        if (!formData.difficulty) newErrors.difficulty = "Please select a difficulty level"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const generateWorkoutPlan = () => {
    if (!validateStep()) return

    setIsGenerating(true)

    // Simulate API call or complex calculation
    setTimeout(() => {
      const exercises = generateExercises(formData)
      setWorkoutPlan(exercises)
      setIsGenerating(false)
      setStep(5)

      // Scroll to top when showing results
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 1500) // Simulate 1.5 second delay for loading animation
  }

  const submitFeedback = () => {
    if (satisfaction === "unsatisfied") {
      setIsGenerating(true)

      // Simulate API call or complex calculation
      setTimeout(() => {
        // Regenerate a new plan based on feedback
        const newExercises = regenerateBasedOnFeedback(formData, feedback)
        setWorkoutPlan(newExercises)
        setIsGenerating(false)
        setStep(5)

        // Scroll to top when showing results
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 1500) // Simulate 1.5 second delay for loading animation
    } else {
      // Thank the user for their feedback
      setStep(7)
    }
  }

  const saveWorkoutPlan = () => {
    if (!workoutPlan) return

    const planToSave = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      plan: workoutPlan,
      formData: formData,
    }

    const updatedSavedPlans = [...savedPlans, planToSave]
    setSavedPlans(updatedSavedPlans)

    // Save to localStorage
    localStorage.setItem("savedWorkoutPlans", JSON.stringify(updatedSavedPlans))

    // Show confirmation
    alert("Workout plan saved successfully!")
  }

  const deleteSavedPlan = (id) => {
    const updatedSavedPlans = savedPlans.filter((plan) => plan.id !== id)
    setSavedPlans(updatedSavedPlans)

    // Update localStorage
    localStorage.setItem("savedWorkoutPlans", JSON.stringify(updatedSavedPlans))
  }

  const loadSavedPlan = (savedPlan) => {
    setWorkoutPlan(savedPlan.plan)
    setFormData(savedPlan.formData)
    setShowSavedPlans(false)
    setStep(5)
  }

  const showExerciseGuidance = (exercise) => {
    setSelectedExercise(exercise)
  }

  const generateExercises = (data) => {
    // Get exercises from our expanded database
    let exercises = []
    const { goal, type, equipment, muscleGroups } = data

    // Get exercises from the database based on goal and type
    if (exerciseDatabase[goal] && exerciseDatabase[goal][type]) {
      exercises = [...exerciseDatabase[goal][type]]
    }

    // Filter exercises based on available equipment
    if (equipment.length > 0 && !equipment.includes("all")) {
      exercises = exercises.filter((ex) => {
        // If the exercise requires equipment, check if the user has it
        if (ex.equipment && ex.equipment.length > 0) {
          return ex.equipment.some((eq) => equipment.includes(eq.toLowerCase()))
        }
        return true
      })
    }

    // Filter exercises based on selected muscle groups
    if (muscleGroups.length > 0 && !muscleGroups.includes("all")) {
      exercises = exercises.filter((ex) => {
        if (ex.muscleGroup) {
          return muscleGroups.includes(ex.muscleGroup)
        }
        return true
      })
    }

    // Adjust based on difficulty
    if (data.difficulty === "beginner") {
      exercises = exercises.map((ex) => {
        const newEx = { ...ex }
        if (newEx.sets) newEx.sets = Math.max(2, newEx.sets - 1)
        if (newEx.reps && newEx.reps.includes("-")) {
          const [min, max] = newEx.reps.split("-").map(Number)
          newEx.reps = `${min - 2}-${max - 2}`
        }
        return newEx
      })
    } else if (data.difficulty === "advanced") {
      exercises = exercises.map((ex) => {
        const newEx = { ...ex }
        if (newEx.sets) newEx.sets = newEx.sets + 1
        if (newEx.reps && newEx.reps.includes("-")) {
          const [min, max] = newEx.reps.split("-").map(Number)
          newEx.reps = `${min + 2}-${max + 2}`
        }
        return newEx
      })
    }

    // If we don't have enough exercises after filtering, add some generic ones
    if (exercises.length < 3) {
      const genericExercises = [
        {
          name: "Push-ups",
          sets: 3,
          reps: "10-12",
          rest: "1 min",
          equipment: ["bodyweight"],
          muscleGroup: "Upper Body Push",
          instructions:
            "Start in a plank position with hands shoulder-width apart. Lower your body until your chest nearly touches the floor, then push back up.",
        },
        {
          name: "Bodyweight Squats",
          sets: 3,
          reps: "15",
          rest: "1 min",
          equipment: ["bodyweight"],
          muscleGroup: "Lower Body Push",
          instructions:
            "Stand with feet shoulder-width apart. Lower your body by bending your knees and pushing your hips back, as if sitting in a chair. Return to standing position.",
        },
        {
          name: "Plank",
          sets: 3,
          duration: "30 sec",
          rest: "30 sec",
          equipment: ["bodyweight"],
          muscleGroup: "Core",
          instructions:
            "Start in a push-up position, but with your weight on your forearms. Keep your body in a straight line from head to heels, engaging your core muscles.",
        },
      ]

      exercises = [...exercises, ...genericExercises.slice(0, 5 - exercises.length)]
    }

    // Add instructions to exercises if they don't have them
    exercises = exercises.map((ex) => {
      if (!ex.instructions) {
        // Add generic instructions based on exercise name
        ex.instructions = `Perform ${ex.name} with proper form, focusing on controlled movements and breathing. Start with a lighter weight to master the technique before increasing intensity.`
      }
      return ex
    })

    // Limit to 5-7 exercises for a reasonable workout
    exercises = exercises.slice(
      0,
      Math.min(exercises.length, data.difficulty === "beginner" ? 5 : data.difficulty === "intermediate" ? 6 : 7),
    )

    return {
      exercises,
      duration: data.duration,
      type: data.type,
      goal: data.goal,
      difficulty: data.difficulty,
      gender: data.gender,
    }
  }

  const regenerateBasedOnFeedback = (data, feedback) => {
    // Analyze feedback and adjust the plan
    const lowerFeedback = feedback.toLowerCase()
    const newData = { ...data }

    if (lowerFeedback.includes("too hard") || lowerFeedback.includes("difficult")) {
      newData.difficulty = "beginner"
    } else if (lowerFeedback.includes("too easy")) {
      newData.difficulty = "advanced"
    }

    if (lowerFeedback.includes("too long")) {
      newData.duration = Math.max(15, data.duration - 10)
    } else if (lowerFeedback.includes("too short")) {
      newData.duration = data.duration + 10
    }

    // Check for specific muscle group mentions
    const muscleKeywords = {
      arms: "Arms",
      chest: "Upper Body Push",
      back: "Upper Body Pull",
      legs: "Lower Body Push",
      shoulders: "Shoulders",
      core: "Core",
      abs: "Core",
    }

    for (const [keyword, group] of Object.entries(muscleKeywords)) {
      if (lowerFeedback.includes(keyword) && !newData.muscleGroups.includes(group)) {
        newData.muscleGroups.push(group)
      }
    }

    // Generate a new plan with the adjusted data
    return generateExercises(newData)
  }

  // Glassmorphism card style
  const cardStyle = "backdrop-filter backdrop-blur-lg bg-white/40 border border-white/50 shadow-xl"

  // Check if a body part is selected (part of a selected muscle group)
  const isBodyPartSelected = (bodyPart) => {
    for (const [group, parts] of Object.entries(muscleGroupMapping)) {
      if (parts.includes(bodyPart) && formData.muscleGroups.includes(group)) {
        return true
      }
    }
    return false
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-indigo-900">Generating your workout plan...</p>
          </div>
        </div>
      )}

      {/* Exercise Guidance Dialog */}
      {selectedExercise && (
        <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-indigo-900">{selectedExercise.name}</DialogTitle>
              <DialogDescription className="text-indigo-700">
                {selectedExercise.muscleGroup && (
                  <span className="block mb-2">Target: {selectedExercise.muscleGroup}</span>
                )}
                {selectedExercise.equipment && (
                  <span className="block mb-2">Equipment: {selectedExercise.equipment.join(", ")}</span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-medium text-indigo-900 mb-2">How to perform:</h3>
                <p className="text-indigo-800">{selectedExercise.instructions}</p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-medium text-indigo-900 mb-2">Tips:</h3>
                <ul className="list-disc pl-5 text-indigo-800 space-y-1">
                  <li>Focus on proper form rather than speed</li>
                  <li>Breathe out during the exertion phase</li>
                  <li>Keep movements controlled and deliberate</li>
                  {selectedExercise.muscleGroup === "Core" && <li>Engage your core throughout the entire movement</li>}
                  {selectedExercise.equipment && selectedExercise.equipment.includes("barbells") && (
                    <li>Start with lighter weights to master the technique</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setSelectedExercise(null)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Saved Plans Dialog */}
      <Dialog open={showSavedPlans} onOpenChange={setShowSavedPlans}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl text-indigo-900">Your Saved Workout Plans</DialogTitle>
            <DialogDescription className="text-indigo-700">
              View and manage your previously saved workout plans
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4 -mr-4">
            {savedPlans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-indigo-700">You don't have any saved workout plans yet.</p>
                <p className="text-indigo-600 mt-2">Generate a plan and click "Save Plan" to add one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedPlans.map((savedPlan) => (
                  <div
                    key={savedPlan.id}
                    className="bg-white/70 rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-indigo-900">
                          {savedPlan.plan.goal.charAt(0).toUpperCase() + savedPlan.plan.goal.slice(1)} -{" "}
                          {savedPlan.plan.type.charAt(0).toUpperCase() +
                            savedPlan.plan.type.slice(1).replace(/-/g, " ")}
                        </h3>
                        <p className="text-sm text-indigo-700">Saved on: {savedPlan.date}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-indigo-700 border-indigo-200"
                          onClick={() => loadSavedPlan(savedPlan)}
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => deleteSavedPlan(savedPlan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-indigo-800">
                      <p>
                        Duration: {savedPlan.plan.duration} min • Difficulty:{" "}
                        {savedPlan.plan.difficulty.charAt(0).toUpperCase() + savedPlan.plan.difficulty.slice(1)}
                      </p>
                      <p className="mt-1">Exercises: {savedPlan.plan.exercises.length}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setShowSavedPlans(false)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 0: Gender Selection */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className={cardStyle}>
            <CardHeader>
              <CardTitle className="text-center text-indigo-900">Choose Your Gender</CardTitle>
              <CardDescription className="text-center text-indigo-700">
                Choose between 'Male' or 'Female' to get started on the next step of the process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => handleGenderSelect("male")}
                  className={`cursor-pointer rounded-xl p-6 text-center ${formData.gender === "male" ? "bg-indigo-200 border-2 border-indigo-500" : "bg-white/50 border border-indigo-200"}`}
                >
                  <Male className="w-20 h-20 mx-auto mb-4 text-indigo-700" />
                  <h3 className="text-xl font-semibold text-indigo-900">Male</h3>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => handleGenderSelect("female")}
                  className={`cursor-pointer rounded-xl p-6 text-center ${formData.gender === "female" ? "bg-indigo-200 border-2 border-indigo-500" : "bg-white/50 border border-indigo-200"}`}
                >
                  <Female className="w-20 h-20 mx-auto mb-4 text-indigo-700" />
                  <h3 className="text-xl font-semibold text-indigo-900">Female</h3>
                </motion.div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={() => setShowSavedPlans(true)}
                variant="outline"
                className="border-indigo-300 text-indigo-700"
              >
                <BookOpen className="w-4 h-4 mr-2" /> Saved Plans
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className={cardStyle}>
            <CardHeader>
              <CardTitle className="text-indigo-900">Your Information</CardTitle>
              <CardDescription className="text-indigo-700">
                Fill in your details to get a personalized workout plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-indigo-900">
                    Age <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`bg-white/50 border-indigo-200 ${errors.age ? "border-red-500" : ""}`}
                  />
                  {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-indigo-900">
                    Weight (kg/lbs) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    placeholder="Enter your weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className={`bg-white/50 border-indigo-200 ${errors.weight ? "border-red-500" : ""}`}
                  />
                  {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-indigo-900">Workout Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    defaultValue={[formData.duration]}
                    max={90}
                    min={15}
                    step={5}
                    onValueChange={handleSliderChange}
                    className="flex-1"
                  />
                  <span className="w-12 text-center text-indigo-900">{formData.duration}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={prevStep} variant="outline" className="border-indigo-300 text-indigo-700">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Equipment Selection */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className={cardStyle}>
            <CardHeader>
              <CardTitle className="text-indigo-900">
                Equipment Selection <span className="text-red-500">*</span>
              </CardTitle>
              <CardDescription className="text-indigo-700">
                Select the equipment you have access to for your workout
              </CardDescription>
              {errors.equipment && <p className="text-red-500 text-sm mt-2">{errors.equipment}</p>}
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg cursor-pointer flex items-center gap-2 ${
                    formData.equipment.length === equipmentOptions.length
                      ? "bg-indigo-200 border border-indigo-400"
                      : "bg-white/50 border border-indigo-200"
                  }`}
                  onClick={() => handleAllEquipment(formData.equipment.length !== equipmentOptions.length)}
                >
                  <Checkbox
                    checked={formData.equipment.length === equipmentOptions.length}
                    className="data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white"
                  />
                  <Label className="cursor-pointer text-indigo-900 font-medium">Select All Equipment</Label>
                </motion.div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {equipmentOptions.map((equipment) => (
                  <motion.div
                    key={equipment}
                    whileHover={{ scale: 1.03 }}
                    className={`p-4 rounded-lg cursor-pointer flex items-center gap-2 ${
                      formData.equipment.includes(equipment.toLowerCase())
                        ? "bg-indigo-200 border border-indigo-400"
                        : "bg-white/50 border border-indigo-200"
                    }`}
                    onClick={() =>
                      handleCheckboxChange(
                        "equipment",
                        equipment.toLowerCase(),
                        !formData.equipment.includes(equipment.toLowerCase()),
                      )
                    }
                  >
                    <Checkbox
                      checked={formData.equipment.includes(equipment.toLowerCase())}
                      className="data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white"
                    />
                    <Label className="cursor-pointer text-indigo-900">{equipment}</Label>
                  </motion.div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={prevStep} variant="outline" className="border-indigo-300 text-indigo-700">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Muscle Group Selection */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className={cardStyle}>
            <CardHeader>
              <CardTitle className="text-indigo-900">
                Muscle Group Selection <span className="text-red-500">*</span>
              </CardTitle>
              <CardDescription className="text-indigo-700">
                Select the muscle groups you want to focus on
              </CardDescription>
              {errors.muscleGroups && <p className="text-red-500 text-sm mt-2">{errors.muscleGroups}</p>}
            </CardHeader>
            <CardContent>
              <div className="bg-white/70 rounded-lg p-4 mb-6">
                <h3 className="text-center text-indigo-900 font-medium mb-4">Select muscles on the diagram</h3>
                <div className="flex justify-center mb-4">
                  <div className="relative w-full max-w-md bg-white rounded-lg border border-indigo-100 p-4">
                    {/* Realistic Human Body SVG */}
                    <svg viewBox="0 0 400 600" className="w-full h-auto">
                      {/* Base body outline */}
                      <path
                        d="M200,50 C230,50 250,70 250,100 C250,130 240,150 240,170 C240,190 250,210 250,230 C250,250 240,270 240,290 C240,310 230,330 220,350 C210,370 210,390 210,410 C210,430 220,450 220,470 C220,490 210,510 200,530 C190,510 180,490 180,470 C180,450 190,430 190,410 C190,390 190,370 180,350 C170,330 160,310 160,290 C160,270 150,250 150,230 C150,210 160,190 160,170 C160,150 150,130 150,100 C150,70 170,50 200,50"
                        fill="#f5f5f5"
                        stroke="#ccc"
                        strokeWidth="1"
                      />

                      {/* Head */}
                      <circle cx="200" cy="40" r="30" fill="#f5f5f5" stroke="#ccc" strokeWidth="1" />

                      {/* Chest */}
                      <path
                        id="chest"
                        d="M170,140 C180,130 220,130 230,140 C235,150 235,170 230,180 C220,190 180,190 170,180 C165,170 165,150 170,140"
                        fill={formData.muscleGroups.includes("Upper Body Push") ? "#a5b4fc" : "#e2e8f0"}
                        stroke={formData.muscleGroups.includes("Upper Body Push") ? "#6366f1" : "#cbd5e1"}
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                        onClick={() => handleMuscleGroupSelect("Upper Body Push")}
                      />

                      {/* Shoulders */}
                      <path
                        id="frontShoulders"
                        d="M150,120 C155,110 165,105 175,110 C180,115 180,125 175,130 C170,135 155,135 150,130 C145,125 145,115 150,120 M250,120 C245,110 235,105 225,110 C220,115 220,125 225,130 C230,135 245,135 250,130 C255,125 255,115 250,120"
                        fill={formData.muscleGroups.includes("Shoulders") ? "#a5b4fc" : "#e2e8f0"}
                        stroke={formData.muscleGroups.includes("Shoulders") ? "#6366f1" : "#cbd5e1"}
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                        onClick={() => handleMuscleGroupSelect("Shoulders")}
                      />

                      {/* Biceps */}
                      <path
                        id="biceps"
                        d="M145,150 C140,160 135,180 140,190 C145,195 155,195 160,190 C165,180 165,160 160,150 C155,145 150,145 145,150 M255,150 C260,160 265,180 260,190 C255,195 245,195 240,190 C235,180 235,160 240,150 C245,145 250,145 255,150"
                        fill={formData.muscleGroups.includes("Arms") ? "#a5b4fc" : "#e2e8f0"}
                        stroke={formData.muscleGroups.includes("Arms") ? "#6366f1" : "#cbd5e1"}
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                        onClick={() => handleMuscleGroupSelect("Arms")}
                      />

                      {/* Forearms */}
                      <path
                        id="forearms"
                        d="M140,200 C135,210 130,220 135,230 C140,235 150,235 155,230 C160,220 160,210 155,200 C150,195 145,195 140,200 M260,200 C265,210 270,220 265,230 C260,235 250,235 245,230 C240,220 240,210 245,200 C250,195 255,195 260,200"
                        fill={formData.muscleGroups.includes("Arms") ? "#a5b4fc" : "#e2e8f0"}
                        stroke={formData.muscleGroups.includes("Arms") ? "#6366f1" : "#cbd5e1"}
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                        onClick={() => handleMuscleGroupSelect("Arms")}
                      />

                      {/* Abs */}
                      <path
                        id="abs"
                        d="M180,190 C190,185 210,185 220,190 C225,200 225,240 220,250 C210,255 190,255 180,250 C175,240 175,200 180,190"
                        fill={formData.muscleGroups.includes("Core") ? "#a5b4fc" : "#e2e8f0"}
                        stroke={formData.muscleGroups.includes("Core") ? "#6366f1" : "#cbd5e1"}
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                        onClick={() => handleMuscleGroupSelect("Core")}
                      />

                      {/* Obliques */}
                      <path
                        id="obliques"
                        d="M170,200 C175,195 180,195 180,200 C180,220 180,230 175,240 C170,245 165,245 165,240 C165,230 165,220 170,200 M230,200 C225,195 220,195 220,200 C220,220 220,230 225,240 C230,245 235,245 235,240 C235,230 235,220 230,200"
                        fill={formData.muscleGroups.includes("Core") ? "#a5b4fc" : "#e2e8f0"}
                        stroke={formData.muscleGroups.includes("Core") ? "#6366f1" : "#cbd5e1"}
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                        onClick={() => handleMuscleGroupSelect("Core")}
                      />

                      {/* Quads */}
                      <path
                        id="quads"
                        d="M180,260 C185,255 195,255 200,260 C205,265 205,310 200,320 C195,325 185,325 180,320 C175,310 175,265 180,260 M220,260 C215,255 205,255 200,260 C195,265 195,310 200,320 C205,325 215,325 220,320 C225,310 225,265 220,260"
                        fill={formData.muscleGroups.includes("Lower Body Push") ? "#a5b4fc" : "#e2e8f0"}
                        stroke={formData.muscleGroups.includes("Lower Body Push") ? "#6366f1" : "#cbd5e1"}
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                        onClick={() => handleMuscleGroupSelect("Lower Body Push")}
                      />

                      {/* Calves */}
                      <path
                        id="calves"
                        d="M180,330 C185,325 195,325 200,330 C205,335 205,380 200,390 C195,395 185,395 180,390 C175,380 175,335 180,330 M220,330 C215,325 205,325 200,330 C195,335 195,380 200,390 C205,395 215,395 220,390 C225,380 225,335 220,330"
                        fill={formData.muscleGroups.includes("Lower Body Push") ? "#a5b4fc" : "#e2e8f0"}
                        stroke={formData.muscleGroups.includes("Lower Body Push") ? "#6366f1" : "#cbd5e1"}
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                        onClick={() => handleMuscleGroupSelect("Lower Body Push")}
                      />

                      {/* Back muscles (shown as outlines on the sides) */}
                      <path
                        id="upperBack"
                        d="M160,130 C155,140 150,160 155,180 C160,185 165,185 170,180 C175,160 175,140 170,130 C165,125 165,125 160,130 M240,130 C245,140 250,160 245,180 C240,185 235,185 230,180 C225,160 225,140 230,130 C235,125 235,125 240,130"
                        fill={formData.muscleGroups.includes("Upper Body Pull") ? "#a5b4fc" : "#e2e8f0"}
                        stroke={formData.muscleGroups.includes("Upper Body Pull") ? "#6366f1" : "#cbd5e1"}
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                        onClick={() => handleMuscleGroupSelect("Upper Body Pull")}
                      />

                      {/* Hamstrings (shown as outlines on the back of legs) */}
                      <path
                        id="hamstrings"
                        d="M185,270 C190,265 195,265 195,270 C195,290 195,300 190,310 C185,315 180,315 180,310 C180,300 180,290 185,270 M215,270 C210,265 205,265 205,270 C205,290 205,300 210,310 C215,315 220,315 220,310 C220,300 220,290 215,270"
                        fill={formData.muscleGroups.includes("Lower Body Pull") ? "#a5b4fc" : "#e2e8f0"}
                        stroke={formData.muscleGroups.includes("Lower Body Pull") ? "#6366f1" : "#cbd5e1"}
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                        onClick={() => handleMuscleGroupSelect("Lower Body Pull")}
                      />

                      {/* Glutes */}
                      <path
                        id="glutes"
                        d="M180,240 C190,235 210,235 220,240 C225,250 225,260 220,270 C210,275 190,275 180,270 C175,260 175,250 180,240"
                        fill={formData.muscleGroups.includes("Lower Body Pull") ? "#a5b4fc" : "#e2e8f0"}
                        stroke={formData.muscleGroups.includes("Lower Body Pull") ? "#6366f1" : "#cbd5e1"}
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                        onClick={() => handleMuscleGroupSelect("Lower Body Pull")}
                      />
                    </svg>

                    {/* Legend */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-indigo-400 mr-2 rounded-sm"></div>
                        <span className="text-indigo-900">Selected</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-slate-200 mr-2 rounded-sm"></div>
                        <span className="text-indigo-900">Not Selected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Upper Body Push",
                      "Upper Body Pull",
                      "Lower Body Push",
                      "Lower Body Pull",
                      "Core",
                      "Arms",
                      "Shoulders",
                      "All",
                    ].map((group) => (
                      <motion.div
                        key={group}
                        whileHover={{ scale: 1.02 }}
                        className={`p-3 rounded-lg cursor-pointer flex items-center gap-2 ${
                          formData.muscleGroups.includes(group)
                            ? "bg-indigo-200 border border-indigo-400"
                            : "bg-white/50 border border-indigo-200"
                        }`}
                        onClick={() => {
                          if (group === "All") {
                            setFormData({
                              ...formData,
                              muscleGroups: ["all"],
                            })
                          } else {
                            handleMuscleGroupSelect(group)
                          }
                        }}
                      >
                        <Checkbox
                          checked={
                            group === "All"
                              ? formData.muscleGroups.includes("all")
                              : formData.muscleGroups.includes(group)
                          }
                          className="data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white"
                        />
                        <Label className="cursor-pointer text-indigo-900">{group}</Label>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={prevStep} variant="outline" className="border-indigo-300 text-indigo-700">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Step 4: Workout Goals */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className={cardStyle}>
            <CardHeader>
              <CardTitle className="text-indigo-900">Workout Goals</CardTitle>
              <CardDescription className="text-indigo-700">What do you want to work out today?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-indigo-900">
                  Fitness Goal <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.goal} onValueChange={(value) => handleSelectChange("goal", value)}>
                  <SelectTrigger
                    id="goal"
                    className={`bg-white/50 border-indigo-200 ${errors.goal ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                  </SelectContent>
                </Select>
                {errors.goal && <p className="text-red-500 text-sm">{errors.goal}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-indigo-900">
                  Workout Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger
                    id="type"
                    className={`bg-white/50 border-indigo-200 ${errors.type ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-body">Full Body</SelectItem>
                    <SelectItem value="upper-body">Upper Body</SelectItem>
                    <SelectItem value="lower-body">Lower Body</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="pull">Pull</SelectItem>
                    <SelectItem value="split">Split</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-indigo-900">
                  Difficulty Level <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleSelectChange("difficulty", value)}>
                  <SelectTrigger
                    id="difficulty"
                    className={`bg-white/50 border-indigo-200 ${errors.difficulty ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                {errors.difficulty && <p className="text-red-500 text-sm">{errors.difficulty}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={prevStep} variant="outline" className="border-indigo-300 text-indigo-700">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={generateWorkoutPlan}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                <Activity className="w-4 h-4 mr-2" /> Generate Workout
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Step 5: Workout Plan */}
      {step === 5 && workoutPlan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className={cardStyle}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="text-2xl text-indigo-900">Your Personalized Workout Plan</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-400">
                    <Target className="w-3 h-3" />
                    {workoutPlan.goal.charAt(0).toUpperCase() + workoutPlan.goal.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-purple-600 border-purple-400">
                    <Activity className="w-3 h-3" />
                    {workoutPlan.type.charAt(0).toUpperCase() + workoutPlan.type.slice(1).replace(/-/g, " ")}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-400">
                    <Clock className="w-3 h-3" />
                    {workoutPlan.duration} min
                  </Badge>
                </div>
              </div>
              <p className="text-indigo-700 mt-2">
                Difficulty: {workoutPlan.difficulty.charAt(0).toUpperCase() + workoutPlan.difficulty.slice(1)}
              </p>
            </CardHeader>
            <CardContent>
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="space-y-4"
              >
                {workoutPlan.exercises.map((exercise, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Card className="bg-white/60 border-indigo-200 overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-lg text-indigo-900">{exercise.name}</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-indigo-600"
                                  onClick={() => showExerciseGuidance(exercise)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View exercise guidance</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          {exercise.sets && (
                            <div className="bg-indigo-100 rounded p-2">
                              <p className="text-xs text-indigo-600">Sets</p>
                              <p className="font-medium text-indigo-900">{exercise.sets}</p>
                            </div>
                          )}
                          {exercise.reps && (
                            <div className="bg-indigo-100 rounded p-2">
                              <p className="text-xs text-indigo-600">Reps</p>
                              <p className="font-medium text-indigo-900">{exercise.reps}</p>
                            </div>
                          )}
                          {exercise.rest && (
                            <div className="bg-indigo-100 rounded p-2">
                              <p className="text-xs text-indigo-600">Rest</p>
                              <p className="font-medium text-indigo-900">{exercise.rest}</p>
                            </div>
                          )}
                          {exercise.duration && (
                            <div className="bg-indigo-100 rounded p-2">
                              <p className="text-xs text-indigo-600">Duration</p>
                              <p className="font-medium text-indigo-900">{exercise.duration}</p>
                            </div>
                          )}
                          {exercise.intensity && (
                            <div className="bg-indigo-100 rounded p-2">
                              <p className="text-xs text-indigo-600">Intensity</p>
                              <p className="font-medium text-indigo-900">{exercise.intensity}</p>
                            </div>
                          )}
                          {exercise.muscleGroup && (
                            <div className="bg-indigo-100 rounded p-2">
                              <p className="text-xs text-indigo-600">Target</p>
                              <p className="font-medium text-indigo-900">{exercise.muscleGroup}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between gap-4">
              <div className="flex gap-2">
                <Button onClick={() => setStep(6)} variant="outline" className="border-indigo-300 text-indigo-700">
                  Provide Feedback
                </Button>
                <Button onClick={saveWorkoutPlan} variant="outline" className="border-indigo-300 text-indigo-700">
                  <Save className="w-4 h-4 mr-2" /> Save Plan
                </Button>
              </div>
              <Button
                onClick={() => setStep(0)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Create New Plan
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Step 6: Feedback */}
      {step === 6 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className={cardStyle}>
            <CardHeader>
              <CardTitle className="text-indigo-900">Workout Feedback</CardTitle>
              <CardDescription className="text-indigo-700">
                Let us know what you think about your workout plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-indigo-900">How satisfied are you with this workout plan?</Label>
                <RadioGroup value={satisfaction} onValueChange={setSatisfaction} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="very-satisfied" id="very-satisfied" className="text-indigo-600" />
                    <Label htmlFor="very-satisfied" className="text-indigo-900">
                      Very Satisfied
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="satisfied" id="satisfied" className="text-indigo-600" />
                    <Label htmlFor="satisfied" className="text-indigo-900">
                      Satisfied
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="neutral" id="neutral" className="text-indigo-600" />
                    <Label htmlFor="neutral" className="text-indigo-900">
                      Neutral
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unsatisfied" id="unsatisfied" className="text-indigo-600" />
                    <Label htmlFor="unsatisfied" className="text-indigo-900">
                      Unsatisfied
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-indigo-900">
                  Additional Comments
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us what you liked or how we can improve your plan..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px] bg-white/50 border-indigo-200"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={submitFeedback}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Submit Feedback
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Step 7: Thank You */}
      {step === 7 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className={`${cardStyle} text-center`}>
            <CardHeader>
              <CardTitle className="text-indigo-900">Thank You!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-indigo-700">
                Thank you for your feedback. We appreciate your input and will use it to improve our workout
                recommendations.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => setStep(0)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Create Another Plan
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

