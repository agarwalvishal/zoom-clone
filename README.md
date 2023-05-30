# Zoom Clone

A zoom clone app built using peerjs.

## Demo App
[https://zoom-clone.herokuapp.com/](https://zoom-clone.herokuapp.com/)

## Available Scripts

In order to use the docker scripts below, make sure you have the docker daemon running before executing the scripts in the project directory.

If you do not have docker installed, you may use the given npm scripts instead.

### Development builds
---

#### `docker compose up`

Runs the app in development mode.\
Open [http://localhost:8080](http://localhost:8080) to view it in your browser.
> **Note:**  The port can be configured by setting it to an appropriate value in the `.env` file.

The page will reload when you make changes.

#### `npm run dev`

Runs the app in development mode with nodemon.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.

### Production builds
---

#### `docker build --target production -t <tag_name> . `

Builds the production image.

#### `docker run -e PORT=<port> -p <port>:<port> <image_id>`

Runs the image built in the previous step.

Set `PORT` to be the port you want to pass in as the environment variable for the server to run on and also pass the port value to `<port>:<port>` to map `host_port` to the `container_port` respectively.

**Note:**
> `host_port` and `container_port` need to be the same in this case as the client side of the app running on the host machine makes requests to the server running inside the container to create new peers. Setting different ports will cause the client running on the host machine to make requests on the `host_port` which will not match with the container's exposed port `container_port`, thus throwing an error.

**Example:** 
> `docker build --target production -t agarwalvishal/zoom-clone:1.0 . `\
> `docker run -e PORT=8080 -p 8080:8080 <image_id>` 

Runs the app in production mode.\
Open [http://localhost:8080](http://localhost:8080) to view it in your browser.

#### `npm start`

Runs the app in production mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Deployment to Heroku
---

Deployment uses a heroku.yml file which uses Dockerfile.prod to create our image for deployment.

> **Note:** heroku.yml doesn't support running a specific target stage in a multistage Dockerfile and runs the whole Dockerfile instead. Therefore it uses a separate *Dockerfile.prod* here.

Run the following commands to deploy the app to heroku and open it.

	heroku create zoom-clone
	heroku stack:set container
	git push heroku <local-branch-name>:main
	heroku open
    
> **Note:** Using `git push heroku main` instead of `git push heroku <local-branch-name>:main` above pushes the local master branch by default.
