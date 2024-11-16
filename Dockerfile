# Step 1: Use an official Node.js runtime as the base image
FROM node:16

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json to the working directory
# This allows Docker to install dependencies first before copying the rest of the app files (for caching purposes)
COPY package*.json ./

# Step 4: Install backend dependencies
RUN npm install

# Step 5: Copy the entire application code into the container
COPY . .

# Step 6: Expose the port that the app will run on (default is 5000 for Express)
# EXPOSE 5000
# Expose the port the app runs on (80 for frontend or 3000 for backend, as an example)
EXPOSE 80

# Step 7: Set environment variables if needed (can also be passed at runtime)
# You can set specific environment variables like NODE_ENV here, or you can pass them when running the container.

# Step 8: Run the backend application (e.g., with `npm start`)
CMD ["npm", "start"]
