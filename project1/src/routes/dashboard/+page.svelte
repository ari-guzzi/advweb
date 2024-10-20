<script> 
import { db } from "../../lib/firebase/firebase";
import { getFile, uploadFile } from '../../store/store';
import { authHandlers, authStore } from "../../store/store";
import { doc, setDoc } from "firebase/firestore";
import { writable, get} from 'svelte/store';


let selectedFile = null;
let uploaded = writable(null);
  let inputRef;
  let error = false;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const folder = "";//get userID path here to ave "attached" to user
    try {
      const auth = get(authStore);
      console.log(auth);
      if (!auth.user) {
        throw new Error('User is not authenticated');
      }
      const imagePath = await uploadFile(selectedFile, folder);
      const imageUrl = await getFile(imagePath);
      uploaded.set(imageUrl);
    } catch (err) {
      console.error('File upload failed', err);
      error = true;
    }
  };


  async function saveData() {
        try {
            const userRef = doc(db, "users", $authStore.user.uid);
            await setDoc(
                userRef,
                {
                    files: fileInput,
                },
                { merge: true }
            );
        } catch (err) {
            console.log("There was an error saving your information");
            error = true;
        }
    }

</script>
<div class="mainContainer">
    <div class="headerContainer">
        <h1>Upload Dataset</h1>
     <div class="headerBtns">
      <button on:click={saveData}>
          <i class="fa-regular fa-floppy-disk" />
          <p>Save</p></button
      >
      <button on:click={authHandlers.logout}>
          <i class="fa-solid fa-right-from-bracket" />
          <p>Logout</p></button
      >
  </div>
</div>
<input
      type="file"
      bind:this={inputRef}
      on:change={(e) => {
        selectedFile = e.target.files[0];
      }}
    />
    <button class="button" type="button" on:click={handleSubmit}>
      Submit
    </button>
    {#if $uploaded}
      <img src={$uploaded} class="my-5 max-w-[400px]" alt="upload file" />
    {/if}
  </div>
  
  <svelte:head>
    <title>Upload File</title>
  </svelte:head>
     <!-- <form on:submit={handleSubmit}>
        <div class="group">
          <label for="file">Upload your file</label>
          <input
            type="file"
            id="file"
            name="fileToUpload"
            accept=".jpg, .jpeg, .png, .webp"
            bind:this={fileInput}
            required
          />
        </div>
      
        <button type="submit">Submit</button>
      </form> -->


 <style>
 .mainContainer {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    gap: 24px;
    padding: 24px;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
}
.headerBtns {
        display: flex;
        align-items: center;
        gap: 14px;
    }
    .headerContainer button {
        background: darkorchid;
        color: white;
        padding: 10px 18px;
        border: none;
        border-radius: 4px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
    }

    .headerContainer button i {
        font-size: 1.1rem;
    }

    .headerContainer button:hover {
        opacity: 0.7;
    }
.headerContainer {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.button {
        background: darkorchid;
        color: white;
        border: none;
        padding: 14px 0;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        display: grid;
        place-items: center;
    }

   .button:hover {
        background: plum;
    }
</style>