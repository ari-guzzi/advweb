import React, { useState } from 'react';

function ExerciseForm({ addExercise }) {
  const [exerciseType, setExerciseType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if all fields are filled
    if (!exerciseType || !duration || !calories) return;
    const exerciseData = {
      type: exerciseType,
      duration: duration,
      calories: calories
    };
    addExercise(exerciseData); // Pass this data to the App component
    setExerciseType('');
    setDuration('');
    setCalories('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type of Exercise"
        value={exerciseType}
        onChange={(e) => setExerciseType(e.target.value)}
      />
      <input
        type="number"
        placeholder="Duration (in minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <input
        type="number"
        placeholder="Calories Burned"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
      />
      <button type="submit">Add Exercise</button>
    </form>
  );
}

export default ExerciseForm;
