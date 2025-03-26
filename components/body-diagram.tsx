"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BodyDiagram({ selectedMuscleGroups, onMuscleGroupSelect }) {
  const [view, setView] = useState("front")
  
  // Mapping of muscle groups to their corresponding body parts
  const muscleGroupMapping = {
    "Upper Body Push": ["chest", "frontShoulders", "triceps"],
    "Upper Body Pull": ["upperBack", "lats", "biceps"],
    "Lower Body Push": ["quads", "calves"],
    "Lower Body Pull": ["hamstrings", "glutes"],
    "Core": ["abs", "obliques", "lowerBack"],
    "Arms": ["biceps", "triceps", "forearms"],
    "Shoulders": ["frontShoulders", "rearShoulders"],
  }

  // Check if a body part is selected (part of a selected muscle group)
  const isBodyPartSelected = (bodyPart) => {
    for (const [group, parts] of Object.entries(muscleGroupMapping)) {
      if (parts.includes(bodyPart) && selectedMuscleGroups.includes(group)) {
        return true
      }
    }
    return false
  }

  // Find which muscle group a body part belongs to
  const getMuscleGroupForBodyPart = (bodyPart) => {
    for (const [group, parts] of Object.entries(muscleGroupMapping)) {
      if (parts.includes(bodyPart)) {
        return group
      }
    }
    return null
  }

  const handleBodyPartClick = (bodyPart) => {
    const group = getMuscleGroupForBodyPart(bodyPart)
    if (group) {
      onMuscleGroupSelect(group)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-indigo-100 p-4">
      <Tabs defaultValue="front" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="front" onClick={() => setView("front")}>
            Front View
          </TabsTrigger>
          <TabsTrigger value="back" onClick={() => setView("back")}>
            Back View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="front" className="flex justify-center">
          <div className="relative w-full max-w-xs">
            <svg viewBox="0 0 400 600" className="w-full h-auto">
              {/* Base body outline - simplified, cleaner version */}
              <path 
                d="M200,50 C230,50 250,70 250,100 C250,130 240,150 240,170 C240,190 250,210 250,230 C250,250 240,270 240,290 C240,310 230,330 220,350 C210,370 210,390 210,410 C210,430 220,450 220,470 C220,490 210,510 200,530 C190,510 180,490 180,470 C180,450 190,430 190,410 C190,390 190,370 180,350 C170,330 160,310 160,290 C160,270 150,250 150,230 C150,210 160,190 160,170 C160,150 150,130 150,100 C150,70 170,50 200,50" 
                fill="#f5f5f5" 
                stroke="#d1d5db" 
                strokeWidth="1.5" 
              />
              
              {/* Head */}
              <circle cx="200" cy="40" r="30" fill="#f5f5f5" stroke="#d1d5db" strokeWidth="1.5" />
              
              {/* Chest */}
              <path 
                id="chest" 
                d="M170,140 C180,130 220,130 230,140 C235,150 235,170 230,180 C220,190 180,190 170,180 C165,170 165,150 170,140" 
                fill={isBodyPartSelected("chest") ? "#a5b4fc" : "#e2e8f0"}
                stroke={isBodyPartSelected("chest") ? "#6366f1" : "#cbd5e1"}
                strokeWidth="1.5"
                className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                onClick={() => handleBodyPartClick("chest")}
              />
              
              {/* Front Shoulders */}
              <path 
                id="frontShoulders" 
                d="M150,120 C155,110 165,105 175,110 C180,115 180,125 175,130 C170,135 155,135 150,130 C145,125 145,115 150,120 M250,120 C245,110 235,105 225,110 C220,115 220,125 225,130 C230,135 245,135 250,130 C255,125 255,115 250,120" 
                fill={isBodyPartSelected("frontShoulders") ? "#a5b4fc" : "#e2e8f0"}
                stroke={isBodyPartSelected("frontShoulders") ? "#6366f1" : "#cbd5e1"}
                strokeWidth="1.5"
                className="cursor-pointer hover:fill-indigo-200 transition-colors duration-200"
                onClick={() => handleBodyPartClick("frontShoulders")}
              />
              
              {/* Biceps */}
              <path 
                id="biceps" 
                d="M145,150 C140,160 135,180 140,190 C145,195 155,195 160,190 C165,180 165,160 160,150 C155,145 150,145 145,150 M255,150 C260,160 265,180 260,190 C255,195 245,195 240,190 C235,180 235\

