//import _ from 'lodash';

  function fetchBear() {
            const width = Math.floor(Math.random() * 301) + 600;  
            const height = Math.floor(Math.random() * 301) + 600; 
            //random widths and heights between 300 and 600

            const imageUrl = `https://placebear.com/${width}/${height}`;

            const img = new Image(width, height);
            img.src = imageUrl;
            img.alt = 'A random bear image';

       
            const container = document.getElementById('bearContainer');
            container.innerHTML = ''; //remove previous image
            container.appendChild(img);
        }