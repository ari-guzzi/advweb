<script>
    import { onMount } from "svelte";
    import { auth, db } from "../lib/firebase/firebase";
    import { getDoc, doc, setDoc } from "firebase/firestore";
    import { authStore } from "../store/store";

    const nonAuthRoutes = ["/", "product"];

     onMount(() => {
        console.log("Mounting");
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            const currentPath = window.location.pathname;

            if (!user && !nonAuthRoutes.includes(currentPath)) {
                window.location.href = "/";
                return;
            }

            if (user && currentPath === "/") {
                window.location.href = "/dashboard";
                return;
            }

            if (!user) {
                return;
            }
            let files;
            let dataToSetToStore;
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                console.log("Creating User");
                const userRef = doc(db, "users", user.uid);
                dataToSetToStore = {
                    email: user.email,
                    files: [],
                };
                await setDoc(userRef, dataToSetToStore, { merge: true });
            } else {
                console.log("Fetching User");
                const userData = docSnap.data();
                dataToSetToStore = userData;
            }

            authStore.update((curr) => {
                return {
                    ...curr,
                    user,
                    data: dataToSetToStore,
                    loading: false,
                };
            });
        });
        return unsubscribe;
    });
</script>

<div class = "mainContainer">
    <slot/>
</div>

<style>
    .mainContainer {
       min-height: 100vh;
        background: rgb(190, 138, 190); /*linear-gradient(to right, rgb(190, 138, 190), pink); */
       color: white;
       position: relative;
       display: flex;
       flex-direction: column;
    }
</style>