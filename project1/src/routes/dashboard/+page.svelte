<script> 
import { db } from "../../lib/firebase/firebase";
import { getFile, uploadFile } from '../../store/store';
import { authHandlers, authStore } from "../../store/store";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { writable, get} from 'svelte/store';
import { onMount } from 'svelte';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { goto } from '$app/navigation';


  const storage = getStorage(); // Initialize Firebase Storage
  let fileLinks = writable([]); // Stores links to display in the UI
  let loading = writable(false);
  let error = writable(false);
let uploadClicked = writable(false);
  let selectedFile = writable(null);;
  let uploaded = writable(null);
  let inputRef;
  let fileUrl = '';

  const handleSubmit = async (event) => {
    uploadClicked.set(true);
    event.preventDefault();
    error.set(false);
    try {
      const auth = get(authStore);
      if (!auth.user) {
        error.set(true);
        uploadClicked.set(false);
        throw new Error('User is not authenticated');
      }
      const folder = `${auth.user.uid}/`;
      const imagePath = await uploadFile(selectedFile, folder);
      uploadClicked.set(false);
      const imageUrl = await getFile(imagePath);
      uploaded.set(imageUrl);
      uploaded.set(fileUrl);
      console.log('File uploaded successfully:', imageUrl);
    } catch (err) {
      uploadClicked.set(false);
      console.error('File upload failed', err);
      error.set(true);
    }
  };

  async function saveData() {
    try {
      const auth = get(authStore);
      if (!auth.user) {
        throw new Error('User is not authenticated');
      }

      const userRef = doc(db, "users", auth.user.uid);
      await setDoc(userRef, {
        files: fileUrl // Assuming fileUrl contains the URL of the uploaded file
      }, { merge: true });

      console.log("File info saved successfully!");
    } catch (err) {
      console.error("There was an error saving your information", err);
      error.set(false);
    }
  }
  async function fetchFiles(startAfter = 0, limit = 10) {
    loading.set(true);
    error.set(false);
    fileLinks.set([]);

    const auth = get(authStore);
    console.log('Auth state:', auth);

    if (!auth || !auth.user || !auth.user.uid) {
        console.error('User is not authenticated');
        error.set(true);
        loading.set(false);
        return;
    }

    const userFolderRef = ref(storage, `${auth.user.uid}/`);
    console.log('Firebase Storage Path:', userFolderRef);

    try {
        const result = await listAll(userFolderRef);
        console.log('Files in Folder:', result.items);

        const urlPromises = result.items.map(itemRef => getDownloadURL(itemRef));
        const urls = await Promise.all(urlPromises);
        console.log('Fetched URLs:', urls);

        fileLinks.set(urls);
    } catch (err) {
        console.error('Error fetching files:', err);
        error.set(true);
    } finally {
        loading.set(false);
    }
}

let selectedFileUrl = writable(null);

function selectFile(url) {
    selectedFileUrl.set(url);
  }
  function goToVisualizePage() {
    const url = get(selectedFileUrl);
    if (url) {
      sessionStorage.setItem('selectedFileUrl', url); // Store selected file in sessionStorage
      goto(`/chartboard?fileUrl=${encodeURIComponent(url)}`); // Navigate to visualization page
    }
}

  onMount(fetchFiles);

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
<p>To upload a new file, chose the file then click upload.</p>
<p>To select your file, click fetch files then select. Click visualize to start graphing! </p>
<p>Accepted files: csv, json, xml, xlsx, xls</p>
<input
  id="file-upload"
      type="file"
      bind:this={inputRef}
      on:change={(e) => {
        selectedFile = e.target.files[0];
      }}
    />
    <button class="uploadButton { $uploadClicked ? 'clicked' : '' }" type="button" on:click={handleSubmit}>
      Upload
    </button>  
    <button class="fetchButton" on:click={fetchFiles} disabled={$loading}>Fetch My Files</button>
    {#if $loading}
      <p>Loading files  <i class="fa-solid fa-spinner loadingSpinner" /> </p>
    {/if}
    {#if $error}
      <p>Error fetching files. Please try again.</p>
    {/if}
    {#if $fileLinks.length > 0}
      <div>
        <h3>Your Files:</h3>
        
        <ul class="file-list">
          {#each $fileLinks as fileLink}
            <li class="file-item">
              <div class="file-actions">
                <div class = "viewFiles">
                <a href={fileLink} target="_blank">View File</a>
                <button 
                class="selectButton {fileLink === $selectedFileUrl ? 'selected' : ''}" 
                on:click={() => selectFile(fileLink)}>
                Select
              </button>
            </div>
              </div>
            </li>
          {/each}
        </ul>
         
      </div>
    {/if}
    <button class = "button" on:click={goToVisualizePage} disabled={$selectedFileUrl === null}>
      Visualize
    </button>
    {#if $uploaded}
      <img src={$uploaded} class="my-5 max-w-[400px]" alt="upload file" />
    {/if}
  </div>
  
  <svelte:head>
    <title>Upload File</title>
  </svelte:head>

 <style>
  #file-upload {
    font-family: "Arapey", serif;
  }
 .mainContainer {
  font-family:  "Arapey", serif;
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
      font-family:  "Arapey", serif;
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
  font-family:  "Arapey", serif;
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
    .fetchButton {
      font-family:  "Arapey", serif;
        background: darkorchid;
        color: white;
        border: none;
        padding: 14px 0;
        width: 20%;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        display: grid;
        place-items: center;
    }

   .fetchButton:hover {
        background: plum;
    }
    .uploadButton {
      font-family:  "Arapey", serif;
        background: darkorchid;
        color: white;
        border: none;
        padding: 14px 0;
        width: 20%;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        display: grid;
        place-items: center;
    }
    .uploadButton.clicked {
      background: plum;
    }
   .uploadButton:hover {
        background: plum;
    }
 ul {
  list-style-type: upper-greek;
  color:#f0f0f0;
}
.file-list li {
    width: 20%;
    justify-content: center;
    padding: 2px;
    border-radius: 1px;
  }

  .file-list a {
    text-decoration: none; 
    color: white;
    font-weight: bold;
  }

  .file-list a:hover {
    color: deeppink; 
    text-decoration: underline;
  }
  .selectButton {
    background: darkorchid;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .selectButton:hover {
    background: plum;
  }

  .selectButton.selected {
    background: deeppink;
    color: white;
  }
  .loadingSpinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    .viewFiles {
        display: flex;
        gap: 8px;
    }
</style>