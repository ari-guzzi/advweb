import React, { useState, useEffect } from 'react';

const addCalories = (exercises, setTotalCalories) => {
    let total = 0;
    exercises.forEach((exercise) => {
        total += parseInt(exercise.calories, 10); // Make sure calories are treated as integers
    });
    setTotalCalories(total);
};

function ExerciseLog({ exercises, deleteExercise }) {
    const [totalCalories, setTotalCalories] = useState(0);
    
    useEffect(() => {
        addCalories(exercises, setTotalCalories);
    }, [exercises]);

  return (
    <div>
      {exercises.map((exercise, index) => (
        <div key={index}>
            <div class = "exercisetype">
            <ExerciseItem type={exercise.type} duration={exercise.duration} calories={exercise.calories} />
          <button onClick={() => deleteExercise(index)}>Delete Exercise</button>
          </div>
        </div>
      ))}
      <h2>Total Calories Burned: {totalCalories}</h2>
    </div>
  );
}
function ExerciseItem({type, duration, calories}) {
    return ( <>
        <p>Type: {type}</p>
        <p>Duration: {duration} minutes</p>
        <p>Calories Burned: {calories}</p>
        </>
    )
}
export default ExerciseLog;
