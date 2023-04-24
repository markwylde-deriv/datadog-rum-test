# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files into the container
COPY package*.json ./

RUN npm install

# Copy the rest of the application files into the container
COPY . .

# Expose the port on which the application will run
EXPOSE 8022

# Start the application
CMD ["npm", "start"]
