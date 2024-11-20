import React from 'react';
import ExerciseForm from './ExerciseForm';
import ExerciseLog from './ExerciseLog'; 

function App() {
  const [exercises, setExercises] = React.useState([]);

  const addExercise = (exerciseData) => {
    setExercises([...exercises, exerciseData]);
  };
  const deleteExercise = (index) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
};

  return (
    <div>
      <h1>Fitness Log Created with React.js!</h1>
      <p>
        My 3 components are my app, the exercise form, and the exercise log.
        The exercise log is re-used with differing props. <br/>
        My two pieces of state are an array of exercises and a total calories counter. <br/>
      </p>
      <ExerciseForm addExercise={addExercise} />
      <ExerciseLog exercises={exercises} deleteExercise={deleteExercise} />

    </div>
  );
}

export default App;
